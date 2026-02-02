"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/users", label: "Usuarios", icon: "👤" },
  { href: "/dashboard/alerts", label: "Alertas", icon: "🚨" },
  { href: "/dashboard/engagement", label: "Engagement", icon: "📈" },
  { href: "/dashboard/revenue", label: "Revenue", icon: "💳" },
  { href: "/dashboard/chat", label: "Chat IA", icon: "🤖" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-emerald-100 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-emerald-100">
        <h1 className="text-xl font-black text-emerald-800">🐾 Dame un OK</h1>
        <p className="text-xs text-emerald-500 mt-1">Panel de Control</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-emerald-100 text-emerald-800"
                  : "text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-emerald-100">
        <p className="text-xs text-gray-400 text-center">
          v1.0 · Equipo Dame un OK
        </p>
      </div>
    </aside>
  );
}
