// components/admin/CloudinaryGallery.tsx (UPDATED to handle Edit State)
"use client";
import { useEffect, useState, useCallback } from "react";
import ProjectEditForm from "./ProjectEditForm"; // 🟢 Import the new component

// --- Types ---
type Project = {
  _id: string;
  title: string;
  coverImage?: string;
  images?: string[]; // urls
};

// --- Tailwind Colors ---
const colors = {
  brand: "bg-[#4F46E5] text-white hover:bg-indigo-700", // Indigo 600
  ink: "text-[#1F2937]", // Gray 800
};

// --- Main Component ---
export default function CloudinaryGallery() { 
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null); // 🟢 New state for editing

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const json = await res.json();
      const loadedProjects = Array.isArray(json) ? json : [];
      setProjects(loadedProjects);

      // Refresh the currently active view if applicable
      if (activeProject) {
          const updatedProject = loadedProjects.find((p: Project) => p._id === activeProject._id);
          setActiveProject(updatedProject || null);
      }
    } catch (e) {
      console.error("Failed to load projects", e);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [activeProject]);

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (project: Project) => {
    // ... (Your existing handleDelete logic) ...
    if (!confirm(`Are you sure you want to delete project: ${project.title}? This is permanent.`)) return;
    try {
      const res = await fetch(`/api/projects/${project._id}`, { method: 'DELETE' });
      if (!res.ok) {
        const j = await res.json();
        return alert(j.error || "Delete failed");
      }
      alert(`Project "${project.title}" deleted.`);
      loadProjects(); 
    } catch (e) {
      console.error("Delete error", e);
      alert("Delete failed. See console.");
    }
  };
  
  // 🟢 Updated handler to set the editing state
  const handleEdit = (project: Project) => {
    setEditingProjectId(project._id);
  };

  const handleCloseEdit = () => {
    setEditingProjectId(null);
  };

  const handleViewImages = (project: Project) => {
    setActiveProject(project);
  };
  
  const handleBackToTable = () => {
    setActiveProject(null);
    loadProjects(); 
  };

  // --- Modal/Form Overlay for Editing ---
  if (editingProjectId) {
    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center p-4 overflow-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-10 transform transition-all duration-300">
                <ProjectEditForm 
                    projectId={editingProjectId}
                    onClose={handleCloseEdit}
                    onSaveSuccess={loadProjects}
                />
            </div>
        </div>
    );
  }

  // --- Conditional Rendering for Image View ---
  if (activeProject) {
    return (
      <ProjectImageView 
        project={activeProject} 
        onBack={handleBackToTable} 
        onDetachSuccess={loadProjects} 
      />
    );
  }

  // --- Default View: Project Table ---
  return (
    <div className="space-y-4">
      {/* ... (Header and Refresh Button) ... */}
      <div className="flex justify-between items-center">
        <h3 className={`text-2xl font-bold ${colors.ink}`}>Project Image Manager</h3>
        <button onClick={loadProjects} className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition">
          {loading ? "Refreshing..." : "Refresh List"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border rounded-lg shadow-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID (Short)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && projects.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">Loading projects...</td></tr>
            ) : projects.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No projects found.</td></tr>
            ) : (
              projects.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500" title={p._id}>
                    {p._id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {p.images?.length ?? 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleViewImages(p)} 
                        className="text-[#4F46E5] hover:text-indigo-700 p-2 rounded-md transition font-medium"
                      >
                        View Images
                      </button>
                      {/* 🟢 Call the new handler */}
                      <button 
                        onClick={() => handleEdit(p)} 
                        className="text-yellow-600 hover:text-yellow-800 p-2 rounded-md transition"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(p)} 
                        className="text-red-600 hover:text-red-800 p-2 rounded-md transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Sub-Component for Image Viewing (Unchanged logic) ---
function ProjectImageView({ project, onBack, onDetachSuccess }: { project: Project, onBack: () => void, onDetachSuccess: () => void }) {
    // ... (Your existing ProjectImageView component logic for Detach) ...
    const [isDetaching, setIsDetaching] = useState(false);
    const projectImages = project.images || [];

    const handleDetach = async (imageUrl: string) => {
        if (!confirm("Are you sure you want to detach this image from the project? The image file will NOT be deleted from Cloudinary.")) return;
        setIsDetaching(true);
        try {
            const res = await fetch(`/api/projects/${project._id}/detachImages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ images: [imageUrl] }),
            });

            if (!res.ok) {
                const j = await res.json();
                return alert(j.error || "Failed to detach image.");
            }
            alert("Image detached successfully. Reloading...");
            onDetachSuccess(); 
        } catch (e) {
            console.error("Detach failed:", e);
            alert("Detach failed. See console.");
        } finally {
            setIsDetaching(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-xl font-bold text-[#4F46E5]">
                    Images for: **{project.title}**
                </h2>
                <button onClick={onBack} className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition font-medium">
                    ← Back to Projects
                </button>
            </div>

            <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-200 text-sm text-gray-700">
                This project currently has **{projectImages.length}** attached images.
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {projectImages.length === 0 ? (
                    <div className="col-span-full text-center p-10 border-dashed border-2 rounded-lg text-gray-500">
                        No images attached.
                    </div>
                ) : (
                    projectImages.map((url) => (
                        <div key={url} className="relative rounded-lg overflow-hidden border shadow-md group">
                            <img src={url} alt="Project image preview" className="w-full h-32 object-cover bg-gray-100" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDetach(url); }}
                                    disabled={isDetaching}
                                    className="text-white bg-red-600 hover:bg-red-700 text-xs px-3 py-1.5 rounded-full font-medium shadow-lg disabled:opacity-50"
                                >
                                    {isDetaching ? "..." : "Detach"}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}