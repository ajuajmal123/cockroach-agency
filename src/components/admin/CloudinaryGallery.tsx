"use client";
import { useEffect, useState } from "react";

type Img = {
  public_id: string;
  url: string;
  width?: number;
  height?: number;
  created_at?: string;
};

type Project = {
  _id: string;
  title: string;
  coverImage?: string;
  images?: string[]; // urls
};

export default function CloudinaryGallery({
  folder = "cockroach-images",
}: {
  folder?: string;
}) {
  const [items, setItems] = useState<Img[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Load projects + images on mount
  useEffect(() => {
    loadProjects();
    load();
    const onUpdate = () => { load(); loadProjects(); };
    window.addEventListener("cockroach:images-updated", onUpdate);
    return () => window.removeEventListener("cockroach:images-updated", onUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder]);

  async function load(cursor?: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("folder", folder);
      params.set("max_results", "60");
      if (cursor) params.set("next_cursor", cursor);
      const res = await fetch(`/api/cloudinary/list?${params.toString()}`);
      const json = await res.json();
      const arr = Array.isArray(json.items) ? json.items : [];
      setItems((s) => (cursor ? s.concat(arr) : arr));
      setNextCursor(json.next_cursor || null);
    } catch (e) {
      console.error("Failed to load cloudinary images", e);
      setItems([]);
      setNextCursor(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadProjects() {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) {
        console.warn("Failed to load projects", await res.text());
        setProjects([]);
        return;
      }
      const json = await res.json();
      setProjects(Array.isArray(json) ? json : []);
      // if no project selected, choose first
      if (!selectedProjectId && Array.isArray(json) && json.length) {
        setSelectedProjectId(json[0]._id);
      }
    } catch (e) {
      console.error("Failed to load projects", e);
      setProjects([]);
    }
  }

  function toggle(public_id: string) {
    setSelected((s) => ({ ...s, [public_id]: !s[public_id] }));
  }

  function selectedItems() {
    return items.filter((i) => selected[i.public_id]);
  }

  function isAttachedToProject(imgUrl: string, project?: Project) {
    if (!project || !Array.isArray(project.images)) return false;
    // project.images store secure_url strings; compare by suffix or full equality
    return project.images.includes(imgUrl);
  }

  async function attachToProject() {
    if (!selectedProjectId) return alert("Select a project first.");
    const images = selectedItems().map((i) => i.url);
    if (images.length === 0) return alert("Select images to attach.");
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/images`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ images }),
      });
      const j = await res.json();
      if (!res.ok) {
        console.error("Attach failed", j);
        return alert(j.error || j.details || "Attach failed");
      }
      alert("Attached to project");
      setSelected({});
      await loadProjects(); // refresh projects to reflect new attachments
    } catch (e) {
      console.error("Attach error", e);
      alert("Attach failed. See console.");
    }
  }

  async function deleteSelected() {
    const ids = selectedItems().map((i) => i.public_id);
    if (!ids.length) return alert("Select images to delete");
    if (!confirm(`Delete ${ids.length} images? This is permanent.`)) return;
    try {
      // delete each (could be batched)
      for (const pid of ids) {
        const res = await fetch("/api/cloudinary/delete", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ public_id: pid }),
        });
        const j = await res.json();
        if (!res.ok) {
          console.warn("Failed to delete", pid, j);
        } else {
          // Optionally remove image URL from projects that referenced it
          // call your server to remove mapping or update locally
        }
      }
      setSelected({});
      await load(); // refresh
      await loadProjects();
    } catch (e) {
      console.error("Delete error", e);
      alert("Delete failed. See console.");
    }
  }

  // per-image delete (quick)
  async function deleteOne(public_id: string) {
    if (!confirm("Delete this image? This is permanent.")) return;
    try {
      const res = await fetch("/api/cloudinary/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ public_id }),
      });
      const j = await res.json();
      if (!res.ok) {
        console.warn("deleteOne failed", j);
        return alert(j.error || "Delete failed");
      }
      await load();
      await loadProjects();
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  }

  // helper: return map of imageUrl -> [projectIds that include it]
  function attachmentsMap() {
    const map = new Map<string, string[]>();
    for (const p of projects) {
      if (!p.images) continue;
      for (const url of p.images) {
        const arr = map.get(url) || [];
        arr.push(p._id);
        map.set(url, arr);
      }
    }
    return map;
  }

  const attachments = attachmentsMap();

  // filtered items by search
  const filteredItems = items.filter((it) => {
    if (!search) return true;
    return it.public_id.toLowerCase().includes(search.toLowerCase()) || it.url.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex gap-6">
      {/* Left: Projects list */}
      <aside className="w-72 border rounded p-3 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Projects</h3>
          <button onClick={loadProjects} className="text-sm px-2 py-1 border rounded">Refresh</button>
        </div>

        <div className="space-y-2 max-h-[65vh] overflow-auto">
          {projects.length === 0 && <div className="text-sm text-muted">No projects</div>}
          {projects.map((p) => (
            <div
              key={p._id}
              onClick={() => setSelectedProjectId(p._id)}
              className={`flex items-center gap-3 p-2 rounded cursor-pointer ${selectedProjectId === p._id ? "bg-[rgba(167,207,58,0.12)] border" : "hover:bg-gray-50"}`}
            >
              <div className="w-12 h-8 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                <img src={p.coverImage || "/placeholder.png"} alt={p.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-sm">
                <div className="font-medium truncate">{p.title}</div>
                <div className="text-xs text-gray-500">{p.images?.length ?? 0} images</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="text-xs text-gray-600 mb-2">Selected:</div>
          <div className="flex gap-2">
            <button onClick={attachToProject} className="px-3 py-1 rounded bg-[var(--color-brand)] text-[var(--color-ink)]">Attach selected</button>
            <button onClick={deleteSelected} className="px-3 py-1 rounded border text-red-600">Delete selected</button>
          </div>
        </div>
      </aside>

      {/* Right: Images grid + controls */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => load()} className="px-3 py-1 border rounded">Refresh</button>
            {nextCursor && <button onClick={() => load(nextCursor)} className="px-3 py-1 border rounded">Load more</button>}
            <div className="ml-4 text-sm text-gray-600">Folder: <span className="font-medium ml-1">{folder}</span></div>
          </div>

          <div className="flex items-center gap-2">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search images..." className="border px-2 py-1 rounded text-sm" />
            <div className="text-sm text-gray-500">{filteredItems.length} images</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredItems.map((it) => {
            const attachedProjectIds = attachments.get(it.url) || [];
            return (
              <div key={it.public_id} className="relative rounded overflow-hidden border bg-white">
                <img src={it.url} alt={it.public_id} className="w-full h-36 object-cover" />
                <div className="absolute left-2 top-2 bg-white/90 rounded px-1.5 py-0.5 text-xs">
                  <input type="checkbox" checked={!!selected[it.public_id]} onChange={() => toggle(it.public_id)} />
                </div>

                {/* Attached badges */}
                <div className="absolute left-2 bottom-2 right-2 flex items-center justify-between gap-2">
                  <div className="flex gap-1 items-center">
                    {attachedProjectIds.map((pid) => {
                      const p = projects.find((x) => x._id === pid);
                      if (!p) return null;
                      return (
                        <div key={pid} title={p.title} className="bg-black/60 text-white text-[10px] px-1 py-0.5 rounded">
                          {p.title.length > 8 ? p.title.slice(0, 8) + "…" : p.title}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 items-center">
                    <button onClick={() => deleteOne(it.public_id)} className="text-red-600 text-sm px-2 py-0.5 rounded bg-white/70">Delete</button>
                    <button onClick={() => {
                      // quick attach single image to selected project
                      setSelected({ [it.public_id]: true });
                      attachToProject();
                    }} className="text-sm px-2 py-0.5 rounded bg-[var(--color-brand)] text-[var(--color-ink)]">Attach</button>
                  </div>
                </div>

                <div className="absolute right-2 top-2 text-xs text-gray-700 bg-white/60 px-1 rounded">
                  {it.public_id.split("/").pop()}
                </div>
              </div>
            );
          })}
        </div>

        {loading && <div className="mt-3">Loading…</div>}
      </div>
    </div>
  );
}
