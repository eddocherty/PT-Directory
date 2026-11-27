import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy notice", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-sm leading-relaxed [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold">
      <h1 className="text-2xl font-bold">Privacy notice</h1>
      <p className="mt-2 text-muted">Draft. Have this reviewed before launch.</p>

      <h2>Who we are</h2>
      <p>{SITE_NAME} is a directory that helps people in the UK find personal trainers. Contact: {CONTACT_EMAIL}.</p>

      <h2>Information about trainers</h2>
      <p>
        We list business information that trainers have made public, such as a business name, the area they work in,
        the services they advertise, qualifications and business contact details. We collect it from sources
        that permit reuse, such as trainers’ own websites and openly licensed datasets, and we record where each listing
        came from. We do not collect home addresses or information from private social media profiles.
      </p>
      <p>
        Our lawful basis is legitimate interests (UK GDPR Article 6(1)(f)): helping the public find trainers and helping
        trainers find clients. You can object at any time.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask to see, correct or delete the information we hold about you, or object to us listing you. Use the{" "}
        <Link href="/remove" className="text-accent underline">removal and correction form</Link> to change it. You can also
        complain to the Information Commissioner’s Office (ico.org.uk).
      </p>

      <h2>Visitors</h2>
      <p>
        When you submit a form we store your name, email and message so we can reply. Searches you make use your
        postcode only to find nearby trainers. We don’t store it against you.
      </p>

      <h2>Visitor statistics</h2>
      <p>
        We count page visits so we know which pages and trainers people find useful. We don’t use cookies or similar
        technology for this, and we don’t store IP addresses. We record the page, the website that sent you (if any), your
        country and device type, and a code made from your connection details that changes every day, so a visit can be
        counted once per day but can’t be linked to you or followed over time. We also note whether a visit comes from a
        bot or an automated browser, so those aren’t counted as people. We also use Vercel Web Analytics, which works the
        same cookie-free way. The only cookies we set are on our own team’s devices, to keep our own visits out of the
        count; visitors never get them. Our lawful basis is legitimate interests: running and improving the site.
      </p>

      <h2>Shop purchases</h2>
      <p>
        If you buy a plan, Stripe processes your name, email address and payment details so we can take payment, send your
        receipt and let you download your purchase. We never see your full card details. We keep order records as the law
        requires for tax and accounting.
      </p>

      <h2>Free plan samples</h2>
      <p>
        If you ask for free sample pages of a plan, we store your email address, which plan you asked about and the date.
        We only send you emails about new plans and guides if you tick the box to say yes, and every email will have a way to
        unsubscribe. You can also ask us to stop or to delete your email at any time using the contact details above. Our
        lawful basis is your consent for marketing emails, and legitimate interests for keeping a record of the request.
      </p>

      <h2>Your shortlist and recently viewed trainers</h2>
      <p>
        Trainers you save to your shortlist, and the ones you’ve recently looked at, are kept only in your own browser on
        your device. They are never sent to us. Clearing your browser data removes them.
      </p>
    </div>
  );
}
