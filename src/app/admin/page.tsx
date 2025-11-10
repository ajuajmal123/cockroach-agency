// app/admin/page.tsx (server component)
"use client";
import dynamic from "next/dynamic";
const AdminPanel = dynamic(() => import("@/components/admin/AdminPanel"), { ssr: false });

export default function AdminPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Admin — Content Management</h1>
      <p className="text-sm text-color:var(--color-muted) mb-4">Manage projects, images and portfolio content.</p>

      <AdminPanel />
    </main>
  );
}
