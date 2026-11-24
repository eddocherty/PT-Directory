import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: "Shop terms", alternates: { canonical: "/shop/terms" } };

export default function ShopTerms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-sm leading-relaxed [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold">
      <h1 className="text-2xl font-bold">Shop terms</h1>
      <p className="mt-2 text-muted">Draft. Have this reviewed before launch.</p>

      <h2>What you’re buying</h2>
      <p>Our plans and guides are digital PDF downloads for your personal use. Prices are in pounds sterling. Payment is taken securely by Stripe. We never see or store your card details.</p>

      <h2>UK customers only</h2>
      <p>Our plans are sold to customers with a UK billing address only. If a payment comes from outside the UK, we refund it in full automatically and no download is provided.</p>

      <h2>Getting your download</h2>
      <p>Straight after payment you’ll see a download button. Your receipt email also includes a link so you can download it again later. If anything goes wrong, email <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with your receipt and we’ll help.</p>

      <h2>Cancellations and refunds</h2>
      <p>Under the Consumer Contracts Regulations you normally have 14 days to cancel an online purchase. For digital content, that right ends once the download is made available, because you asked for it straight away and acknowledged this at checkout. Your statutory rights are not affected: if a file is faulty or not as described, contact us and we’ll put it right or refund you.</p>

      <h2>Health and safety</h2>
      <p>Our plans give general fitness and healthy-eating information for healthy adults. They are not medical advice, are not tailored to you, and do not promise any particular result. Check with your GP or another qualified health professional before starting if you have a medical condition, an injury, take regular medication, are pregnant or have recently given birth. Stop exercising and seek advice if you feel pain, dizziness, chest discomfort or unusual breathlessness. You take part at your own risk.</p>

      <h2>Copyright</h2>
      <p>The plans are © {SITE_NAME}. Please don’t copy, share, resell or publish them.</p>

      <h2>Your data</h2>
      <p>Stripe processes your name, email and payment details to take payment and send your receipt. See our <Link href="/privacy" className="text-accent underline">privacy notice</Link>.</p>
    </div>
  );
}
