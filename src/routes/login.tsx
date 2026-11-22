import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-dvh place-items-center bg-desk px-6">
      <div className="w-full max-w-sm">
        <p lang="en" className="font-mono text-xs tracking-wide text-brass">
          Sign in
        </p>
        <h1 className="mt-1 font-serif text-3xl text-fg">登录后才进广场</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          不提供匿名账号。广场上不愿意写本名的人，统一显示 momo。赞、评论、试卷成绩和档案奖励都记在这个账号上。
        </p>
        <div className="mt-5 flex flex-col gap-2">
          {authEnabled ? (
            GROK_PROVIDERS.map((provider) => (
              <button
                key={provider.providerId}
                type="button"
                onClick={() => signIn(provider.providerId, { callbackURL: "/" })}
                className="min-h-12 rounded-xl bg-seal text-sm text-onseal"
              >
                <span lang="en">Continue with {provider.label}</span>
              </button>
            ))
          ) : (
            <p className="text-sm text-muted">登录还没打开。</p>
          )}
        </div>
        <Link to="/" className="mt-4 inline-block text-sm text-seal">
          先回首页看看
        </Link>
      </div>
    </main>
  );
}
