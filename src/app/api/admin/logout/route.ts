// app/api/admin/logout/route.ts
import { makeLogoutResponse } from "@/lib/adminAuth";

export async function POST() {
  return makeLogoutResponse();
}
