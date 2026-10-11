import { createContext, useContext, useState, type ReactNode } from "react";
import type { Property } from "@/api/types";
import { CallWidget } from "./CallWidget";

interface ClientUI {
  saved: Set<string>;
  toggleSave: (id: string) => void;
  openCall: (p?: Property | null) => void;
  toast: (message: string) => void;
}

const Ctx = createContext<ClientUI | null>(null);
export const useClientUI = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useClientUI must be used within ClientUIProvider");
  return v;
};

export function ClientUIProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [widget, setWidget] = useState(false);
  const [preset, setPreset] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const toggleSave = (id: string) =>
    setSaved((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const openCall = (p?: Property | null) => {
    setPreset(p ? p.project : null);
    setWidget(true);
  };

  const toast = (message: string) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), 3200);
  };

  return (
    <Ctx.Provider value={{ saved, toggleSave, openCall, toast }}>
      {children}
      <CallWidget open={widget} onOpen={() => setWidget(true)} onClose={() => setWidget(false)} presetProject={preset} />
      {toastMsg && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-toast bg-surface border border-border shadow-sm rounded-card px-4 py-3 text-body flex items-center gap-2.5 eq-risein">
          <span className="w-2 h-2 rounded-pill bg-positive" />
          {toastMsg}
        </div>
      )}
    </Ctx.Provider>
  );
}
