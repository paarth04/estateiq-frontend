import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Home, ClipboardList, LayoutGrid, Building2, User } from "lucide-react";
import { CLIENT } from "@/api/mock";
import { ClientUIProvider } from "./ClientUI";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/enquiries", label: "Enquiries", icon: ClipboardList, end: false },
  { to: "/properties", label: "Properties", icon: LayoutGrid, end: false },
  { to: "/projects", label: "Projects", icon: Building2, end: false },
  { to: "/profile", label: "Profile", icon: User, end: false },
];

export function ClientLayout() {
  const navigate = useNavigate();
  return (
    <ClientUIProvider>
      <div className="min-h-screen bg-bg">
        <header className="sticky top-0 z-sticky-nav bg-bg/80 backdrop-blur border-b border-border">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-6">
            <button onClick={() => navigate("/")} className="font-display font-semibold text-h2 tracking-tight">
              Estate<span className="text-accent-ink">IQ</span>
            </button>
            <nav className="hidden md:flex items-center gap-1 ml-2">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    `h-9 px-3 grid place-items-center rounded-control text-body transition ${
                      isActive ? "bg-surface text-ink border border-border" : "text-ink-soft hover:text-ink"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <ThemeToggle />
              <span className="hidden sm:block text-body text-ink-soft">{CLIENT.name}</span>
              <div className="w-9 h-9 rounded-pill bg-accent text-on-accent grid place-items-center text-body font-semibold">
                {CLIENT.name.split(" ").map((w) => w[0]).join("")}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-6 md:py-10 pb-28 md:pb-16">
          <Outlet />
        </main>

        <nav className="md:hidden fixed bottom-0 inset-x-0 z-sticky-nav bg-surface/95 backdrop-blur border-t border-border">
          <div className="grid grid-cols-5">
            {NAV.map((n) => {
              const I = n.icon;
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 py-2.5 text-small ${isActive ? "text-accent-ink" : "text-ink-muted"}`
                  }
                >
                  <I size={22} strokeWidth={1.5} />
                  {n.label}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
    </ClientUIProvider>
  );
}
