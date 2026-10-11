import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Landing } from "@/features/landing/Landing";
import { AdminRoutes } from "@/admin/AdminRoutes";

/**
 * Two surfaces (DESIGN.md rev 3):
 *   /  (and /landing) → public landing page — the whole client experience, no login
 *   /admin/*          → admin dashboard — the only login (mock, no auth yet)
 * Anything else goes to the landing page.
 */
export default function App() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return <AdminRoutes />;

  return (
    <Routes>
      <Route index element={<Landing />} />
      <Route path="landing" element={<Landing />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
