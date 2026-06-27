import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <span className="text-2xl font-bold text-signal">EDGE</span>
        <span className="ml-2 text-xs font-semibold uppercase tracking-[0.18em] text-ash">
          Admin
        </span>
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
