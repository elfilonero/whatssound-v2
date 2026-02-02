"use client";
import { useState, useEffect } from "react";

interface ShareButtonsProps {
  url: string;
  recipientName?: string;
  onShare?: () => void;
}

function getWhatsAppMessage(url: string): string {
  return `¡Te tengo un regalo! 🎁

Se llama Fufy, es una mascota virtual que necesita que la cuides. Dale de comer 3 veces al día y mímala mucho.

Ábrelo aquí: ${url}

¡Te va a encantar! 😺`;
}

export default function ShareButtons({ url, onShare }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    onShare?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const msg = getWhatsAppMessage(url);
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    onShare?.();
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "¡Conoce a Fufy!",
          text: "¡Te regalo una mascota virtual! Se llama Fufy y necesita que la cuides. Dale de comer cada día.",
          url,
        });
        onShare?.();
      } catch {
        // User cancelled
      }
    }
  };

  const btnBase: React.CSSProperties = {
    width: "100%",
    padding: "14px",
    borderRadius: 25,
    fontSize: 16,
    fontWeight: 800,
    border: "none",
    cursor: "pointer",
    transition: "background 0.2s",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Copy */}
      <button onClick={handleCopy} style={{
        ...btnBase,
        background: copied ? "#16a34a" : "#22c55e",
        color: "white",
      }}>
        {copied ? "✅ Enlace copiado" : "📋 Copiar enlace"}
      </button>

      {/* WhatsApp */}
      <button onClick={handleWhatsApp} style={{
        ...btnBase,
        background: "#25D366",
        color: "white",
      }}>
        💬 Compartir por WhatsApp
      </button>

      {/* Native share */}
      {canShare && (
        <button onClick={handleNativeShare} style={{
          ...btnBase,
          background: "#3b82f6",
          color: "white",
        }}>
          📱 Compartir...
        </button>
      )}

      {/* Message preview */}
      <details style={{ marginTop: 4 }}>
        <summary style={{
          fontSize: 13, color: "#888", cursor: "pointer", textAlign: "center",
        }}>
          👀 Ver mensaje que se enviará
        </summary>
        <div style={{
          marginTop: 8, padding: "12px 14px", borderRadius: 12,
          background: "#f0fdf4", border: "1px solid #dcfce7",
          fontSize: 13, color: "#555", whiteSpace: "pre-line", lineHeight: 1.5,
        }}>
          {getWhatsAppMessage(url)}
        </div>
      </details>
    </div>
  );
}
