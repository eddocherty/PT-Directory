import { startCheckout } from "@/lib/join";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// A general payment link (localpt.co.uk/join) for a trainer who isn't listed yet.
// ed links the payment to their listing afterwards in /admin.
export async function GET(req: Request) {
  return startCheckout(req, null);
}
