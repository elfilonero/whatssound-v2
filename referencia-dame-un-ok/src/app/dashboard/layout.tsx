"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import AdminSidebar from "../../components/dashboard/AdminSidebar";
import AdminHeader from "../../components/dashboard/AdminHeader";

function DashboardContent({ children, adminName }: { children: React.ReactNode; adminName: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99999, display: 'flex', background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)' }}>
      {/* Mobile sidebar toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-[100000] bg-white shadow-lg rounded-xl p-2"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform fixed lg:static z-[100000] h-full`}>
        <AdminSidebar />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <AdminHeader adminName={adminName} />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [authorized, setAuthorized] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const adminCode = searchParams.get("admin");
    const stored = sessionStorage.getItem("dok_admin_code") || localStorage.getItem("dok_admin_code");
    const storedName = sessionStorage.getItem("dok_admin_name") || localStorage.getItem("dok_admin_name");
    const code = adminCode || stored;

    if (!code) {
      setLoading(false);
      return;
    }

    async function validate() {
      try {
        const { supabase } = await import("../../lib/services/supabase");
        const { data } = await supabase
          .from("dok_admin_invitations")
          .select("*")
          .eq("code", code)
          .single();

        if (data) {
          setAuthorized(true);
          setAdminName(data.label || "Admin");
          sessionStorage.setItem("dok_admin_code", code!);
          sessionStorage.setItem("dok_admin_name", data.label || "Admin");
        }
      } catch (e) {
        console.error("Auth error:", e);
      } finally {
        setLoading(false);
      }
    }

    if (storedName && stored) {
      setAuthorized(true);
      setAdminName(storedName);
      setLoading(false);
    } else {
      validate();
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <p className="text-emerald-600 text-lg animate-pulse">Verificando acceso...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-6xl mb-4">🔒</p>
          <p className="text-gray-500 text-lg">Acceso denegado</p>
          <p className="text-gray-400 text-sm mt-2">Necesitas un código de admin válido</p>
        </div>
      </div>
    );
  }

  // Use portal to render outside the 390px container
  if (mounted && typeof document !== "undefined") {
    return createPortal(
      <DashboardContent adminName={adminName}>{children}</DashboardContent>,
      document.body
    );
  }

  return null;
}
