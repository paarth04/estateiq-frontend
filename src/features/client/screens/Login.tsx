import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

/**
 * Login / Signup (§10.1). Centered card on beige. Phone (+91, the identity key — §23.2) or email,
 * plus password. Phone is pre-filled when arriving from the widget (?phone=9876543210).
 * Mock only: any valid input "logs in" and goes Home. Real JWT auth replaces this at integration.
 */
type Mode = "login" | "signup";
type Method = "phone" | "email";

const inputCls =
  "w-full h-10 px-3 rounded-control border bg-surface text-body text-ink outline-none focus-visible:shadow-focus";

export function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");
  const [method, setMethod] = useState<Method>("phone");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(params.get("phone") ?? "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const digits = phone.replace(/\D/g, "");
  const errors = {
    name: mode === "signup" && !name.trim() ? "Enter your name." : "",
    phone: method === "phone" && !/^[6-9]\d{9}$/.test(digits) ? "Enter a 10-digit mobile number." : "",
    email: method === "email" && !/^\S+@\S+\.\S+$/.test(email) ? "Enter a valid email address." : "",
    password: password.length < 8 ? "Use at least 8 characters." : "",
  };
  const show = (k: keyof typeof errors) => (submitted ? errors[k] : "");

  // Display as "98765 43210" while typing; strip anything that isn't a digit.
  const onPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 10);
    setPhone(d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const firstError = (Object.keys(errors) as (keyof typeof errors)[]).find((k) => errors[k]);
    if (firstError) {
      document.getElementById(`f-${firstError}`)?.focus();
      return;
    }
    navigate("/");
  };

  const tab = (active: boolean) =>
    `flex-1 h-8 rounded-control text-body transition ${active ? "bg-surface text-ink border border-border" : "text-ink-soft hover:text-ink"}`;

  return (
    <div className="min-h-screen bg-bg grid place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="font-display font-semibold text-h2 tracking-tight">Estate<span className="text-accent-ink">IQ</span></div>
          <h1 className="text-h1 font-semibold tracking-tight mt-4">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="text-body text-ink-soft mt-1">See your enquiries and homes matched to you.</p>
        </div>

        <Card className="p-5">
          <form onSubmit={submit} noValidate className="space-y-4">
            <div className="flex gap-1 p-1 rounded-control bg-bg" role="group" aria-label="Sign in with">
              <button type="button" aria-pressed={method === "phone"} className={tab(method === "phone")} onClick={() => setMethod("phone")}>Phone</button>
              <button type="button" aria-pressed={method === "email"} className={tab(method === "email")} onClick={() => setMethod("email")}>Email</button>
            </div>

            {mode === "signup" && (
              <Field id="f-name" label="Name" error={show("name")}>
                <input id="f-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name"
                  aria-invalid={!!show("name")} className={`${inputCls} ${show("name") ? "border-negative" : "border-border"}`} />
              </Field>
            )}

            {method === "phone" ? (
              <Field id="f-phone" label="Mobile number" error={show("phone")}>
                <div className={`flex items-center rounded-control border overflow-hidden focus-within:shadow-focus ${show("phone") ? "border-negative" : "border-border"}`}>
                  <span className="px-3 h-10 grid place-items-center text-body text-ink-soft bg-bg border-r border-border" aria-hidden="true">+91</span>
                  <input id="f-phone" value={phone} onChange={(e) => onPhone(e.target.value)} inputMode="numeric" autoComplete="tel-national"
                    placeholder="98765 43210" aria-invalid={!!show("phone")} aria-describedby="f-phone-hint"
                    className="flex-1 h-10 px-3 text-body bg-surface outline-none tnum" />
                </div>
                <span id="f-phone-hint" className="sr-only">India, +91</span>
              </Field>
            ) : (
              <Field id="f-email" label="Email" error={show("email")}>
                <input id="f-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                  aria-invalid={!!show("email")} className={`${inputCls} ${show("email") ? "border-negative" : "border-border"}`} />
              </Field>
            )}

            <Field id="f-password" label="Password" error={show("password")}>
              <input id="f-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                aria-invalid={!!show("password")} className={`${inputCls} ${show("password") ? "border-negative" : "border-border"}`} />
            </Field>

            <Button type="submit" className="w-full">{mode === "login" ? "Log in" : "Create account"}</Button>
          </form>
        </Card>

        <p className="text-body text-ink-soft text-center mt-4">
          {mode === "login" ? "New here? " : "Already have an account? "}
          <button type="button" className="text-ink font-medium underline underline-offset-4"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setSubmitted(false); }}>
            {mode === "login" ? "Create an account" : "Log in"}
          </button>
        </p>
        <p className="text-small text-ink-muted text-center mt-6">We keep call transcripts only — never audio.</p>
      </div>
    </div>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-body text-ink-soft mb-1.5">{label}</label>
      {children}
      {error && <p id={`${id}-error`} role="alert" className="text-small text-negative mt-1">{error}</p>}
    </div>
  );
}
