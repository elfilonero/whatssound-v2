"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../lib/context/AuthContext";
import { GRADIENTS } from "../../lib/constants/theme";

const PUBLIC_PATHS = ["/login", "/registro-familiar", "/landing", "/demo", "/pricing", "/admin", "/familiar", "/dashboard"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + "/")) || pathname.startsWith("/u/");

  useEffect(() => {
    if (loading) return;
    if (!session && !isPublicPath) {
      router.replace("/landing");
    }
    // Only redirect away from login/registro if authenticated, NOT from landing/pricing/admin
    const authRedirectPaths = ["/login", "/registro-familiar"];
    if (session && authRedirectPaths.includes(pathname)) {
      router.replace("/");
    }
  }, [session, loading, isPublicPath, router, pathname]);

  if (loading) {
    return (
      <div style={{
        width: "100%",
        height: "100dvh",
        background: GRADIENTS.mint,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🐱</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#555" }}>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session && !isPublicPath) return null;
  const authRedirectPaths = ["/login", "/registro-familiar"];
  if (session && authRedirectPaths.includes(pathname)) return null;

  return <>{children}</>;
}
