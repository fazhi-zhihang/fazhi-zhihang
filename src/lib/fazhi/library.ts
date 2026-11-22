import data from "./library.json";

export type Article = { no: string; text: string };
export type LawBook = {
  id: string;
  title: string;
  source: string;
  official: string;
  fetched: string;
  articles: Article[];
};

export const LIBRARY = data as LawBook[];

const DICT = [
  "试用期",
  "竞业",
  "书面",
  "劳动合同",
  "经济补偿",
  "解除",
  "歧视",
  "性别",
  "妇女",
  "个人信息",
  "手机号",
  "仲裁",
  "时效",
  "社会保险",
  "工资",
  "保密",
  "服务期",
  "违约金",
  "培训",
  "加班",
  "女职工",
  "户籍",
  "婚育",
  "出境",
  "报酬",
  "证件",
  "担保",
  "中介",
  "协商",
  "调解",
];

export type Hit = { law: string; lawId: string; official: string; source: string; no: string; text: string };

export function findArticles(query: string, limit = 8): Hit[] {
  const keys = DICT.filter((word) => query.includes(word));
  const needles = keys.length > 0 ? keys : query.replace(/\s/g, "").length >= 2 ? [query.replace(/\s/g, "").slice(0, 12)] : ["劳动合同"];
  const scored: { score: number; hit: Hit }[] = [];
  for (const book of LIBRARY) {
    for (const article of book.articles) {
      const blob = `${article.no}${article.text}`;
      let score = 0;
      for (const key of needles) {
        if (blob.includes(key)) score += Math.min(key.length, 8);
      }
      if (score <= 0) continue;
      scored.push({
        score,
        hit: {
          law: book.title,
          lawId: book.id,
          official: book.official,
          source: book.source,
          no: article.no,
          text: article.text,
        },
      });
    }
  }
  scored.sort((a, b) => b.score - a.score || a.hit.no.localeCompare(b.hit.no, "zh"));
  return scored.slice(0, limit).map((item) => item.hit);
}

export function articlesOf(lawId: string): { title: string; official: string; source: string; articles: Article[] } | null {
  const book = LIBRARY.find((item) => item.id === lawId);
  if (!book) return null;
  return { title: book.title, official: book.official, source: book.source, articles: book.articles };
}
