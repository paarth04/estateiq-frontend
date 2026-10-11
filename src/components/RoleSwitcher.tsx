import type { Role } from "@/api/types";

/**
 * DEV-ONLY affordance. Lets you develop all three interfaces without real auth.
 * Replace with real JWT role from FastAPI at integration time, then delete this.
 */
export function RoleSwitcher({ role, setRole }: { role: Role; setRole: (r: Role) => void }) {
  const roles: Role[] = ["client", "agent", "admin"];
  return (
    <div className="fixed bottom-4 left-4 z-tooltip flex items-center gap-1 bg-surface border border-border rounded-pill shadow-sm p-1 text-small">
      <span className="px-2 text-ink-muted">role</span>
      {roles.map((r) => (
        <button
          key={r}
          onClick={() => setRole(r)}
          className={`h-7 px-2.5 rounded-pill transition ${role === r ? "bg-ink text-surface" : "text-ink-soft hover:bg-surface-hover"}`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
