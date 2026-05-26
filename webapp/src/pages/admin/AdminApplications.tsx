import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminApplications() {
  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight text-ink">Driver applications</h1>
        <p className="mt-2 text-muted-foreground">Recent applicants — review and contact those who qualify.</p>
      </div>

      {isLoading ? (
        <div className="py-10 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
      ) : apps.length === 0 ? (
        <div className="p-10 rounded-3xl bg-cream border border-border text-center">
          <h3 className="font-display font-bold text-xl text-ink mb-1">No applications yet</h3>
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream border-b border-border">
              <tr className="text-left">
                <Th>Name</Th>
                <Th>Position</Th>
                <Th>Location</Th>
                <Th>Vehicle</Th>
                <Th>Insured</Th>
                <Th>Contact</Th>
                <Th>Applied</Th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                  <Td><span className="font-medium text-ink">{a.full_name}</span></Td>
                  <Td><span className="capitalize text-foreground/80">{a.position}</span></Td>
                  <Td>{a.city}, {a.state}</Td>
                  <Td>{a.vehicle_make_model || "—"}{a.has_truck_or_suv ? "" : " (no truck)"}</Td>
                  <Td>{a.has_insurance ? <span className="text-primary font-medium">Yes</span> : <span className="text-destructive font-medium">No</span>}</Td>
                  <Td>
                    <a href={`mailto:${a.email}`} className="text-xs text-ink hover:underline">{a.email}</a>
                    <div className="text-xs text-muted-foreground">{a.phone}</div>
                  </Td>
                  <Td className="text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th className="px-4 py-3 text-xs font-mono-eyebrow text-muted-foreground">{children}</th>;
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <td className={`px-4 py-3 ${className}`}>{children}</td>;
