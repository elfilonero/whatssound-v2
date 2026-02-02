"use client";

import { useState, useEffect } from "react";

interface AdminHeaderProps {
  adminName?: string;
  onRefresh?: () => void;
}

export default function AdminHeader({ adminName = "Admin", onRefresh }: AdminHeaderProps) {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => setLastRefresh(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-emerald-100 flex items-center justify-between px-6">
      <div>
        <p className="text-sm text-gray-400">
          Última actualización: {lastRefresh.toLocaleTimeString("es-ES")} · Auto-refresh 60s
        </p>
      </div>
      <div className="flex items-center gap-4">
        {onRefresh && (
          <button
            onClick={() => { onRefresh(); setLastRefresh(new Date()); }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition"
          >
            🔄 Refrescar
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-sm">👤</span>
          </div>
          <span className="text-sm font-semibold text-emerald-800">{adminName}</span>
        </div>
      </div>
    </header>
  );
}
