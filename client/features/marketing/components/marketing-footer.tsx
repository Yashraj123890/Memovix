import Link from "next/link";
import { LOGIN_ROUTE } from "@/constants/routes";

const FOOTER_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Log in", href: LOGIN_ROUTE },
];

export function MarketingFooter() {
  return (
    <footer className="border-border border-t py-12">
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-6 px-6">
        <Link href="#top" className="flex items-center gap-2.5">
          <span
            className="border-border size-5 rounded-md border"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, var(--primary), transparent 60%), radial-gradient(circle at 75% 72%, var(--success), transparent 60%), var(--card)",
            }}
            aria-hidden="true"
          />
          <span className="font-display text-lg font-semibold">Memovix</span>
        </Link>

        <nav className="text-muted-foreground flex flex-wrap gap-x-7 gap-y-2 text-sm">
          {FOOTER_LINKS.map((link) =>
            link.href.startsWith("#") ? (
              <a key={link.label} href={link.href} className="hover:text-foreground transition-colors">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={link.href} className="hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <span className="text-muted-foreground/70 font-mono text-xs">© 2026 Memovix</span>
      </div>
    </footer>
  );
}
