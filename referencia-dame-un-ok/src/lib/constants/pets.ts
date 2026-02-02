import type { PetMood } from "../types";
import { GRADIENTS } from "./theme";

/** Avatar image paths by mood */
export const PET_AVATARS: Record<PetMood, string> = {
  esperando: "/avatars/misi-esperando.png",
  alimentado: "/avatars/misi-contento.png",
  mimado: "/avatars/misi-contento.png",
  jugado: "/avatars/misi-euforico.png",
  euforico: "/avatars/misi-euforico.png",
  dormido: "/avatars/misi-dormido.png",
  triste: "/avatars/misi-triste.png",
  enfermo: "/avatars/misi-enfermo.png",
};

/** Feeling text by mood */
export const PET_FEELINGS: Record<PetMood, string> = {
  esperando: "¿Jugamos?",
  alimentado: "¡Qué rico!",
  mimado: "¡Qué gustito!",
  jugado: "¡Qué divertido!",
  euforico: "¡Te quiero!",
  dormido: "Zzz...",
  triste: "Te echo de menos...",
  enfermo: "No me encuentro bien...",
};

/** Background images by mood */
export const PET_BACKGROUNDS: Record<PetMood, string> = {
  esperando: "/avatars/fondo-suelo-dia.jpg",
  alimentado: "/avatars/fondo-suelo-dia.jpg",
  mimado: "/avatars/fondo-suelo-dia.jpg",
  jugado: "/avatars/fondo-suelo-dia.jpg",
  euforico: "/avatars/fondo-suelo-dia.jpg",
  dormido: "/avatars/fondo-suelo-noche.jpg",
  triste: "/avatars/fondo-suelo-dia.jpg",
  enfermo: "/avatars/fondo-suelo-enfermo.jpg",
};

/** Screen gradient by mood */
export const PET_GRADIENTS: Record<PetMood, string> = {
  esperando: GRADIENTS.mint,
  alimentado: GRADIENTS.mint,
  mimado: GRADIENTS.mint,
  jugado: GRADIENTS.mint,
  euforico: GRADIENTS.mint,
  dormido: GRADIENTS.night,
  triste: GRADIENTS.mint,
  enfermo: GRADIENTS.sick,
};

/** Default pet name (MVP) */
export const DEFAULT_PET_NAME = "Fufy";
