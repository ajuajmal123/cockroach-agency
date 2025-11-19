// components/admin/ProjectEditForm.tsx
"use client";
import { useState, useEffect } from "react";

// --- Types (Ensure this matches src/lib/types/Project.ts) ---
interface IProject {
    _id: string;
    title: string;
    description: string;
    category: string;
    subCategory?: string;
    images: string[];
    coverImage?: string;
    // Include other fields like tags, link, featured, etc.
}

const colors = {
  brand: "bg-[#4F46E5] text-white hover:bg-indigo-700",
  ink: "text-[#1F2937]",
  surface: "bg-white",
  red: "bg-red-600 hover:bg-red-700 text-white"
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

    // --- 1. Data Fetching ---
    useEffect(() => {
        const fetchProject = async () => {
            setLoading(true);
            try {
                // Calls the GET /api/projects/[id] route
                const res = await fetch(`/api/projects/${projectId}`);
                if (!res.ok) throw new Error("Failed to fetch project");
                const json = await res.json();
                setProject(json as IProject);
            } catch (e) {
                console.error("Fetch error:", e);
                alert("Failed to load project data.");
                onClose();
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [projectId, onClose]);

    // --- 2. Handlers ---
    const handleChange = (field: keyof IProject, value: any) => {
        if (project) {
            setProject({ ...project, [field]: value });
        }
    };

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0 || !project) return;
        setUploading(true);

        const fd = new FormData();
        for (const f of Array.from(files)) fd.append("files", f);

        try {
            const res = await fetch("/api/cloudinary/uploadImages", {
                method: "POST",
                body: fd,
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Upload failed");
            
            const urls = (json as any[]).map((u) => u.secure_url).filter(Boolean);

            if (urls.length > 0) {
                // Add new URLs to the existing images array
                const newImages = Array.from(new Set([...project.images, ...urls]));
                setProject(p => p ? { ...p, images: newImages } : null);

                // Set cover image if it was blank
                if ((!project.coverImage || project.coverImage === "") && newImages.length > 0) {
                     setProject(p => p ? { ...p, coverImage: newImages[0] } : null);
                }
            }
            alert(`${urls.length} images uploaded.`);
        } catch (err) {
            console.error("Upload error:", err);
            alert("Upload failed. See console.");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!project || !project.title) return alert("Title required");
        setSubmitting(true);

        try {
            // Calls the PUT /api/projects/[id] route
            const res = await fetch(`/api/projects/${projectId}`, {
                method: "PUT",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(project),
            });
            const j = await res.json();

            if (!res.ok) throw new Error(j.error || "Update failed");
            
            alert(`Project "${project.title}" updated successfully!`);
            onSaveSuccess(); // Refresh parent list/view
            onClose(); // Close the modal/form
        } catch (e: any) {
            console.error("Save error:", e);
            alert(e.message || "An error occurred during saving.");
        } finally {
            setSubmitting(false);
        }
    };

    // --- 3. Rendering ---

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading project data...</div>;
    }

    if (!project) {
        return <div className="p-8 text-center text-red-500">Project data could not be loaded.</div>;
    }

    return (
        <div className={`p-6 ${colors.surface} rounded-xl shadow-lg border border-gray-100`}>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className={`text-2xl font-bold ${colors.ink}`}>Edit Project: **{project.title}**</h3>
                <button onClick={onClose} className={`px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition`}>
                    Cancel/Close
                </button>
            </div>
            
            <div className="grid gap-5">
                {/* Title and Description */}
                <input 
                    value={project.title} 
                    onChange={e => handleChange("title", e.target.value)} 
                    placeholder="Project Title (Required)" 
                    className="border p-3 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]" 
                />
                <textarea 
                    value={project.description} 
                    onChange={e => handleChange("description", e.target.value)} 
                    placeholder="Detailed Description" 
                    rows={4}
                    className="border p-3 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]" 
                />
                
                {/* Categories */}
                <div className="flex gap-4">
                    <select 
                        value={project.category} 
                        onChange={e => handleChange("category", e.target.value)} 
                        className="border p-3 rounded-lg flex-1 focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] appearance-none"
                    >
                        <option value="design">Design</option>
                        <option value="website">Website</option>
                        <option value="branding">Branding</option>
                        <option value="other">Other</option>
                    </select>
                    <input 
                        value={project.subCategory || ''} 
                        onChange={e => handleChange("subCategory", e.target.value)} 
                        placeholder="Sub Category (e.g., UX/UI, SEO)" 
                        className="border p-3 rounded-lg flex-1 focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]" 
                    />
                </div>

                {/* Image Upload Area */}
                <label className={`block p-6 border-2 border-dashed rounded-lg cursor-pointer transition ${uploading ? 'border-gray-400 bg-gray-50' : 'border-gray-300 hover:border-[#4F46E5]'}`}>
                    <div className="text-center">
                        <p className="mt-1 text-sm text-gray-600">
                            {uploading ? "Uploading new images..." : "Click to upload or drag & drop new images"}
                        </p>
                        <p className="text-xs text-gray-500">{project.images.length} images currently attached.</p>
                    </div>
                    <input 
                        type="file" 
                        multiple 
                        onChange={(e) => handleFileUpload(e.target.files)} 
                        className="sr-only" 
                        disabled={uploading}
                    />
                </label>

                {/* Image Preview (This is where you'd manage cover/detach) */}
                <div className="flex gap-3 flex-wrap">
                    {project.images.map((url) => (
                        <div key={url} className={`w-28 h-20 overflow-hidden rounded-lg border-2 ${project.coverImage === url ? 'border-green-500' : 'border-gray-100'} shadow-sm relative group`} title={url}>
                            <img src={url} alt="Project image preview" className="w-full h-full object-cover" />
                            {project.coverImage === url && (
                                <span className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 rounded-full">Cover</span>
                            )}
                            {/* NOTE: Detach/Set Cover controls would go here */}
                        </div>
                    ))}
                </div>

                {/* Action Button */}
                <div className="mt-4 flex justify-end space-x-3">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-3 rounded-lg font-bold transition bg-gray-300 hover:bg-gray-400 text-gray-800"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave} 
                        className={`px-6 py-3 rounded-lg font-bold transition ${colors.brand} disabled:opacity-50 disabled:cursor-not-allowed`} 
                        disabled={uploading || submitting || !project.title}
                    >
                        {submitting ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}