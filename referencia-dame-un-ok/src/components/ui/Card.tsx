import type { CSSProperties, ReactNode } from "react";
import { COLORS, BORDER_RADIUS } from "../../lib/constants/theme";

interface CardProps {
  children: ReactNode;
  padding?: string;
  style?: CSSProperties;
}

export default function Card({ children, padding = "14px 16px", style }: CardProps) {
  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: BORDER_RADIUS.card,
        padding,
        marginBottom: 12,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
