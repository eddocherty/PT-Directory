import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { PasswordForm } from "./PasswordForm";

export const dynamic = "force-dynamic";

export default async function ChangePassword() {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <Link href="/admin" className="text-sm text-muted hover:text-ink">← Dashboard</Link>
      <h1 className="display mt-3 text-4xl">Change password</h1>
      <p className="mt-2 text-sm text-muted">Pick something you’ll remember: a short phrase of a few words is easy to remember and hard to guess.</p>
      <div className="mt-6 rounded-3xl bg-paper p-6 shadow-sm">
        <PasswordForm />
      </div>
    </div>
  );
}
