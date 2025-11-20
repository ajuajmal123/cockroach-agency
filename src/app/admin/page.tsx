// app/admin/page.tsx (server component)
"use client";
import dynamic from "next/dynamic";
const AdminPanel = dynamic(() => import("@/components/admin/AdminPanel"), { ssr: false });

export default function AdminPage() {
  return (
    <main className="p-6 ">
 
      <AdminPanel />
    </main>
  );
}
