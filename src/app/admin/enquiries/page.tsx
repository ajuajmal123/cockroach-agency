"use client";

import dynamic from "next/dynamic";


// dynamic import the client component (no SSR) to keep things simple
const EnquiriesTable = dynamic(() => import("@/components/admin/EnquiriesTable"), { ssr: false });

export default function AdminEnquiriesPage() {
  return (
    <>
    
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-4">Enquiries</h1>
        <EnquiriesTable />
      </main>
    </>
  );
}
