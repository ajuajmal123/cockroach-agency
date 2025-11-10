// components/admin/AdminPanel.tsx
"use client";
import { useEffect, useState } from "react";

export default function AdminPanel() {
  const [auth, setAuth] = useState<{ authenticated: boolean; email?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    setLoading(true);
    const res = await fetch("/api/admin/me");
    const json = await res.json();
    setAuth(json);
    setLoading(false);
  }

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (res.ok) {
      await checkAuth();
    } else {
      alert(json.error || "Login failed");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuth({ authenticated: false });
  }

  if (loading || auth === null) return <div>Loading…</div>;

  if (!auth.authenticated) {
    return (
      <div className="mt-4 max-w-md">
        <form onSubmit={login} className="grid gap-3">
          <label className="block">
            <div className="text-sm">Email</div>
            <input name="email" className="w-full border px-3 py-2 rounded" />
          </label>
          <label className="block">
            <div className="text-sm">Password</div>
            <input name="password" type="password" className="w-full border px-3 py-2 rounded" />
          </label>
          <div>
            <button type="submit" className="px-4 py-2 rounded bg-var(--color-brand) text-var(--color-ink)">Sign in</button>
          </div>
        </form>
      </div>
    );
  }

  // authenticated UI — basic controls: open gallery, create project, logout
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <div>Signed in as <strong>{auth.email}</strong></div>
        <div>
          <button onClick={logout} className="px-3 py-1 rounded border">Log out</button>
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <h2 className="font-semibold">Cloudinary gallery</h2>
          <p className="text-sm text-color:var(--color-muted)">Use the gallery component to attach images to projects</p>
          {/* lazy-load / dynamic import your CloudinaryGallery here */}
        </div>

        <div>
          <h2 className="font-semibold">Projects</h2>
          <p className="text-sm text-color:var(--color-muted)">Create, edit or remove portfolio items</p>
          {/* implement simple forms that call /api/projects */}
        </div>
      </div>
    </div>
  );
}
