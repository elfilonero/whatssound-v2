import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/context/AuthContext";
import AuthGuard from "../components/auth/AuthGuard";
import ServiceWorkerRegistrar from "../components/pwa/ServiceWorkerRegistrar";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dame un Ok — Cuida a tus mayores cada día",
  description: "La tranquilidad de saber que tus mayores están bien. Tu familiar cuida a su mascota virtual Fufy con 3 toques y tú recibes la confirmación en tiempo real.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
  openGraph: {
    title: "Dame un Ok — La tranquilidad de saber que están bien",
    description: "Tu familiar cuida a Fufy con 3 toques al día. Tú recibes la confirmación en tiempo real. Gratis.",
    siteName: "Dame un Ok",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dame un Ok",
    description: "La tranquilidad de saber que tus mayores están bien, cada día",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dame un Ok",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#22c55e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className={nunito.className}>
        <AuthProvider>
          <div id="app-wrapper" style={{ width: '100%', maxWidth: 390, margin: '0 auto', minHeight: '100dvh', position: 'relative', overflow: 'hidden' }}>
            <AuthGuard>
              {children}
            </AuthGuard>
          </div>
        </AuthProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
