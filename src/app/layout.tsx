import type { Metadata } from "next";
import Link from "next/link";
import { Archivo, Inter } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { Logo } from "@/components/Logo";
import "./globals.css";

const display = Archivo({ variable: "--font-display", subsets: ["latin"], weight: ["800", "900"], style: ["italic", "normal"] });
const body = Inter({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}: find a personal trainer near you`, template: `%s | ${SITE_NAME}` },
  description:
    "Search personal trainers across the UK by location, training style and fitness goal. Compare reviews, prices and specialisms.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body className={`${display.variable} ${body.variable} antialiased min-h-screen flex flex-col`}>
        <div className="bg-accent px-4 py-1.5 text-center text-xs font-bold uppercase tracking-widest text-accent-ink">
          Free to search · Trainers across England, Scotland, Wales &amp; NI
        </div>
        <header className="sticky top-0 z-40 bg-ink text-paper">
          <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
            <Link href="/" aria-label="Home"><Logo light /></Link>
            <div className="flex items-center gap-5 text-xs font-bold uppercase tracking-wider">
              <Link href="/locations" className="hidden hover:text-zap sm:inline">Locations</Link>
              <Link href="/for-trainers" className="hidden hover:text-zap sm:inline">For trainers</Link>
              <Link href="/trainers" className="rounded-full bg-paper px-4 py-2 text-ink hover:bg-zap">Find a trainer</Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-ink text-paper">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-[2fr_1fr_1fr]">
            <div>
              <Logo light />
              <p className="mt-3 max-w-sm text-sm text-paper/60">
                The UK’s directory of personal trainers. Find someone who gets your goals, then go and smash them.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <p className="eyebrow text-paper/50">Find</p>
              <Link href="/trainers" className="hover:text-zap">Search trainers</Link>
              <Link href="/locations" className="hover:text-zap">By location</Link>
              <Link href="/trainers?online=1" className="hover:text-zap">Online coaching</Link>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <p className="eyebrow text-paper/50">Trainers</p>
              <Link href="/for-trainers" className="hover:text-zap">Claim your profile</Link>
              <Link href="/remove" className="hover:text-zap">Remove a listing</Link>
              <Link href="/privacy" className="hover:text-zap">Privacy</Link>
            </div>
          </div>
          <p className="border-t border-paper/10 px-4 py-4 text-center text-xs text-paper/40">
            © {new Date().getFullYear()} {SITE_NAME}
          </p>
        </footer>
      </body>
    </html>
  );
}
