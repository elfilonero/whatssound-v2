"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/services/supabase";
import { subscribeToPush } from "../../../lib/services/push";

export default function MagicLink() {
  const { code } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState("Entrando...");
  const [welcome, setWelcome] = useState<{ userName: string; familiarName: string; visitorUserId: string } | null>(null);

  useEffect(() => {
    async function enter() {
      const inviteCode = code as string;

      // 1. Check if user already exists for this code
      const { data: existing } = await supabase
        .from("dok_users")
        .select("*")
        .eq("invite_code", inviteCode)
        .single();

      if (existing) {
        // Reuse existing session if available, otherwise create new anon
        const { data: sessionData } = await supabase.auth.getSession();
        let authUserId = sessionData?.session?.user?.id;
        if (!authUserId) {
          const { data: anonData } = await supabase.auth.signInAnonymously();
          authUserId = anonData?.user?.id;
        }
        if (authUserId && authUserId !== existing.auth_id) {
          await supabase.from("dok_users")
            .update({ auth_id: authUserId })
            .eq("invite_code", inviteCode);
        }
        localStorage.setItem("dok_code", inviteCode);

        // Get familiar name for welcome screen
        const familiarName = await getFamiliarName(existing.id);
        setWelcome({ userName: existing.name || "amigo", familiarName, visitorUserId: existing.id });
        return;
      }

      // 2. Look up invitation to get config
      const { data: invitation } = await supabase
        .from("dok_invitations")
        .select("familiar_id, familiar_name, schedules, pet_type")
        .eq("code", inviteCode)
        .single();

      // 3. Create new anonymous user
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
      if (!anonData?.user || anonError) {
        setStatus("Error al entrar");
        return;
      }

      const familiarName = invitation?.familiar_name || inviteCode;
      const petType = invitation?.pet_type || "cat";

      const { data: newUser, error: insertError } = await supabase.from("dok_users").insert({
        auth_id: anonData.user.id,
        name: familiarName,
        email: `${inviteCode}@dameunok.app`,
        pet_name: "Fufy",
        pet_type: petType,
        streak: 0,
        onboarded: true,
        invite_code: inviteCode,
      }).select("id").single();

      if (insertError || !newUser) {
        setStatus("Error al crear usuario");
        return;
      }

      // 4. Apply schedules from invitation
      if (invitation?.schedules && Array.isArray(invitation.schedules)) {
        const scheduleRows = invitation.schedules.map((s: { type: string; time: string }) => ({
          user_id: newUser.id,
          type: s.type,
          time: s.time,
        }));
        await supabase.from("dok_schedules").insert(scheduleRows);
      }

      // 5. Link this user to the admin familiar who invited them
      let creatorFamiliarName = "tu familiar";
      if (invitation?.familiar_id) {
        // Use server-side API to bypass RLS and link user to admin
        await fetch("/api/link-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ familiarId: invitation.familiar_id, userId: newUser.id, invitationCode: inviteCode }),
        });
        // Get the admin's display name
        const { data: famData } = await supabase
          .from("dok_familiares")
          .select("familiar_name")
          .eq("id", invitation.familiar_id)
          .single();
        if (famData?.familiar_name) creatorFamiliarName = famData.familiar_name;
      }

      localStorage.setItem("dok_code", inviteCode);
      setWelcome({ userName: familiarName, familiarName: creatorFamiliarName, visitorUserId: newUser.id });
    }

    async function getFamiliarName(userId: string): Promise<string> {
      const { data } = await supabase
        .from("dok_familiares")
        .select("familiar_name")
        .eq("linked_user_id", userId)
        .limit(1)
        .single();
      return data?.familiar_name || "tu familiar";
    }

    enter();
  }, [code, router]);

  // Welcome screen
  if (welcome) {
    return (
      <div style={{
        height: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #e8f5e9 0%, #c8e6c9 100%)",
        padding: 24,
      }}>
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <img
            src="/avatars/misi-base-saludando.png"
            alt="Fufy saludando"
            style={{ width: 180, height: 180, objectFit: "contain", marginBottom: 16 }}
          />
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#2e7d32", margin: "0 0 12px 0" }}>
            ¡Hola! 👋
          </h1>
          <p style={{ fontSize: 20, color: "#444", lineHeight: 1.5, margin: "0 0 8px 0" }}>
            Este es Fufy, tu nueva mascota virtual
          </p>
          <p style={{ fontSize: 18, color: "#666", lineHeight: 1.5, margin: "0 0 32px 0" }}>
            Cuídala cada día y la harás muy feliz 🐱
          </p>
          <button
            onClick={async () => {
              // Request push permission and subscribe before navigating
              if (welcome.visitorUserId) {
                await subscribeToPush(welcome.visitorUserId).catch(() => {});
              }
              router.replace("/");
            }}
            style={{
              width: "100%",
              padding: "18px 24px",
              fontSize: 22,
              fontWeight: 800,
              background: "#43a047",
              color: "white",
              border: "none",
              borderRadius: 16,
              cursor: "pointer",
              minHeight: 56,
              boxShadow: "0 4px 12px rgba(67,160,71,0.3)",
            }}
          >
            ¡Empezar! 🐱
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: "100dvh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(180deg, #e8f5e9 0%, #c8e6c9 100%)",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🐱</div>
        <p style={{ fontSize: 18, fontWeight: 700, color: "#555" }}>{status}</p>
      </div>
    </div>
  );
}
