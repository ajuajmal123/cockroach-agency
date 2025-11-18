// components/admin/ProjectForm.tsx
"use client";
import { useState } from "react";

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
  for (const f of Array.from(files)) fd.append("files", f);

  try {
    const res = await fetch("/api/cloudinary/uploadImages", {
      method: "POST",
      body: fd,
      // no content-type header for multipart/form-data
    });

    // parse body safely
    const json = await res.json().catch((e) => {
      console.error("Failed to parse JSON from uploads response", e);
      return null;
    });

    if (!res.ok) {
      console.error("Upload API returned error:", res.status, json);
      const message = (json && (json.message || json.error)) || `Upload failed (status ${res.status})`;
      alert(message);
      setUploading(false);
      return;
    }

    // possible shapes:
    // 1) { uploads: [{ secure_url, public_id, ...}, ...] }
    // 2) [{ secure_url, ...}, ...]
    // 3) { uploads: "..." } (bad) -> handle
    let uploadedItems: any[] = [];

    if (Array.isArray(json)) {
      uploadedItems = json;
    } else if (json && Array.isArray(json.uploads)) {
      uploadedItems = json.uploads;
    } else if (json && Array.isArray(json.items)) {
      // fallback if your API returns items
      uploadedItems = json.items;
    } else {
      console.warn("Unexpected upload response shape:", json);
      alert("Upload returned unexpected response. Check console for details.");
      setUploading(false);
      return;
    }

    // get secure_url or url from each uploaded item
    const urls = uploadedItems.map((u) => u.secure_url || u.secureUrl || u.url || "");
    // filter out empty strings
    const goodUrls = urls.filter(Boolean);

    if (goodUrls.length === 0) {
      console.warn("No valid URLs returned from upload:", uploadedItems);
      alert("Upload succeeded but no image URLs were returned.");
      setUploading(false);
      return;
    }

    setImages((s) => s.concat(goodUrls));
  } catch (err) {
    console.error("Upload failed:", err);
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
      alert("Project created");
      setTitle(""); setDescription(""); setImages([]); setSubCategory("");
    } else alert(j.error || "Create failed");
  }

  return (
    <div className="p-4 border rounded bg-white">
      <h3 className="font-semibold mb-3">Create project</h3>
      <div className="grid gap-3">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="border p-2 rounded" />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="border p-2 rounded" />
        <div className="flex gap-2">
          <select value={category} onChange={e => setCategory(e.target.value)} className="border p-2 rounded">
            <option value="design">Design</option>
            <option value="website">Website</option>
            <option value="branding">Branding</option>
            <option value="other">Other</option>
          </select>
          <input value={subCategory} onChange={e => setSubCategory(e.target.value)} placeholder="Sub category" className="border p-2 rounded" />
        </div>

        <label className="block">
          <div className="text-sm mb-1">Upload images</div>
          <input type="file" multiple onChange={(e) => uploadFiles(e.target.files)} />
        </label>

        <div className="flex gap-2 flex-wrap">
          {images.map((url) => (
            <div key={url} className="w-24 h-16 overflow-hidden rounded border">
              <img src={url} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={createProject} className="px-4 py-2 rounded bg-[var(--color-brand)] text-[var(--color-ink)]" disabled={uploading}>Create</button>
        </div>
      </div>
    </div>
  );
}
