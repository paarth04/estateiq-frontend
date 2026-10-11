/**
 * MOCK admin auth — no backend yet. A "session" is just a localStorage entry.
 * Replace with the real JWT flow (POST /auth/login → token; logout clears it) at integration.
 */
import { useSyncExternalStore } from "react";

const KEY = "eq-admin-session";
/** Demo credentials, shown on the login page. Mock only. */
export const DEMO_ADMIN = { email: "admin@estateiq.in", password: "admin123", name: "Admin" };

export interface AdminSession { email: string; name: string; at: number }

const read = (): AdminSession | null => {
  try { const raw = localStorage.getItem(KEY); return raw ? (JSON.parse(raw) as AdminSession) : null; } catch { return null; }
};

let session = read();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());

// Logging out in one tab logs out the others.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => { if (e.key === KEY) { session = read(); emit(); } });
}

export function useAdminSession(): AdminSession | null {
  return useSyncExternalStore((fn) => { listeners.add(fn); return () => listeners.delete(fn); }, () => session);
}

/* The one admin account (mock). Name/email/password are editable in Settings and persisted. */
const ACCOUNT_KEY = "eq-admin-account";
interface Account { name: string; email: string; password: string }
const readAccount = (): Account => {
  try { const raw = localStorage.getItem(ACCOUNT_KEY); if (raw) return JSON.parse(raw) as Account; } catch { /* fall through */ }
  return { ...DEMO_ADMIN };
};
const saveAccount = (a: Account) => { try { localStorage.setItem(ACCOUNT_KEY, JSON.stringify(a)); } catch { /* not persisted */ } };
const persistSession = () => { try { if (session) localStorage.setItem(KEY, JSON.stringify(session)); } catch { /* ignore */ } };

/** Mock check against the admin account. Returns an error message, or null on success. */
export function login(email: string, password: string): string | null {
  const acct = readAccount();
  if (email.trim().toLowerCase() !== acct.email.toLowerCase() || password !== acct.password) {
    return "That email and password don't match an admin account.";
  }
  session = { email: acct.email, name: acct.name, at: Date.now() };
  try { localStorage.setItem(KEY, JSON.stringify(session)); } catch { /* storage blocked — session lives in memory */ }
  emit();
  return null;
}

/** Clear the mock auth state (and per-admin UI prefs) from localStorage. */
export function logout() {
  session = null;
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem("eq-admin-sidebar-collapsed");
  } catch { /* ignore */ }
  emit();
}

/** Update the admin's name/email (mock "PATCH /me"). Keeps the live session in step. */
export function updateProfile(name: string, email: string) {
  const acct = { ...readAccount(), name: name.trim(), email: email.trim().toLowerCase() };
  saveAccount(acct);
  if (session) { session = { ...session, name: acct.name, email: acct.email }; persistSession(); emit(); }
}

/** Mock "POST /me/password". Returns an error message, or null on success. Not a real backend. */
export function changePassword(current: string, next: string): string | null {
  const acct = readAccount();
  if (current !== acct.password) return "Your current password isn't right.";
  saveAccount({ ...acct, password: next });
  return null;
}
