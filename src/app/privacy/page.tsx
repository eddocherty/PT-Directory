import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy notice" };

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
        the services and prices they advertise, qualifications and business contact details. We collect it from sources
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
        <Link href="/remove" className="text-accent underline">removal form</Link> or{" "}
        <Link href="/for-trainers" className="text-accent underline">claim your profile</Link> to change it. You can also
        complain to the Information Commissioner’s Office (ico.org.uk).
      </p>

      <h2>Visitors</h2>
      <p>
        When you submit a form we store your name, email and message so we can reply. Searches you make use your
        postcode only to find nearby trainers. We don’t store it against you.
      </p>
    </div>
  );
}
