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
// Red Hat Display (variable weight) is used for both headings and body text, so one small file covers the whole site.
const redHat = localFont({ variable: "--font-red-hat", display: "swap", src: "../fonts/red-hat-display-latin-wght-normal.woff2", weight: "300 900" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}: UK personal trainer directory`, template: `%s | ${SITE_NAME}` },
  description:
    "Find independent personal trainers, Pilates instructors and small studios near you, or online, across the UK. Compare specialisms, then contact them directly.",
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
      <body className={`${redHat.variable} antialiased min-h-screen flex flex-col`}>
        <a href="#main" className="sr-only z-50 bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:left-2 focus:top-2">Skip to content</a>
        <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
          <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
            <Link href="/" aria-label="Home"><Logo /></Link>
            {/* Fits a 320px-wide phone: tighter gaps, a short "Search" button label on phones, and Articles from
                350px up. Links get extra invisible padding (py-3 -my-3) so they're comfortable to tap. */}
            <div className="flex items-center gap-2 text-sm font-medium min-[385px]:gap-3.5 sm:gap-6">
              <Link href="/online" className="-my-3 py-3 text-muted hover:text-ink">Online</Link>
              <Link href="/locations" className="-my-3 hidden py-3 text-muted hover:text-ink sm:inline">Locations</Link>
              <Link href="/specialisms" className="-my-3 hidden py-3 text-muted hover:text-ink md:inline">Specialisms</Link>
              <Link href="/articles" className="-my-3 hidden py-3 text-muted hover:text-ink min-[350px]:inline">Articles</Link>
              <Link href="/shop" className="-my-3 py-3 text-muted hover:text-ink">Plans <span className="ml-1 hidden text-xs font-semibold text-accent sm:inline">from {FROM_PRICE}</span></Link>
              <ShortlistNavLink />
              <Link href="/trainers" className="btn whitespace-nowrap py-1 text-sm">
                <span className="sm:hidden">Search</span>
                <span className="hidden sm:inline">Find a trainer</span>
              </Link>
            </div>
          </nav>
        </header>
        <main id="main" tabIndex={-1} className="flex-1 outline-none">{children}</main>
        <footer className="border-t border-paper/10 bg-ink text-paper">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-[2fr_1fr_1fr]">
            <div>
              <Logo light />
              <p className="mt-3 max-w-sm text-sm text-paper/60">
                {TAGLINE} A UK personal trainer directory of self-employed PTs, Pilates instructors and small studios. No big gym chains.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <p className="eyebrow text-paper/50">Find</p>
              <Link href="/trainers" className="text-paper/70 hover:text-paper">Search trainers</Link>
              <Link href="/locations" className="text-paper/70 hover:text-paper">By location</Link>
              <Link href="/specialisms" className="text-paper/70 hover:text-paper">By specialism</Link>
              <Link href="/online" className="text-paper/70 hover:text-paper">Online coaching</Link>
              <Link href="/shop" className="text-paper/70 hover:text-paper">Training plans</Link>
              <Link href="/articles" className="text-paper/70 hover:text-paper">Articles</Link>
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
