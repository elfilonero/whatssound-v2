"use client";
import type { FamiliarTab } from "../../lib/types/familiar";
import HomeIcon from "./icons/HomeIcon";
import PeopleIcon from "./icons/PeopleIcon";
import BellIcon from "./icons/BellIcon";
import GearIcon from "./icons/GearIcon";

const TABS: { id: FamiliarTab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
  { id: "inicio", label: "Inicio", Icon: HomeIcon },
  { id: "familiares", label: "Familiares", Icon: PeopleIcon },
  { id: "alertas", label: "Alertas", Icon: BellIcon },
  { id: "ajustes", label: "Ajustes", Icon: GearIcon },
];

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: FamiliarTab) => void;
}

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      padding: "10px 0 20px",
      background: "rgba(255,255,255,0.9)",
      borderTop: "1px solid rgba(0,0,0,0.05)",
      zIndex: 10,
    }}>
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Icon active={activeTab === id} />
          <span style={{ fontSize: 11, fontWeight: 700, color: activeTab === id ? "#22c55e" : "#888" }}>
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}
