"use client";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";

const colors = {
  brand: "bg-[#4F46E5] text-white hover:bg-indigo-700",
  ink: "text-[#1F2937]",
  surface: "bg-white",
};

export default function ProjectForm() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("design");
  const [subCategory, setSubCategory] = useState<string>("");
  const [images, setImages] = useState<string[]>([

  ]);
  const [coverImage, setCoverImage] = useState<string | "">("");
  const [uploading, setUploading] = useState(false);

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    toast.loading("Uploading images...", { id: "upload" });

    const fd = new FormData();
    for (const f of Array.from(files)) fd.append("files", f);

    try {
      const res = await fetch("/api/cloudinary/uploadImages", {
        method: "POST",
        body: fd,
      });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const message = (json && (json.message || json.error)) || `Upload failed (status ${res.status})`;
        toast.error(message);
        toast.dismiss("upload");
        return;
      }

      let uploadedItems: unknown[] = [];
      if (Array.isArray(json)) uploadedItems = json;
      else if (json && Array.isArray((json as any).uploads)) uploadedItems = (json as any).uploads;
      else if (json && Array.isArray((json as any).items)) uploadedItems = (json as any).items;

      const urls = (uploadedItems as any[])
        .map((u) => u.secure_url || u.secureUrl || u.url || "")
        .filter(Boolean);

      if (urls.length === 0) {
        toast("Upload succeeded but no image URLs were returned.", { icon: "⚠️" });
        toast.dismiss("upload");
        return;
      }

      setImages((s) => {
        const next = s.concat(urls);
        if (!coverImage && next.length > 0) {
          setCoverImage(next[0]);
        }
        return next;
      });

      toast.success(`${urls.length} image(s) uploaded.`, { id: "upload" });
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. See console for details.");
      toast.dismiss("upload");
    } finally {
      setUploading(false);
    }
  }

  function removeImageAt(index: number) {
    setImages((prev) => {
      const copy = prev.slice();
      const removed = copy.splice(index, 1)[0];
      setCoverImage((current) => {
        if (!current) return "";
        if (current === removed) {
          return copy.length > 0 ? copy[0] : "";
        }
        return current;
      });
      return copy;
    });
    toast.success("Image removed");
  }

  function setAsCover(url: string) {
    setCoverImage(url);
    toast.success("Cover image set");
  }

  async function createProject() {
    if (!title) {
      toast.error("Title required");
      return;
    }
    const body = {
      title,
      description,
      category,
      subCategory,
      images,
      coverImage: coverImage || (images.length ? images[0] : ""),
    };
    try {
      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      if (res.ok) {
        toast.success("Project created");
        setTitle("");
        setDescription("");
        setImages([]);
        setSubCategory("");
        setCoverImage("");
      } else {
        toast.error(j.error || "Create failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Create failed. See console.");
    }
  }

  return (
    // full-width wrapper so card never overflows viewport, with larger max width on big screens
    <div className="w-full box-border px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />

      {/* card: max width increased on large screens but always fits on mobile */}
      <div className={`p-4 sm:p-6 ${colors.surface} rounded-xl shadow-lg border border-gray-100 w-full max-w-3xl mx-auto box-border`}>
        <h3 className={`text-2xl font-bold mb-4 ${colors.ink}`}>New Project Details</h3>

        {/* short helper text above inputs (optional) */}
        <p className="text-sm text-gray-500 mb-4 hidden sm:block">Fill details and upload images</p>

        {/* Responsive grid:
            - mobile: inputs stack vertically (1 column)
            - md+: two columns (left inputs, right upload)
          */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: inputs */}
          <div className="flex flex-col gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project Title (Required)"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed Description"
              rows={6}
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] resize-none"
            />

            {/* Important: min-w-0 prevents children from forcing overflow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border p-3 rounded-lg flex-1 min-w-0 focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] appearance-none"
              >
                <option value="design">Design</option>
                <option value="website">Website</option>
                <option value="branding">Branding</option>
                <option value="other">Other</option>
              </select>

              {/* subCategory sits in same grid cell but won't overflow. min-w-0 ensures it shrinks properly */}
              <input
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="Sub Category (e.g., UX/UI, SEO)"
                className="border p-3 rounded-lg flex-1 min-w-0 focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
              />
            </div>
          </div>

          {/* RIGHT: upload + previews */}
          <div className="flex flex-col gap-4">
            <label
              className={`block w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition ${
                uploading ? "border-gray-400 bg-gray-50" : "border-gray-300 hover:border-[#4F46E5]"
              }`}
            >
              <div className="text-center">
                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-5 2h2m-5 4h2m-7-2h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">{uploading ? "Uploading..." : "Click to upload or drag & drop project images"}</p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each (Multi-select allowed)</p>
              </div>
              <input type="file" multiple onChange={(e) => uploadFiles(e.target.files)} className="sr-only" disabled={uploading} />
            </label>

            {/* Previews grid: 2 columns on mobile, 1 column on md and up */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
              {images.length === 0 && <div className="col-span-2 text-sm text-gray-400 p-3">No images uploaded yet.</div>}

              {images.map((url, idx) => {
                const isCover = url === (coverImage || (images[0] ?? ""));
                return (
                  <div
                    key={`${url}-${idx}`}
                    className={`relative rounded-lg overflow-hidden border ${isCover ? "border-[#4F46E5]" : "border-gray-100"} shadow-sm`}
                  >
                    {/* use aspect ratio to avoid huge heights and keep responsiveness */}
                    <div className="w-full aspect-4/3 bg-gray-100">
                      <img src={url} alt={`preview ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>

                    {/* Top-right remove */}
                    <button
                      type="button"
                      onClick={() => removeImageAt(idx)}
                      aria-label="Remove image"
                      className="absolute top-0.5 right-0.5 z-20 bg-white rounded-full shadow  border hover:bg-gray-50 focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.53-11.47a.75.75 0 00-1.06-1.06L10 7.94 7.53 5.47a.75.75 0 10-1.06 1.06L8.94 9l-2.47 2.47a.75.75 0 101.06 1.06L10 10.06l2.47 2.47a.75.75 0 101.06-1.06L11.06 9l2.47-2.47z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Bottom-left cover */}
                    <button
                      type="button"
                      onClick={() => setAsCover(url)}
                      aria-label={isCover ? "Cover image (selected)" : "Set as cover image"}
                      className={`absolute bottom-0.5 left-0.5 z-20 bg-white rounded-full shadow border  hover:bg-gray-50 focus:outline-none ${isCover ? "ring-2 ring-offset-1 ring-[#4F46E5]" : ""}`}
                    >
                      {isCover ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.286 3.968c.3.921-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.176 0l-3.385 2.46c-.785.57-1.839-.197-1.54-1.118l1.286-3.968a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 17.75L6.47 20.94a.75.75 0 01-1.09-.79l1.05-6.12-4.45-4.34a.75.75 0 01.42-1.28l6.15-.9 2.75-5.56a.75.75 0 011.34 0l2.75 5.56 6.15.9a.75.75 0 01.42 1.28l-4.45 4.34 1.05 6.12a.75.75 0 01-1.09.79L12 17.75z" />
                        </svg>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom create button: single source of truth, full width on mobile */}
        <div className="mt-6">
          <button
            onClick={createProject}
            className={`w-full sm:w-auto px-6 py-3 rounded-lg font-bold transition ${colors.brand} disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={uploading || !title}
          >
            {uploading ? "Uploading..." : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
