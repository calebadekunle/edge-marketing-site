import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function KeyDirectoryRow({
  name,
  configured,
  detail,
  href,
}: {
  name: string;
  configured: boolean;
  detail: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 p-5 hover:bg-panel-soft/40 transition-colors group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className={`h-2 w-2 rounded-full shrink-0 ${configured ? "bg-signal" : "bg-alert"}`} />
        <div className="min-w-0">
          <p className="text-sm text-mist">{name}</p>
          <p className="text-xs text-ash truncate">{detail}</p>
        </div>
      </div>
      <ArrowRight size={15} className="text-ash group-hover:text-signal transition-colors shrink-0" />
    </Link>
  );
}
