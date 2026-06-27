"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
      className={className || "flex items-center gap-1.5 text-xs text-ash hover:text-alert transition-colors"}
    >
      <LogOut size={13} />
      Log out
    </button>
  );
}
