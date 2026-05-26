import { useQuery } from "@tanstack/react-query";
import { Users, Truck, Route as RouteIcon, MapPinned, ClipboardList, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [customers, drivers, leads, waitlist, applications, todayRoutes] = await Promise.all([
        supabase.from("customers").select("profile_id", { count: "exact", head: true }),
        supabase.from("drivers").select("profile_id", { count: "exact", head: true }).eq("active", true),
        supabase.from("customer_leads").select("id", { count: "exact", head: true }),
        supabase.from("waitlist").select("id", { count: "exact", head: true }).eq("status", "waiting"),
        supabase.from("job_applications").select("id", { count: "exact", head: true }),
        supabase.from("routes").select("id", { count: "exact", head: true }).eq("route_date", new Date().toISOString().slice(0, 10)),
      ]);
      return {
        customers: customers.count ?? 0,
        drivers: drivers.count ?? 0,
        leads: leads.count ?? 0,
        waitlist: waitlist.count ?? 0,
        applications: applications.count ?? 0,
        todayRoutes: todayRoutes.count ?? 0,
      };
    },
  });

  if (isLoading || !data) {
    return <div className="py-10 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono-eyebrow text-muted-foreground mb-2">Dispatch</div>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight text-ink">Operations overview</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Stat icon={Users} label="Active customers" value={data.customers} />
        <Stat icon={Truck} label="Active drivers" value={data.drivers} />
        <Stat icon={RouteIcon} label="Routes today" value={data.todayRoutes} />
        <Stat icon={ClipboardList} label="Customer leads" value={data.leads} />
        <Stat icon={MapPinned} label="Waitlist queue" value={data.waitlist} />
        <Stat icon={Users} label="Driver applications" value={data.applications} />
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="p-6 rounded-3xl bg-white border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="font-mono-eyebrow text-muted-foreground">{label}</div>
        <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center">
          <Icon className="h-4 w-4 text-ink" strokeWidth={1.75} />
        </div>
      </div>
      <div className="font-display font-extrabold text-3xl text-ink leading-none">{value}</div>
    </div>
  );
}
