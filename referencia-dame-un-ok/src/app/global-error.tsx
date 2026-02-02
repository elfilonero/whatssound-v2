"use client";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);
  return (
    <html><body>
      <div style={{padding:40,textAlign:"center",fontFamily:"system-ui"}}>
        <h2>Algo salió mal 😿</h2>
        <p style={{color:"#666"}}>Estamos trabajando en ello</p>
        <button onClick={reset} style={{padding:"10px 20px",borderRadius:8,border:"none",background:"#22c55e",color:"white",fontSize:16,cursor:"pointer"}}>
          Reintentar
        </button>
      </div>
    </body></html>
  );
}
