import { useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Landing } from "@/features/landing/Landing";
import type { Role } from "@/api/types";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { Button } from "@/components/Button";
import { ClientLayout } from "@/features/client/ClientLayout";
import { Home } from "@/features/client/screens/Home";
import { Enquiries } from "@/features/client/screens/Enquiries";
import { EnquiryDetail } from "@/features/client/screens/EnquiryDetail";
import { Properties } from "@/features/client/screens/Properties";
import { Projects } from "@/features/client/screens/Projects";
import { ProjectDetail } from "@/features/client/screens/ProjectDetail";
import { Profile } from "@/features/client/screens/Profile";
import { Login } from "@/features/client/screens/Login";

/** Placeholder for interfaces not built yet (agent/admin). */
function ComingSoon({ role }: { role: Role }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-bg grid place-items-center px-4">
      <div className="text-center max-w-sm">
        <div className="font-display font-semibold text-h2 tracking-tight mb-2">Estate<span className="text-accent-ink">IQ</span></div>
        <h1 className="font-display text-h1 font-semibold tracking-tight capitalize">{role} interface</h1>
        <p className="text-ink-soft mt-2">
          The {role} dashboard (Overview, Leads, Lead Detail with the SHAP panel) is the next build. The client
          interface is live — switch the role below to see it.
        </p>
        <div className="mt-5"><Button variant="secondary" onClick={() => navigate("/")}>Go to client app</Button></div>
      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState<Role>(() => (localStorage.getItem("eq-role") as Role) || "client");
  const changeRole = (r: Role) => { setRole(r); localStorage.setItem("eq-role", r); };
  const location = useLocation();

  // The public site is the same for everyone — it renders regardless of the dev role switch.
  if (location.pathname.startsWith("/landing")) {
    return <Routes><Route path="landing" element={<Landing />} /></Routes>;
  }

  return (
    <>
      {role === "client" ? (
        <Routes>
          <Route path="login" element={<Login />} />
          <Route element={<ClientLayout />}>
            <Route index element={<Home />} />
            <Route path="enquiries" element={<Enquiries />} />
            <Route path="enquiries/:id" element={<EnquiryDetail />} />
            <Route path="properties" element={<Properties />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      ) : (
        <ComingSoon role={role} />
      )}
      <RoleSwitcher role={role} setRole={changeRole} />
    </>
  );
}
