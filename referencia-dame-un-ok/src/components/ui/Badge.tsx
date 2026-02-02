import type { CSSProperties } from "react";

interface Props {
  icon: string;
  text: string;
  bgColor: string;
  style?: CSSProperties;
}

export default function Badge({ icon, text, bgColor, style }: Props) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: bgColor, color: "white",
      borderRadius: 25, padding: "8px 18px",
      fontSize: 16, fontWeight: 700,
      ...style,
    }}>
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}
