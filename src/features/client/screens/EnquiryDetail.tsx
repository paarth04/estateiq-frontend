import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { useEnquiry, useProperties } from "@/api/hooks";
import { Card, SectionTitle } from "@/components/Card";
import { StatusPill } from "@/components/StatusPill";
import { EnquiryDetailsCard } from "@/components/EnquiryDetailsCard";
import { Transcript } from "@/components/Transcript";
import { PropertyCard } from "@/components/PropertyCard";
import { DataState } from "@/components/DataState";
import { useClientUI } from "../ClientUI";

export function EnquiryDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { openCall } = useClientUI();
  const { data: e, isLoading } = useEnquiry(id);
  const { data: allProperties } = useProperties();

  if (isLoading) return <DataState kind="loading" />;
  if (!e) return <DataState kind="empty" message="We couldn't find that enquiry." action="Back to enquiries" onAction={() => navigate("/enquiries")} />;

  const discussed = (allProperties ?? []).filter((p) => e.propertyIds.includes(p.id));

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/enquiries")} className="inline-flex items-center gap-1 text-body text-ink-soft hover:text-ink">
        <ArrowLeft size={18} strokeWidth={1.5} /> My enquiries
      </button>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-h1 font-semibold tracking-tight">{e.project}</h1>
        <StatusPill status={e.status} />
      </div>

      <Card className="p-4 bg-accent-soft/40 border-accent-soft">
        <p className="text-body">{e.summary}</p>
        <div className="flex flex-wrap items-center gap-4 text-body text-ink-soft mt-3">
          <span className="inline-flex items-center gap-1.5"><Calendar size={16} strokeWidth={1.5} />{e.date}</span>
          <span className="inline-flex items-center gap-1.5"><Clock size={16} strokeWidth={1.5} />{e.duration}</span>
        </div>
      </Card>

      <EnquiryDetailsCard details={e.details} friendly />

      <div>
        <SectionTitle>The conversation</SectionTitle>
        <Transcript turns={e.transcript} />
      </div>

      {discussed.length > 0 && (
        <div>
          <SectionTitle>Homes we discussed</SectionTitle>
          <div className="grid sm:grid-cols-2 gap-4">
            {discussed.map((p) => <PropertyCard key={p.id} property={p} onAsk={openCall} />)}
          </div>
        </div>
      )}
    </div>
  );
}
