"use client";
import { useState, useEffect } from "react";
import FamiliarDashboard from "../../components/familiar/FamiliarDashboard";
import FamiliarOnboardingWizard from "../../components/familiar/FamiliarOnboardingWizard";
import { supabase } from "../../lib/services/supabase";
import { GRADIENTS, COLORS } from "../../lib/constants/theme";
import Card from "../../components/ui/Card";
import { PET_AVATARS } from "../../lib/constants/pets";
import { useAuth } from "../../lib/context/AuthContext";

interface DokUserSummary {
  id: string;
  name: string;
  email: string;
  pet_name: string;
  streak: number;
  last_check_in: string | null;
  invite_code: string | null;
}

export default function FamiliarPage() {
  const { dokFamiliar } = useAuth();
  const [users, setUsers] = useState<DokUserSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [viewerMode, setViewerMode] = useState(false);
  const [viewerValidating, setViewerValidating] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [adminMode, setAdminMode] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [adminValidating, setAdminValidating] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminFamiliarId, setAdminFamiliarId] = useState<string | null>(null);

  // Determine effective role
  const effectiveRole: "admin" | "viewer" = viewerMode
    ? "viewer"
    : (dokFamiliar?.rol === "viewer" ? "viewer" : "admin");

  // Check for viewer code in URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const viewerCode = params.get("viewer");
    if (!viewerCode) return;

    // Check localStorage first — already validated
    const storedCode = localStorage.getItem("dok_viewer_code");
    const storedRole = localStorage.getItem("dok_viewer_role");
    if (storedCode === viewerCode && storedRole === "viewer") {
      setViewerMode(true);
      setOnboarded(true);
      return;
    }

    // Validate viewer code against DB
    setViewerValidating(true);
    (async () => {
      try {
        const { data: invitation, error } = await supabase
          .from("dok_viewer_invitations")
          .select("*")
          .eq("code", viewerCode)
          .eq("used", false)
          .maybeSingle();

        if (error || !invitation) {
          setViewerError("Enlace de visor inválido o ya utilizado.");
          setViewerValidating(false);
          return;
        }

        // Sign in anonymously
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
        if (authError || !authData.user) {
          setViewerError("Error al crear sesión anónima.");
          setViewerValidating(false);
          return;
        }

        const authId = authData.user.id;

        // Create familiar record with viewer role
        // Get creator's user_id from their familiar record if available
        let userId: string | null = null;
        if (invitation.creator_familiar_id) {
          const { data: creatorFam } = await supabase
            .from("dok_familiares")
            .select("user_id")
            .eq("id", invitation.creator_familiar_id)
            .maybeSingle();
          if (creatorFam) userId = creatorFam.user_id;
        }

        // If no creator link, get first available user
        if (!userId) {
          const { data: anyUser } = await supabase
            .from("dok_users")
            .select("id")
            .limit(1)
            .maybeSingle();
          if (anyUser) userId = anyUser.id;
        }

        if (userId) {
          await supabase.from("dok_familiares").insert({
            auth_id: authId,
            user_id: userId,
            familiar_name: "Visor",
            familiar_email: "",
            relacion: "visor",
            rol: "viewer",
            onboarded: true,
          });
        }

        // Mark invitation as used
        await supabase
          .from("dok_viewer_invitations")
          .update({ used: true, used_by_auth_id: authId })
          .eq("id", invitation.id);

        // Save to localStorage
        localStorage.setItem("dok_viewer_code", viewerCode);
        localStorage.setItem("dok_viewer_role", "viewer");
        localStorage.setItem("dok_onboarded", "true");

        setViewerMode(true);
        setOnboarded(true);
        setViewerValidating(false);
      } catch {
        setViewerError("Error validando enlace de visor.");
        setViewerValidating(false);
      }
    })();
  }, []);

  // Check for admin code in URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const adminCode = params.get("admin");
    if (!adminCode) {
      // Check localStorage for existing admin session
      const storedAdminCode = localStorage.getItem("dok_admin_code");
      if (storedAdminCode) {
        setAdminMode(true);
        setOnboarded(false); // will show wizard if not onboarded
      }
      return;
    }

    // Check localStorage first — already validated
    const storedCode = localStorage.getItem("dok_admin_code");
    if (storedCode === adminCode) {
      setAdminMode(true);
      return;
    }

    // Validate admin code against DB
    setAdminValidating(true);
    (async () => {
      try {
        const { data: invitation, error } = await supabase
          .from("dok_admin_invitations")
          .select("*")
          .eq("code", adminCode)
          .maybeSingle();

        if (error || !invitation) {
          setAdminError("Enlace de admin inválido.");
          setAdminValidating(false);
          return;
        }

        // Allow reuse if already used (same link can be reopened)
        // But if used by someone else, still allow (MVP simplicity)

        // Sign in anonymously
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
        if (authError || !authData.user) {
          setAdminError("Error al crear sesión anónima.");
          setAdminValidating(false);
          return;
        }

        const authId = authData.user.id;

        // Check if familiar record already exists for this auth_id
        const { data: existingFam } = await supabase
          .from("dok_familiares")
          .select("id")
          .eq("auth_id", authId)
          .limit(1)
          .maybeSingle();

        if (!existingFam) {
          // Get first available user to link to (or null)
          const { data: anyUser } = await supabase
            .from("dok_users")
            .select("id")
            .limit(1)
            .maybeSingle();

          const { data: newFam } = await supabase.from("dok_familiares").insert({
            auth_id: authId,
            user_id: anyUser?.id || null,
            familiar_name: invitation.label || "Admin",
            familiar_email: "",
            relacion: "familiar",
            rol: "admin",
            onboarded: false,
          }).select("id").maybeSingle();

          if (newFam) setAdminFamiliarId(newFam.id);
        } else {
          setAdminFamiliarId(existingFam.id);
        }

        // Mark invitation as used
        if (!invitation.used) {
          await supabase
            .from("dok_admin_invitations")
            .update({ used: true, used_by: authId, used_at: new Date().toISOString() })
            .eq("id", invitation.id);
        }

        // Save to localStorage
        localStorage.setItem("dok_admin_code", adminCode);

        setAdminMode(true);
        setAdminValidating(false);
      } catch {
        setAdminError("Error validando enlace de admin.");
        setAdminValidating(false);
      }
    })();
  }, []);

  // Check onboarded status
  useEffect(() => {
    if (viewerMode) return; // already handled
    if (dokFamiliar) {
      setOnboarded(dokFamiliar.onboarded === true);
    } else if (!loading) {
      const stored = typeof window !== "undefined" && localStorage.getItem("dok_onboarded");
      setOnboarded(stored === "true");
    }
  }, [dokFamiliar, loading, viewerMode]);

  // Load users filtered by familiar relationship (RLS handles it too)
  useEffect(() => {
    async function loadUsers() {
      if (dokFamiliar) {
        const { data: famLinks } = await supabase
          .from("dok_familiares")
          .select("linked_user_id")
          .eq("auth_id", dokFamiliar.auth_id)
          .not("linked_user_id", "is", null);
        const userIds = (famLinks || []).map((f: { linked_user_id: string }) => f.linked_user_id);
        if (userIds.length > 0) {
          const { data } = await supabase
            .from("dok_users")
            .select("id, name, email, pet_name, streak, last_check_in, invite_code")
            .in("id", userIds)
            .order("last_check_in", { ascending: false, nullsFirst: false });
          setUsers(data || []);
        } else {
          setUsers([]);
        }
      } else {
        const { data } = await supabase
          .from("dok_users")
          .select("id, name, email, pet_name, streak, last_check_in, invite_code")
          .order("last_check_in", { ascending: false, nullsFirst: false });
        setUsers(data || []);
      }
      setLoading(false);
    }
    loadUsers();
    const interval = setInterval(loadUsers, 30000);
    return () => clearInterval(interval);
  }, [dokFamiliar]);

  // Admin validation in progress
  if (adminValidating) {
    return (
      <div style={{ width: "100%", height: "100dvh", background: GRADIENTS.mint, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card>
          <p style={{ textAlign: "center", fontSize: 16, color: "#555" }}>🔐 Validando enlace de admin...</p>
        </Card>
      </div>
    );
  }

  // Admin error
  if (adminError) {
    return (
      <div style={{ width: "100%", height: "100dvh", background: GRADIENTS.mint, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card>
          <p style={{ textAlign: "center", fontSize: 16, color: "#ef4444", fontWeight: 700 }}>❌ {adminError}</p>
          <p style={{ textAlign: "center", fontSize: 13, color: "#888", marginTop: 8 }}>Verifica que el enlace es correcto.</p>
        </Card>
      </div>
    );
  }

  // Viewer validation in progress
  if (viewerValidating) {
    return (
      <div style={{ width: "100%", height: "100dvh", background: GRADIENTS.mint, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card>
          <p style={{ textAlign: "center", fontSize: 16, color: "#555" }}>🔍 Validando enlace de visor...</p>
        </Card>
      </div>
    );
  }

  // Viewer error
  if (viewerError) {
    return (
      <div style={{ width: "100%", height: "100dvh", background: GRADIENTS.mint, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card>
          <p style={{ textAlign: "center", fontSize: 16, color: "#ef4444", fontWeight: 700 }}>❌ {viewerError}</p>
          <p style={{ textAlign: "center", fontSize: 13, color: "#888", marginTop: 8 }}>Pide al administrador que genere un nuevo enlace.</p>
        </Card>
      </div>
    );
  }

  // Show wizard if not onboarded (skip for viewer)
  if (!viewerMode && onboarded === false) {
    return (
      <FamiliarOnboardingWizard
        familiarId={dokFamiliar?.id || adminFamiliarId || null}
        onComplete={() => setOnboarded(true)}
      />
    );
  }

  // If a user is selected, show their dashboard
  if (selectedUserId) {
    return (
      <div>
        <div style={{
          position: "fixed", top: 0, left: "50%", transform: "translateX(-50)",
          width: "100%", maxWidth: 390, zIndex: 100,
          background: "rgba(255,255,255,0.95)", padding: "8px 16px",
          borderBottom: "1px solid #e0e0e0",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <button
            onClick={() => setSelectedUserId(null)}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: "4px 8px" }}
          >← Todos</button>
          {effectiveRole === "viewer" && (
            <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", background: "#fef3c7", padding: "2px 8px", borderRadius: 8, marginLeft: "auto" }}>
              👁️ Visor
            </span>
          )}
        </div>
        <div style={{ paddingTop: 48 }}>
          <FamiliarDashboard userId={selectedUserId} role={effectiveRole} familiarId={dokFamiliar?.id} />
        </div>
      </div>
    );
  }

  // User list view
  return (
    <div style={{
      width: "100%", height: "100dvh", background: GRADIENTS.mint,
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "16px 18px 8px", textAlign: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: "0 0 4px" }}>
          👨‍👩‍👧 Panel Familiar
        </h1>
        <p style={{ fontSize: 13, color: COLORS.textMuted, margin: 0 }}>
          {users.length} usuario{users.length !== 1 ? "s" : ""} registrado{users.length !== 1 ? "s" : ""}
        </p>
        {effectiveRole === "viewer" && (
          <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", background: "#fef3c7", padding: "4px 12px", borderRadius: 12, display: "inline-block", marginTop: 6 }}>
            👁️ Modo visor — solo lectura
          </span>
        )}
      </div>

      {/* User cards */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
        {loading && <p style={{ textAlign: "center", color: "#888" }}>Cargando...</p>}
        {!loading && users.length === 0 && (
          <Card>
            <p style={{ textAlign: "center", color: "#888" }}>
              No hay usuarios registrados todavía.
              <br />Envía un enlace tipo <b>dame-un-ok.vercel.app/u/nombre</b>
            </p>
          </Card>
        )}
        {users.map(u => {
          const hasActivity = !!u.last_check_in;
          const lastTime = u.last_check_in ? new Date(u.last_check_in) : null;
          const minutesAgo = lastTime ? (Date.now() - lastTime.getTime()) / 60000 : Infinity;
          const isOk = minutesAgo < 60;
          const isAlert = minutesAgo >= 60 && minutesAgo < 360;
          const isEmergency = minutesAgo >= 360 && hasActivity;
          
          let statusColor = "#f59e0b";
          let statusText = "⏳ Esperando";
          if (isOk) { statusColor = "#22c55e"; statusText = "✅ Todo bien"; }
          else if (isEmergency) { statusColor = "#ef4444"; statusText = "🚨 Sin respuesta"; }
          else if (isAlert) { statusColor = "#f59e0b"; statusText = "⚠️ Sin respuesta"; }

          return (
            <div
              key={u.id}
              onClick={() => setSelectedUserId(u.id)}
              style={{
                background: "rgba(255,255,255,0.85)", borderRadius: 16,
                padding: "16px", marginBottom: 12, cursor: "pointer",
                border: `2px solid ${statusColor}20`,
                transition: "transform 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 50, height: 50 }}>
                  <img
                    src={isOk ? PET_AVATARS.euforico : isEmergency ? PET_AVATARS.enfermo : isAlert ? PET_AVATARS.triste : PET_AVATARS.esperando}
                    alt="Fufy"
                    style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.12))" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: "#2d3436", margin: "0 0 2px" }}>
                    {u.name}
                  </p>
                  <p style={{ fontSize: 13, color: "#888", margin: "0 0 4px" }}>
                    {u.invite_code ? `/${u.invite_code}` : u.email}
                  </p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: statusColor,
                      background: `${statusColor}15`, padding: "2px 8px", borderRadius: 8,
                    }}>{statusText}</span>
                    <span style={{ fontSize: 12, color: "#aaa" }}>
                      {u.streak > 0 ? `🔥 ${u.streak} días` : ""}
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: 20, color: "#ccc" }}>→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
