import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LOGIN_ROUTE, REGISTER_ROUTE } from "@/constants/routes";

const NAV_LINKS = [
  { label: "Product", href: "#problem" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function MarketingNav() {
  return (
    <header className="border-border bg-background/70 sticky top-0 z-30 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between px-6">
        <Link href="#top" className="flex items-center gap-2.5">
          <span
            className="border-border size-6 rounded-lg border"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, var(--primary), transparent 60%), radial-gradient(circle at 75% 72%, var(--success), transparent 60%), var(--card)",
            }}
            aria-hidden="true"
          />
          <span className="font-display text-xl font-semibold tracking-tight">Memovix</span>
        </Link>

        <nav className="text-muted-foreground hidden items-center gap-8 text-sm font-medium md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-foreground transition-colors">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={LOGIN_ROUTE}
            className="text-muted-foreground hover:text-foreground hidden text-sm font-semibold transition-colors sm:inline"
          >
            Log in
          </Link>
          <Button asChild className="rounded-full">
            <Link href={REGISTER_ROUTE}>Start free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
