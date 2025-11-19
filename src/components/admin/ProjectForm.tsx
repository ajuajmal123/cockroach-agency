// components/admin/ProjectForm.tsx
"use client";
import { useState } from "react";
// Assuming a toast library is used for better feedback, e.g., react-hot-toast
// import toast from 'react-hot-toast'; 

const colors = {
  brand: "bg-[#4F46E5] text-white hover:bg-indigo-700",
  ink: "text-[#1F2937]",
  surface: "bg-white",
};

export default function ProjectForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("design");
  const [subCategory, setSubCategory] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    const fd = new FormData();
    for (const f of Array.from(files)) fd.append("files", f); // IMPORTANT: Use "files"

    try {
      // NOTE: Uses the multi-file upload route
      const res = await fetch("/api/cloudinary/uploadImages", {
        method: "POST",
        body: fd,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const message = (json && (json.message || json.error)) || `Upload failed (status ${res.status})`;
        // Use toast for non-blocking feedback
        // toast.error(message); 
        alert(message); // Fallback to alert
        return;
      }

      let uploadedItems: any[] = [];
      if (Array.isArray(json)) uploadedItems = json;
      else if (json && Array.isArray(json.uploads)) uploadedItems = json.uploads;
      else if (json && Array.isArray(json.items)) uploadedItems = json.items;

      const urls = uploadedItems.map((u) => u.secure_url || u.secureUrl || u.url || "").filter(Boolean);

      if (urls.length === 0) {
        // toast.warn("No valid URLs returned from upload.");
        alert("Upload succeeded but no image URLs were returned.");
        return;
      }

      setImages((s) => s.concat(urls));
      // toast.success(`${urls.length} images uploaded successfully.`);
    } catch (err) {
      // toast.error("Upload failed. Check console.");
      alert("Upload failed. See console for details.");
    } finally {
      setUploading(false);
    }
  }


  async function createProject() {
    if (!title) return alert("Title required");
    const body = { title, description, category, subCategory, images };
    const res = await fetch("/api/projects/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await res.json();
    if (res.ok) {
      // toast.success("Project created!");
      alert("Project created");
      // Reset form state
      setTitle(""); setDescription(""); setImages([]); setSubCategory("");
    } else {
      // toast.error(j.error || "Create failed");
      alert(j.error || "Create failed");
    }
  }

  return (
    <div className={`p-6 ${colors.surface} rounded-xl shadow-lg border border-gray-100`}>
      <h3 className={`text-2xl font-bold mb-6 ${colors.ink}`}>New Project Details</h3>
      <div className="grid gap-5">
        
        {/* Title and Description */}
        <input 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          placeholder="Project Title (Required)" 
          className="border p-3 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]" 
        />
        <textarea 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          placeholder="Detailed Description" 
          rows={4}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]" 
        />
        
        {/* Categories */}
        <div className="flex gap-4">
          <select 
            value={category} 
            onChange={e => setCategory(e.target.value)} 
            className="border p-3 rounded-lg flex-1 focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] appearance-none"
          >
            <option value="design">Design</option>
            <option value="website">Website</option>
            <option value="branding">Branding</option>
            <option value="other">Other</option>
          </select>
          <input 
            value={subCategory} 
            onChange={e => setSubCategory(e.target.value)} 
            placeholder="Sub Category (e.g., UX/UI, SEO)" 
            className="border p-3 rounded-lg flex-1 focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]" 
          />
        </div>

        {/* Image Upload Area (Drop Zone Style) */}
        <label className={`block p-6 border-2 border-dashed rounded-lg cursor-pointer transition ${uploading ? 'border-gray-400 bg-gray-50' : 'border-gray-300 hover:border-[#4F46E5]'}`}>
          <div className="text-center">
            <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-5 2h2m-5 4h2m-7-2h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            <p className="mt-1 text-sm text-gray-600">
              {uploading ? "Uploading..." : "Click to upload or drag & drop project images"}
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each (Multi-select allowed)</p>
          </div>
          <input 
            type="file" 
            multiple 
            onChange={(e) => uploadFiles(e.target.files)} 
            className="sr-only" 
            disabled={uploading}
          />
        </label>

        {/* Image Preview */}
        <div className="flex gap-3 flex-wrap">
          {images.map((url) => (
            <div key={url} className="w-28 h-20 overflow-hidden rounded-lg border-2 border-gray-100 shadow-sm relative group">
              <img src={url} alt="Project image preview" className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80" />
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-4">
          <button 
            onClick={createProject} 
            className={`px-6 py-3 rounded-lg font-bold transition ${colors.brand} disabled:opacity-50 disabled:cursor-not-allowed`} 
            disabled={uploading || !title}
          >
            {uploading ? "Uploading..." : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}