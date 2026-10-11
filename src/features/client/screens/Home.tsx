import { useNavigate } from "react-router-dom";
import { Calendar, Clock, ChevronRight, Phone } from "lucide-react";
import { CLIENT } from "@/api/mock";
import { useEnquiries, useProperties } from "@/api/hooks";
import { Card, SectionTitle } from "@/components/Card";
import { Button } from "@/components/Button";
import { StatusPill } from "@/components/StatusPill";
import { PropertyCard } from "@/components/PropertyCard";
import { DataState } from "@/components/DataState";
import { useClientUI } from "../ClientUI";

export function Home() {
  const navigate = useNavigate();
  const { openCall, toast } = useClientUI();
  const enquiries = useEnquiries();
  const properties = useProperties();

  const latest = enquiries.data?.[0];
  const recommended = properties.data?.slice(0, 3) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-h1 font-semibold tracking-tight">Hi {CLIENT.name.split(" ")[0]} 👋</h1>
        {latest && (
          <p className="text-ink-soft mt-1">
            You enquired about <span className="text-ink font-medium">{latest.project}</span> on {latest.date.split(",")[0]}.
          </p>
        )}
      </div>

      <div>
        <SectionTitle
          action={
            <Button variant="ghost" className="h-auto px-0" onClick={() => navigate("/enquiries")}>
              All enquiries <ChevronRight size={16} strokeWidth={1.5} />
            </Button>
          }
        >
          Latest enquiry
        </SectionTitle>
        {enquiries.isLoading && <DataState kind="loading" />}
        {latest && (
          <Card className="p-4" onClick={() => navigate(`/enquiries/${latest.id}`)}>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-h3">{latest.project}</h3>
              <span className="ml-auto"><StatusPill status={latest.status} /></span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-body text-ink-soft mt-3">
              <span className="inline-flex items-center gap-1.5"><Calendar size={16} strokeWidth={1.5} />{latest.date}</span>
              <span className="inline-flex items-center gap-1.5"><Clock size={16} strokeWidth={1.5} />{latest.duration}</span>
            </div>
            <div className="mt-4"><Button variant="secondary" className="h-9">View summary</Button></div>
          </Card>
        )}
      </div>

      <div>
        <SectionTitle
          action={
            <Button variant="ghost" className="h-auto px-0" onClick={() => navigate("/properties")}>
              See all <ChevronRight size={16} strokeWidth={1.5} />
            </Button>
          }
        >
          Recommended for you
        </SectionTitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommended.map((p) => (
            <PropertyCard key={p.id} property={p} onAsk={openCall} />
          ))}
        </div>
      </div>

      <Card className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-h3">Want a human to call you back?</h3>
          <p className="text-body text-ink-soft mt-0.5">Our team will reach out on your registered number.</p>
        </div>
        <Button onClick={() => toast("Callback requested — our team will call you soon.")}>
          <Phone size={16} strokeWidth={1.5} /> Request a callback
        </Button>
      </Card>
    </div>
  );
}
