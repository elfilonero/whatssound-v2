/** User-side types */

export type ActionKey = "alimentar" | "mimar" | "jugar";

export type ActionState = Record<ActionKey, boolean>;

export type PetMood =
  | "esperando"
  | "alimentado"
  | "mimado"
  | "jugado"
  | "euforico"
  | "dormido"
  | "triste"
  | "enfermo";

export interface PetConfig {
  name: string;
  avatar: string;   // path to avatar image
  background: string; // path to background image
  feeling: string;   // text to display
  gradient: string;  // screen background gradient
}

export interface UserProfile {
  id: string;
  name: string;
  petName: string;
  petType: "cat" | "dog" | "bird" | "plant"; // MVP: cat
  streak: number;
  lastCheckIn: Date | null;
  createdAt: Date;
}
