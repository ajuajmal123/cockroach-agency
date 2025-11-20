"use client";
import { useEffect, useState, useCallback } from "react";
import ProjectEditForm from "./ProjectEditForm";
import toast from "react-hot-toast";

type Project = {
  _id: string;
  title: string;
  coverImage?: string;
  images?: string[];
};

const colors = {
  brand: "bg-[#4F46E5] text-white hover:bg-indigo-700",
  ink: "text-[#1F2937]",
};

export default function CloudinaryGallery() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const loadProjects = useCallback(async (p = page, l = limit) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects?page=${p}&limit=${l}`);
      const json = await res.json().catch(() => null);
      // support both shapes: { items, total } or raw array
      if (json && Array.isArray(json.items)) {
        setProjects(json.items);
        setTotal(typeof json.total === "number" ? json.total : json.items.length);
      } else if (Array.isArray(json)) {
        setProjects(json);
        setTotal(json.length);
      } else {
        setProjects([]);
        setTotal(0);
      }
    } catch (e) {
      console.error("Failed to load projects", e);
      setProjects([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    loadProjects(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const handleDelete = async (project: Project) => {
    if (!confirm(`Delete project "${project.title}"? This is permanent.`)) return;
    try {
      const res = await fetch(`/api/projects/${project._id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json();
        return alert(j.error || "Delete failed");
      }
      alert(`Deleted ${project.title}`);
      // refresh current page
      loadProjects(page, limit);
    } catch (e) {
      console.error("Delete error", e);
      alert("Delete failed. See console.");
    }
  };

  const handleEdit = (project: Project) => setEditingProjectId(project._id);
  const handleCloseEdit = () => setEditingProjectId(null);

  const handleViewImages = (project: Project) => setActiveProject(project);
  const handleBackToTable = () => { setActiveProject(null); loadProjects(page, limit); };


async function detachImages(projectId: string, imagesToDetach: string[]) {
  if (!confirm("Remove selected images from project and delete from Cloudinary? This is permanent.")) return false;
  try {
    const res = await fetch(`/api/projects/${projectId}/detachImages`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ images: imagesToDetach, deleteFromCloudinary: true }),
    });
    const j = await res.json();
    if (!res.ok) {
      toast.error(j.error || "Detach failed");
      return false;
    }
    toast.success("Image(s) detached");
    loadProjects(page, limit);
    return true;
  } catch (e) {
    console.error("Detach error", e);
    toast.error("Detach failed. See console.");
    return false;
  }
}


  // --- Responsive table on wide screens, card list on small screens ---
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className={`text-2xl font-bold ${colors.ink}`}>Project Image Manager</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => loadProjects(1, limit)} className="px-3 py-1 border rounded-md hover:bg-gray-50">Refresh</button>
          <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="border rounded-md p-1">
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>
      </div>

      {/* Mobile: card list */}
      <div className="sm:hidden">
        {loading ? (
          <div className="text-gray-500 p-4">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="text-gray-500 p-4">No projects</div>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p._id} className="p-3 border rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{p.title}</div>
                    <div className="text-xs text-gray-500">{(p._id || "").slice(0, 8)}...</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleViewImages(p)} className="text-[#4F46E5] text-sm">Images</button>
                    <button onClick={() => handleEdit(p)} className="text-yellow-600 text-sm">Edit</button>
                    <button onClick={() => handleDelete(p)} className="text-red-600 text-sm">Delete</button>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">{p.images?.length ?? 0} images</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop/Tablet: table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border rounded-lg shadow-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID (short)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">Loading projects...</td></tr>
            ) : projects.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No projects found.</td></tr>
            ) : (
              projects.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{p._id.slice(0, 8)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.images?.length ?? 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => handleViewImages(p)} className="text-[#4F46E5] hover:text-indigo-700 p-2 rounded-md transition font-medium">View Images</button>
                      <button onClick={() => handleEdit(p)} className="text-yellow-600 hover:text-yellow-800 p-2 rounded-md transition">Edit</button>
                      <button onClick={() => handleDelete(p)} className="text-red-600 hover:text-red-800 p-2 rounded-md transition">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        
        <div className="flex items-center space-x-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded-md disabled:opacity-50">Prev</button>
          <button onClick={() => setPage((p) => p + 1)} disabled={projects.length < limit} className="px-3 py-1 border rounded-md disabled:opacity-50">Next</button>
        </div>
      </div>

      {/* Edit modal */}
      {editingProjectId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-10">
            <ProjectEditForm projectId={editingProjectId} onClose={handleCloseEdit} onSaveSuccess={() => { handleCloseEdit(); loadProjects(page, limit); }} />
          </div>
        </div>
      )}

      {/* Image view modal */}
      {activeProject && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 overflow-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Images for: {activeProject.title}</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => { setActiveProject(null); loadProjects(page, limit); }} className="px-3 py-1 border rounded-md">Close</button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {activeProject.images && activeProject.images.length ? activeProject.images.map((url) => (
                <div key={url} className="relative rounded-lg overflow-hidden border shadow-md group">
                  <img src={url} alt="Project image preview" className="w-full h-32 object-cover bg-gray-100" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const ok = await detachImages(activeProject._id, [url]);
                        if (ok) {
                          // update activeProject images locally
                          setActiveProject({ ...activeProject, images: activeProject.images?.filter(i => i !== url) ?? [] });
                        }
                      }}
                      className="text-white bg-red-600 hover:bg-red-700 text-xs px-3 py-1.5 rounded-full font-medium shadow-lg disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-full p-4 text-center text-gray-500 border-dashed border-2 rounded-lg">No images attached.</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
