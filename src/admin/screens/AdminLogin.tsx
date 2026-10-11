import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { DEMO_ADMIN, login, useAdminSession } from "../auth";
import { useAdminPrefs } from "../prefs";

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/** Admin sign-in (the only login, rev 3). Mock: checks the demo credentials shown below. */
export function AdminLogin() {
  const session = useAdminSession();
  const navigate = useNavigate();
  // Every sign-in starts on the chosen start page (Settings; default Dashboard), not the page that bounced them here.
  const home = useAdminPrefs().startPage;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [tried, setTried] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (session) return <Navigate to={home} replace />;

  const emailErr = !email ? "Enter your email." : !emailOk(email) ? "Enter a valid email address." : null;
  const pwErr = !password ? "Enter your password." : null;
  const showEmail = (touched.email || tried) && emailErr;
  const showPw = (touched.password || tried) && pwErr;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    setError(null);
    if (emailErr) { document.getElementById("al-email")?.focus(); return; }
    if (pwErr) { document.getElementById("al-password")?.focus(); return; }
    const err = login(email, password);
    if (err) { setError(err); return; }
    navigate(home, { replace: true });
  };

  const field = (bad: unknown) =>
    cn(
      "w-full h-10 px-3 rounded-control border bg-surface text-body text-ink outline-none placeholder:text-ink-muted focus-visible:shadow-focus",
      bad ? "border-negative" : "border-border focus-visible:border-accent",
    );

  return (
    <div className="min-h-screen bg-bg text-ink grid place-items-center px-4 py-10">
      <div className="fixed top-4 right-4"><ThemeToggle /></div>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-6">
          <BrandMark />
          <span className="text-small font-medium px-2 h-6 inline-flex items-center rounded-pill border border-accent text-accent-ink bg-accent-soft">Admin</span>
        </div>
        <form onSubmit={submit} noValidate className="rounded-card border border-border bg-surface p-6 space-y-4 shadow-sm" aria-labelledby="al-title">
          <div>
            <h1 id="al-title" className="font-display font-semibold text-h2 tracking-tight">Sign in</h1>
            <p className="text-body text-ink-soft mt-1">Company dashboard for the EstateIQ team.</p>
          </div>

          {error && <p role="alert" className="rounded-control border border-negative bg-negative/10 px-3 py-2 text-small text-ink">{error}</p>}

          <div>
            <label htmlFor="al-email" className="block text-body font-medium mb-1.5">Email <span className="text-negative" aria-hidden="true">*</span></label>
            <input
              id="al-email" type="email" autoComplete="username" value={email}
              onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              aria-required="true" aria-invalid={!!showEmail} aria-describedby={showEmail ? "al-email-err" : undefined}
              className={field(showEmail)}
            />
            {showEmail && <p id="al-email-err" className="text-small text-negative mt-1">{emailErr}</p>}
          </div>

          <div>
            <label htmlFor="al-password" className="block text-body font-medium mb-1.5">Password <span className="text-negative" aria-hidden="true">*</span></label>
            <div className={cn("flex items-center rounded-control border bg-surface focus-within:shadow-focus", showPw ? "border-negative" : "border-border focus-within:border-accent")}>
              <input
                id="al-password" type={show ? "text" : "password"} autoComplete="current-password" value={password}
                onChange={(e) => setPassword(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                aria-required="true" aria-invalid={!!showPw} aria-describedby={showPw ? "al-pw-err" : undefined}
                className="flex-1 min-w-0 h-10 px-3 bg-transparent border-0 outline-none shadow-none focus-visible:shadow-none text-body"
              />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}
                className="h-10 w-10 grid place-items-center text-ink-soft hover:text-ink rounded-control">
                {show ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
              </button>
            </div>
            {showPw && <p id="al-pw-err" className="text-small text-negative mt-1">{pwErr}</p>}
          </div>

          <Button type="submit" className="w-full">Sign in</Button>

          <p className="text-small text-ink-muted border-t border-border pt-3">
            Mock sign-in (no backend yet). Default demo account: <span className="text-ink font-medium">{DEMO_ADMIN.email}</span> / <span className="text-ink font-medium">{DEMO_ADMIN.password}</span>
          </p>
        </form>
      </div>
    </div>
  );
}
