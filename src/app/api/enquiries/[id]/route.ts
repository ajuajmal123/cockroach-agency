import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnect";
import Enquiry from "@/lib/models/Enquiry";
import { requireAdmin } from "@/lib/adminAuth";

export async function DELETE(req: Request, context: { params?: { id?: string } | Promise<{ id?: string }> }) {
  try {
    await requireAdmin(req); // ensure only admins can delete
    await connectDB();

    const params = await Promise.resolve(context.params);
    const id = params?.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const doc = await Enquiry.findByIdAndDelete(id);
    if (!doc) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /api/enquiries/[id] error:", err);
    // If requireAdmin threw, it will have handled response; otherwise return 500
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
