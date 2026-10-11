import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useEnquiries } from "@/api/hooks";
import { Card } from "@/components/Card";
import { StatusPill } from "@/components/StatusPill";
import { DataState } from "@/components/DataState";
import { useClientUI } from "../ClientUI";

export function Enquiries() {
  const navigate = useNavigate();
  const { data, isLoading } = useEnquiries();
  const { openCall } = useClientUI();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-h1 font-semibold tracking-tight">My enquiries</h1>
      {isLoading && <DataState kind="loading" />}
      {data && data.length === 0 && (
        <DataState kind="empty" message="You haven't made an enquiry yet." action="Call the agent" onAction={() => openCall()} />
      )}
      <div className="space-y-3">
        {data?.map((e) => (
          <Card key={e.id} className="p-4" onClick={() => navigate(`/enquiries/${e.id}`)}>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-h3">{e.project}</h3>
              <span className="ml-auto"><StatusPill status={e.status} /></span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-body text-ink-soft">{e.date}</span>
              <ChevronRight size={18} strokeWidth={1.5} className="text-ink-muted" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
