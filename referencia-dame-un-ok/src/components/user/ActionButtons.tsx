import type { ActionState, ActionKey } from "../../lib/types/user";
import { BUTTONS } from "../../lib/constants/theme";
import FishIcon from "../ui/icons/FishIcon";
import HeartIcon from "../ui/icons/HeartIcon";
import YarnIcon from "../ui/icons/YarnIcon";
import CheckIcon from "../ui/icons/CheckIcon";

interface ActionButtonsProps {
  actions: ActionState;
  onAction: (action: ActionKey) => void;
}

const ACTION_BUTTONS: { key: ActionKey; label: string; Icon: React.FC }[] = [
  { key: "alimentar", label: "Alimentar", Icon: FishIcon },
  { key: "mimar", label: "Mimar", Icon: HeartIcon },
  { key: "jugar", label: "Jugar", Icon: YarnIcon },
];

export default function ActionButtons({ actions, onAction }: ActionButtonsProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: "0 14px 32px", zIndex: 10 }}>
      {ACTION_BUTTONS.map(({ key, label, Icon }) => {
        const done = actions[key];
        return (
          <button
            key={key}
            onClick={() => onAction(key)}
            disabled={done}
            style={{
              background: done ? BUTTONS.completed.bg : BUTTONS[key].bg,
              border: done ? BUTTONS.completed.border : "none",
              borderRadius: 18,
              padding: "18px 8px 14px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              cursor: done ? "default" : "pointer",
              boxShadow: done ? BUTTONS.completed.shadow : BUTTONS[key].shadow,
              transition: "all 0.3s ease",
            }}
          >
            {done ? <CheckIcon /> : <Icon />}
            <span style={{ fontSize: 20, fontWeight: 800, color: "#111" }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
