import { createServerFn } from "@tanstack/react-start";

export type HotItem = { title: string; href: string; heat: string; source: "微博" | "百度" };

export const loadBoards = createServerFn({ method: "GET" }).handler(async (): Promise<{
  weibo: HotItem[];
  baidu: HotItem[];
  weiboAt: string;
  note: string;
}> => {
  const [weibo, baidu] = await Promise.all([readWeibo(), readBaidu()]);
  const note = [
    weibo.items.length ? `微博更新于 ${weibo.at}` : "微博榜这次没有取到",
    baidu.items.length ? "百度实时榜已更新" : "百度榜这次没有取到",
  ].join(" · ");
  return { weibo: weibo.items, baidu: baidu.items, weiboAt: weibo.at, note };
});

async function readWeibo(): Promise<{ items: HotItem[]; at: string }> {
  try {
    const res = await fetch("https://dabenshi.cn/other/api/hot.php?type=weibo", {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { items: [], at: "" };
    const body = (await res.json()) as { update_time?: string; data?: { title?: string; hot?: string; url?: string }[] };
    const items = (body.data ?? [])
      .map((item) => toItem(item.title, item.url, item.hot || "", "微博"))
      .filter((item): item is HotItem => Boolean(item))
      .slice(0, 8);
    return { items, at: String(body.update_time ?? "") };
  } catch {
    return { items: [], at: "" };
  }
}

async function readBaidu(): Promise<{ items: HotItem[] }> {
  try {
    const res = await fetch("https://top.baidu.com/api/board?platform=wise&tab=realtime", {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { items: [] };
    const body = (await res.json()) as {
      data?: { cards?: { content?: { content?: { word?: string; url?: string; hotScore?: string }[] }[] }[] };
    };
    const rows = body.data?.cards?.[0]?.content?.[0]?.content ?? [];
    const items = rows
      .map((item) => toItem(item.word, item.url, item.hotScore || "", "百度"))
      .filter((item): item is HotItem => Boolean(item))
      .slice(0, 8);
    return { items };
  } catch {
    return { items: [] };
  }
}

function toItem(title: unknown, href: unknown, heat: string, source: "微博" | "百度"): HotItem | null {
  const name = String(title ?? "").trim().slice(0, 42);
  const link = String(href ?? "").trim();
  if (name.length < 2) return null;
  if (!/^https:\/\//.test(link)) return null;
  return { title: name, href: link, heat: heat.slice(0, 16), source };
}
