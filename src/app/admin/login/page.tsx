import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLogin() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <p className="eyebrow text-muted">Train Local</p>
      <h1 className="display mt-1 text-4xl">Admin login</h1>
      <div className="mt-6 rounded-3xl bg-paper p-6 shadow-sm">
        <LoginForm />
      </div>
    </div>
  );
}
