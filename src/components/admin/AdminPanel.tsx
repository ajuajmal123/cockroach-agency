// components/admin/AdminPanel.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import CloudinaryGallery from "./CloudinaryGallery"; // Now Project Table Manager
import ProjectForm from "./ProjectForm";

// Define a consistent color map using Tailwind classes based on the suggested theme
const colors = {
  brand: "bg-[#4F46E5] text-white hover:bg-indigo-700", // Indigo 600
  ink: "text-[#1F2937]", // Gray 800
  surface: "bg-white",
  background: "bg-[#F9FAFB]", // Gray 50
  border: "border border-gray-200",
};

type AuthState = { authenticated: boolean; email?: string } | null;

export default function AdminPanel() {
  const [auth, setAuth] = useState<AuthState>(null);
  const [tab, setTab] = useState<"projects" | "gallery">("projects");

  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/admin/me");
    const json = await res.json();
    setAuth(json);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuth({ authenticated: false });
  }

  // --- Loading State (Skeleton) ---
  if (auth === null) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse mb-6"></div>
        <div className="flex gap-4 mb-6">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-96 w-full bg-gray-100 rounded shadow-md animate-pulse"></div>
      </div>
    );
  }

  // --- Unauthenticated State (Sign In) ---
  if (!auth.authenticated) {
    return (
      <div className={`${colors.background} min-h-screen flex items-center justify-center p-4`}>
        <div className={`${colors.surface} ${colors.border} p-8 rounded-xl shadow-lg w-full max-w-sm`}>
          <h2 className={`text-2xl font-bold mb-6 ${colors.ink}`}>Admin Sign In</h2>
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
          }} className="grid gap-4">
            <input 
              name="email" 
              type="email" 
              placeholder="Email" 
              required
              className={`border p-3 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]`} 
            />
            <input 
              name="password" 
              type="password" 
              placeholder="Password" 
              required
              className={`border p-3 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]`} 
            />
            <button className={`w-full px-4 py-3 rounded-lg font-semibold transition ${colors.brand}`}>
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Authenticated State ---
  return (
    <div className={`p-6 md:p-10 ${colors.background} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header and Logout */}
        <div className="flex items-center justify-between p-4 mb-6 border-b border-gray-200">
          <div className={`text-xl font-medium ${colors.ink}`}>Welcome, **{auth.email}**</div>
          <button onClick={logout}  className="ml-2 px-3 py-2 border rounded-md text-sm sm:text-base whitespace-nowrap">
            Log out
          </button>
        </div>

        {/* Tab Navigation (Pill Style) */}
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100 mb-8 w-fit shadow-inner">
          <TabButton 
            isActive={tab === "projects"} 
            onClick={() => setTab("projects")}
            label="Project Creation"
          />
          <TabButton 
            isActive={tab === "gallery"} 
            onClick={() => setTab("gallery")}
            label="Project Manager"
          />
        </div>

        {/* Content */}
        <div className="p-4 rounded-xl">
          {tab === "projects" && <ProjectForm />}

          {tab === "gallery" && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              {/* FIX APPLIED: Removed the folder prop since CloudinaryGallery is now a Project Table */}
              <CloudinaryGallery /> 
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component for styled tabs
function TabButton({ isActive, onClick, label }: { isActive: boolean, onClick: () => void, label: string }) {
  const activeClasses = "bg-[#4F46E5] text-white shadow-md";
  const inactiveClasses = "text-gray-600 hover:bg-gray-200";
  
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-lg font-medium transition-all ${isActive ? activeClasses : inactiveClasses}`}
    >
      {label}
    </button>
  );
}