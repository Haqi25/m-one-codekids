import Link from "next/link";

export function Logo({ href = "/", className = "" }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2 font-display text-2xl font-extrabold text-navy ${className}`}>
      <span aria-hidden className="grid size-10 place-items-center rounded-2xl bg-orange text-xl text-white shadow-pop-sm">
        {"</>"}
      </span>
      <span>
        Code<span className="text-orange-700">Kids</span>
      </span>
    </Link>
  );
}

