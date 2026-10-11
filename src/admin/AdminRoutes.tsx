import type { ReactElement } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { Overview } from "./screens/Overview";
import { Analytics } from "./screens/Analytics";
import { Leads } from "./screens/Leads";
import { LeadDetail } from "./screens/LeadDetail";
import { Projects } from "./screens/Projects";
import { ProjectAdmin } from "./screens/ProjectAdmin";
import { AdminLogin } from "./screens/AdminLogin";
import { Settings } from "./screens/Settings";
import { useAdminSession } from "./auth";

/** Mock guard: no session → login page (sign-in always lands on the Dashboard). */
function RequireAdmin({ children }: { children: ReactElement }) {
  const session = useAdminSession();
  return session ? children : <Navigate to="/admin/login" replace />;
}

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="admin/login" element={<AdminLogin />} />
      <Route path="admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<Overview />} />
        <Route path="leads" element={<Leads />} />
        <Route path="leads/:id" element={<LeadDetail />} />
        {/* Calls merged into Leads — old links still land somewhere useful */}
        <Route path="calls" element={<Navigate to="/admin/leads" replace />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectAdmin />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="ai-models" element={<Navigate to="/admin" replace />} />
        <Route path="users" element={<Navigate to="/admin" replace />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
