// components/admin/AdminPanel.tsx
"use client";
import { useEffect, useState } from "react";
import CloudinaryGallery from "./CloudinaryGallery";
import ProjectForm from "./ProjectForm";

type AuthState = { authenticated: boolean; email?: string } | null;

export default function AdminPanel() {
  const [auth, setAuth] = useState<AuthState>(null);
  const [tab, setTab] = useState<"projects" | "gallery">("projects");

  useEffect(() => { checkAuth(); }, []);

  async function checkAuth() {
    const res = await fetch("/api/admin/me");
    const json = await res.json();
    setAuth(json);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuth({ authenticated: false });
  }

  if (auth === null) return <div>Loading…</div>;
  if (!auth.authenticated) {
    return (
      <div className="max-w-md">
        <h2 className="text-xl font-semibold mb-3">Admin sign in</h2>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget as HTMLFormElement);
          const email = String(fd.get("email") || "");
          const password = String(fd.get("password") || "");
          const r = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          if (r.ok) await checkAuth();
          else {
            const j = await r.json();
            alert(j.error || "Login failed");
          }
        }} className="grid gap-3">
          <input name="email" placeholder="email" className="border p-2 rounded" />
          <input name="password" type="password" placeholder="password" className="border p-2 rounded" />
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded bg-var(--color-brand) text-var(--color-ink)">Sign in</button>
          </div>
        </form>
      </div>
    );
  }

  // authenticated
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>Signed in as <strong>{auth.email}</strong></div>
        <div>
          <button onClick={logout} className="px-3 py-1 rounded border">Log out</button>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button className={`px-3 py-1 rounded ${tab === "projects" ? "bg-white border" : "border bg-transparent"}`} onClick={() => setTab("projects")}>Projects</button>
        <button className={`px-3 py-1 rounded ${tab === "gallery" ? "bg-white border" : "border bg-transparent"}`} onClick={() => setTab("gallery")}>Cloudinary Gallery</button>
      </div>

      {tab === "projects" && (
        <div className="space-y-6">
          <ProjectForm />
        </div>
      )}

      {tab === "gallery" && (
        <div>
          <CloudinaryGallery folder="cockroach-images" />
        </div>
      )}
    </div>
  );
}
