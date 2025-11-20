"use client";
import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";

// --- Types (Ensure this matches src/lib/types/Project.ts) ---
interface IProject {
  _id: string;
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  images: string[];
  coverImage?: string;
  cloudinaryIds?: string[];
}

const colors = {
  brand: "bg-[#4F46E5] text-white hover:bg-indigo-700",
  ink: "text-[#1F2937]",
  surface: "bg-white",
  red: "bg-red-600 hover:bg-red-700 text-white",
};

interface ProjectEditFormProps {
  projectId: string;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export default function ProjectEditForm({ projectId, onClose, onSaveSuccess }: ProjectEditFormProps) {
  const [project, setProject] = useState<IProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) throw new Error("Failed to fetch project");
        const json = await res.json();
        setProject(json as IProject);
      } catch (e) {
        console.error("Fetch error:", e);
        toast.error("Failed to load project data.");
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId, onClose]);

  const handleChange = (field: keyof IProject, value: any) => {
    if (project) setProject({ ...project, [field]: value });
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !project) return;
    setUploading(true);
    const notifyId = toast.loading("Uploading...");
    try {
      const fd = new FormData();
      for (const f of Array.from(files)) fd.append("files", f);
      const res = await fetch("/api/cloudinary/uploadImages", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      const urls = (json as any[]).map((u) => u.secure_url).filter(Boolean);
      if (urls.length > 0) {
        const newImages = Array.from(new Set([...(project.images || []), ...urls]));
        setProject((p) => (p ? { ...p, images: newImages, coverImage: p.coverImage || newImages[0] } : p));
      }
      toast.success(`${urls.length} image(s) uploaded`, { id: notifyId });
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed. See console.", { id: notifyId });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!project || !project.title) {
      toast.error("Title required");
      return;
    }
    setSubmitting(true);
    const notifyId = toast.loading("Saving...");
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(project),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Update failed");
      toast.success(`Project "${project.title}" updated`, { id: notifyId });
      onSaveSuccess();
      onClose();
    } catch (e: any) {
      console.error("Save error:", e);
      toast.error(e.message || "Error saving project", { id: notifyId });
    } finally {
      setSubmitting(false);
    }
  };

  // detach an image from this project (calls your detach route)
  const handleDetachImage = async (url: string) => {
    if (!confirm("Remove this image from project AND delete from Cloudinary? This is permanent.")) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/detachImages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ images: [url], deleteFromCloudinary: true }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Detach failed");
      toast.success("Image removed");
      setProject((p) =>
        p ? { ...p, images: p.images.filter((i) => i !== url), coverImage: p.coverImage === url ? (p.images.filter((i) => i !== url)[0] || "") : p.coverImage } : p
      );
    } catch (err) {
      console.error(err);
      toast.error("Detach failed. See console.");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading project data...</div>;
  if (!project) return <div className="p-8 text-center text-red-500">Project data could not be loaded.</div>;

  return (
    <div className={`p-6 ${colors.surface} rounded-xl shadow-lg border border-gray-100 w-full box-border`}>
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h3 className={`text-2xl font-bold ${colors.ink}`}>Edit Project: <span className="font-normal">{project.title}</span></h3>
        <button onClick={onClose} className={`px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition`}>Cancel</button>
      </div>

      <div className="grid gap-4">
        <input value={project.title} onChange={(e) => handleChange("title", e.target.value)} placeholder="Project Title (Required)" className="border p-3 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]" />
        <textarea value={project.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Detailed Description" rows={4} className="border p-3 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
          <select value={project.category} onChange={(e) => handleChange("category", e.target.value)} className="border p-3 rounded-lg min-w-0 focus:ring-2 focus:ring-[#4F46E5]">
            <option value="design">Design</option>
            <option value="website">Website</option>
            <option value="branding">Branding</option>
            <option value="other">Other</option>
          </select>
          <input value={project.subCategory || ""} onChange={(e) => handleChange("subCategory", e.target.value)} placeholder="Sub Category (e.g., UX/UI)" className="border p-3 rounded-lg min-w-0 focus:ring-2 focus:ring-[#4F46E5]" />
        </div>

        <label className={`block p-4 border-2 border-dashed rounded-lg cursor-pointer ${uploading ? "border-gray-400 bg-gray-50" : "border-gray-300 hover:border-[#4F46E5]"}`}>
          <div className="text-center">
            <p className="text-sm text-gray-600">{uploading ? "Uploading..." : "Click to upload or drag & drop new images"}</p>
            <p className="text-xs text-gray-500">{project.images.length} images currently attached.</p>
          </div>
          <input type="file" multiple onChange={(e) => handleFileUpload(e.target.files)} className="sr-only" disabled={uploading} />
        </label>

        {/* Image previews: allow set cover + detach */}
        <div className="flex gap-3 flex-wrap">
          {project.images.map((url) => {
            const isCover = project.coverImage === url;
            return (
              <div key={url} className={`relative rounded-lg overflow-hidden border ${isCover ? "border-[#4F46E5]" : "border-gray-100"} shadow-sm`} style={{ width: 112 }}>
                <div className="w-full aspect-4/3 bg-gray-100">
                  <img src={url} alt="Project image preview" className="w-full h-full object-cover" />
                </div>

                {/* actions overlay at hover */}
                <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDetachImage(url)}
                      className="pointer-events-auto bg-white rounded-full p-1 shadow border text-red-500 hover:bg-gray-50"
                      aria-label="Delete image"
                    >
                      {/* X svg */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.53-11.47a.75.75 0 00-1.06-1.06L10 7.94 7.53 5.47a.75.75 0 10-1.06 1.06L8.94 9l-2.47 2.47a.75.75 0 101.06 1.06L10 10.06l2.47 2.47a.75.75 0 101.06-1.06L11.06 9l2.47-2.47z" clipRule="evenodd" /></svg>
                    </button>
                  </div>

                  <div className="flex justify-start">
                    <button
                      onClick={() => {
                        setProject((p) => p ? { ...p, coverImage: url } : p);
                        toast.success("Cover changed");
                      }}
                      className={`pointer-events-auto bg-white rounded-full p-1 shadow border ${isCover ? "ring-2 ring-[#4F46E5]" : ""}`}
                      aria-label="Set as cover"
                    >
                      {isCover ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.286 3.968c.3.921-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.176 0l-3.385 2.46c-.785.57-1.839-.197-1.54-1.118l1.286-3.968a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 17.75L6.47 20.94a.75.75 0 01-1.09-.79l1.05-6.12-4.45-4.34a.75.75 0 01.42-1.28l6.15-.9 2.75-5.56a.75.75 0 011.34 0l2.75 5.56 6.15.9a.75.75 0 01.42 1.28l-4.45 4.34 1.05 6.12a.75.75 0 01-1.09.79L12 17.75z" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <button onClick={onClose} className="px-6 py-3 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800">Cancel</button>
          <button onClick={handleSave} disabled={uploading || submitting || !project.title} className={`px-6 py-3 rounded-lg ${colors.brand} disabled:opacity-50`}>
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
