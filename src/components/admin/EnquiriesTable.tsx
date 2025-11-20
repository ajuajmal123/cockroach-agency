"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Enquiry = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt?: string;
};

export default function EnquiriesTable() {
  const [items, setItems] = useState<Enquiry[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const [viewing, setViewing] = useState<Enquiry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async (p = page, l = limit) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/enquiries?page=${p}&limit=${l}`, { cache: "no-store" });
      const json = await res.json();
      setItems(json.items || []);
      setTotal(json.total || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this enquiry? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/enquiries/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.error || "Delete failed");
        return;
      }
      toast.success("Deleted");
      // reload current page
      load(page, limit);
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <label className="text-sm text-gray-600">Per page:</label>
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            className="ml-2 border rounded-md p-1"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

       
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">No enquiries</td></tr>
            ) : (
              items.map((it) => (
                <tr key={it._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{it.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{it.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{it.phone}</td>
                  <td className="px-4 py-3 max-w-[24rem] truncate text-sm text-gray-600" title={it.message}>{it.message}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setViewing(it)} className="px-3 py-1 rounded-md border text-sm">View</button>
                      <button onClick={() => handleDelete(it._id)} className="px-3 py-1 rounded-md border text-sm text-red-600" disabled={deletingId === it._id}>
                        {deletingId === it._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile list (stacked cards) */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          <div className="p-4 text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-gray-500">No enquiries</div>
        ) : (
          items.map((it) => (
            <div key={it._id} className="p-3 border rounded-lg shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-gray-500">{it.email} • {it.phone}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => setViewing(it)} className="text-sm px-2 py-1 border rounded-md">View</button>
                  <button onClick={() => handleDelete(it._id)} className="text-sm px-2 py-1 border rounded-md text-red-600">Delete</button>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600 line-clamp-3">{it.message}</div>
            </div>
          ))
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between pt-3">
        <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded-md disabled:opacity-50">Prev</button>
          <button onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))} disabled={page >= totalPages} className="px-3 py-1 border rounded-md disabled:opacity-50">Next</button>
        </div>
      </div>

      {/* View modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">{viewing.name}</h3>
                <div className="text-xs text-gray-500">{new Date(viewing.createdAt || "").toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setViewing(null)} className="px-3 py-1 border rounded-md">Close</button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div><span className="font-semibold">Email:</span> <a className="text-blue-600" href={`mailto:${viewing.email}`}>{viewing.email}</a></div>
              <div><span className="font-semibold">Phone:</span> <a className="text-blue-600" href={`tel:${viewing.phone}`}>{viewing.phone}</a></div>
              <div><span className="font-semibold">Message:</span>
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{viewing.message}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setViewing(null)} className="px-4 py-2 border rounded-md">Close</button>
              <button onClick={() => { navigator.clipboard?.writeText(viewing.email || ""); toast.success("Email copied"); }} className="px-4 py-2 border rounded-md">Copy Email</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
