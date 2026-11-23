import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Inter_Tight } from "next/font/google";
import { SITE_NAME, SITE_URL, TAGLINE } from "@/lib/site";
import { Logo } from "@/components/Logo";
import { FROM_PRICE } from "@/lib/products";
import { Analytics } from "@vercel/analytics/next";
import { Tracker } from "@/components/Tracker";
import "./globals.css";

const display = Inter_Tight({ variable: "--font-display", subsets: ["latin"], weight: ["600", "700"] });
const body = Inter({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}: independent personal trainers near you`, template: `%s | ${SITE_NAME}` },
  description:
    "Train Local helps you find independent personal trainers, Pilates instructors and small studios near you, or online. Compare specialisms and reviews.",
  applicationName: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    title: `${SITE_NAME}: ${TAGLINE}`,
    description: "Find independent personal trainers, Pilates instructors and small studios near you, or online.",
    locale: "en_GB",
    type: "website",
  },
  twitter: { card: "summary", title: `${SITE_NAME}: ${TAGLINE}` },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body className={`${display.variable} ${body.variable} antialiased min-h-screen flex flex-col`}>
        <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
          <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
            <Link href="/" aria-label="Home"><Logo /></Link>
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link href="/trainers?online=1" className="text-muted hover:text-ink">Online</Link>
              <Link href="/locations" className="hidden text-muted hover:text-ink sm:inline">Locations</Link>
              <Link href="/shop" className="text-muted hover:text-ink">Plans <span className="ml-1 hidden rounded-full bg-zap px-2 py-0.5 text-xs font-semibold text-accent sm:inline">from {FROM_PRICE}</span></Link>
              <Link href="/trainers" className="btn px-4 py-2">Find a trainer</Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-paper/10 bg-ink text-paper">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-[2fr_1fr_1fr]">
            <div>
              <Logo light />
              <p className="mt-3 max-w-sm text-sm text-paper/60">
                {TAGLINE} Find someone who gets your goals, then go and smash them.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <p className="eyebrow text-paper/50">Find</p>
              <Link href="/trainers" className="text-paper/70 hover:text-paper">Search trainers</Link>
              <Link href="/locations" className="text-paper/70 hover:text-paper">By location</Link>
              <Link href="/trainers?online=1" className="text-paper/70 hover:text-paper">Online coaching</Link>
              <Link href="/shop" className="text-paper/70 hover:text-paper">Training plans</Link>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <p className="eyebrow text-paper/50">Your data</p>
              <Link href="/remove" className="text-paper/70 hover:text-paper">Remove or correct a listing</Link>
              <Link href="/privacy" className="text-paper/70 hover:text-paper">Privacy</Link>
              <Link href="/shop/terms" className="text-paper/70 hover:text-paper">Shop terms</Link>
            </div>
          </div>
          <p className="border-t border-paper/10 px-4 py-4 text-center text-xs text-paper/40">
            © {new Date().getFullYear()} {SITE_NAME}
          </p>
        </footer>
        <Tracker />
        <Analytics />
      </body>
    </html>
  );
}
