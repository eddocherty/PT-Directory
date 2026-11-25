import type { Metadata } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import { INDEXABLE, SITE_NAME, SITE_URL, TAGLINE } from "@/lib/site";
import { Logo } from "@/components/Logo";
import { FROM_PRICE } from "@/lib/products";
import { Analytics } from "@vercel/analytics/next";
import { Tracker } from "@/components/Tracker";
import { ShortlistNavLink } from "@/components/Saved";
import "./globals.css";

// Fonts are bundled with the site (src/fonts) rather than fetched from Google at build time.
const display = localFont({
  variable: "--font-display",
  display: "swap",
  src: [
    { path: "../fonts/schibsted-grotesk-latin-700-normal.woff2", weight: "700" },
    { path: "../fonts/schibsted-grotesk-latin-800-normal.woff2", weight: "800" },
  ],
});
const body = localFont({ variable: "--font-body", display: "swap", src: "../fonts/inter-latin-wght-normal.woff2", weight: "100 900" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}: independent personal trainers near you`, template: `%s | ${SITE_NAME}` },
  description:
    "Find independent personal trainers, Pilates instructors and small studios near you, or online, across the UK. Compare specialisms and reviews, then contact them directly.",
  applicationName: SITE_NAME,
  robots: INDEXABLE ? undefined : { index: false, follow: false },
  openGraph: {
    siteName: SITE_NAME,
    title: `${SITE_NAME}: ${TAGLINE}`,
    description: "Find independent personal trainers, Pilates instructors and small studios near you, or online.",
    locale: "en_GB",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: `${SITE_NAME}: ${TAGLINE}` },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body className={`${display.variable} ${body.variable} antialiased min-h-screen flex flex-col`}>
        <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
          <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
            <Link href="/" aria-label="Home"><Logo /></Link>
            <div className="flex items-center gap-3.5 text-sm font-medium sm:gap-6">
              <Link href="/online" className="text-muted hover:text-ink">Online</Link>
              <Link href="/locations" className="hidden text-muted hover:text-ink sm:inline">Locations</Link>
              <Link href="/specialisms" className="hidden text-muted hover:text-ink md:inline">Specialisms</Link>
              <Link href="/shop" className="text-muted hover:text-ink">Plans <span className="ml-1 hidden text-xs font-semibold text-accent sm:inline">from {FROM_PRICE}</span></Link>
              <ShortlistNavLink />
              <Link href="/trainers" className="btn whitespace-nowrap py-1 text-sm">Find a trainer</Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-paper/10 bg-ink text-paper">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-[2fr_1fr_1fr]">
            <div>
              <Logo light />
              <p className="mt-3 max-w-sm text-sm text-paper/60">
                {TAGLINE} A UK directory of self-employed personal trainers, Pilates instructors and small studios. No big gym chains.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <p className="eyebrow text-paper/50">Find</p>
              <Link href="/trainers" className="text-paper/70 hover:text-paper">Search trainers</Link>
              <Link href="/locations" className="text-paper/70 hover:text-paper">By location</Link>
              <Link href="/specialisms" className="text-paper/70 hover:text-paper">By specialism</Link>
              <Link href="/online" className="text-paper/70 hover:text-paper">Online coaching</Link>
              <Link href="/shop" className="text-paper/70 hover:text-paper">Training plans</Link>
              <Link href="/guides" className="text-paper/70 hover:text-paper">Choosing a trainer</Link>
              <Link href="/match" className="text-paper/70 hover:text-paper">Find your training match</Link>
              <Link href="/tools" className="text-paper/70 hover:text-paper">Free tools</Link>
              <Link href="/shortlist" className="text-paper/70 hover:text-paper">Your shortlist</Link>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <p className="eyebrow text-paper/50">Your data</p>
              <Link href="/remove" className="text-paper/70 hover:text-paper">Remove or correct a listing</Link>
              <Link href="/privacy" className="text-paper/70 hover:text-paper">Privacy</Link>
              <Link href="/shop/terms" className="text-paper/70 hover:text-paper">Shop terms</Link>
            </div>
          </div>
          <p className="border-t border-paper/10 px-4 py-4 text-center text-xs text-paper/70">
            © {new Date().getFullYear()} {SITE_NAME}
          </p>
        </footer>
        <Tracker />
        <Analytics />
      </body>
    </html>
  );
}
