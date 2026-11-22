import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}: find a personal trainer near you`, template: `%s | ${SITE_NAME}` },
  description:
    "Search personal trainers across the UK by location, training style and fitness goal. Compare prices, qualifications and online or in-person sessions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body className={`${geist.variable} antialiased min-h-screen flex flex-col`}>
        <header className="border-b border-line bg-surface">
          <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="text-lg font-bold tracking-tight">
              <span className="text-brand">PT</span> Directory UK
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/trainers" className="hover:text-brand">Find a trainer</Link>
              <Link href="/locations" className="hover:text-brand">Locations</Link>
              <Link href="/for-trainers" className="hover:text-brand">For trainers</Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line bg-surface text-sm text-muted">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-4 py-6">
            <p>© {new Date().getFullYear()} {SITE_NAME}</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-brand">Privacy</Link>
              <Link href="/remove" className="hover:text-brand">Remove a listing</Link>
              <Link href="/for-trainers" className="hover:text-brand">Claim your profile</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
