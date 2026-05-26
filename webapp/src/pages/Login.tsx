import { useSearchParams, Link } from "react-router-dom";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

const labels: Record<string, { title: string; sub: string }> = {
  customer: { title: "Customer sign-in", sub: "Manage your subscription, homes, and view photo proof." },
  driver: { title: "Driver sign-in", sub: "View routes, mark stops complete, upload photos." },
  admin: { title: "Dispatch sign-in", sub: "Manage subscriptions, drivers, routes, and the waitlist." },
};

export default function Login() {
  const [params] = useSearchParams();
  const role = params.get("role") ?? "customer";
  const label = labels[role] ?? labels.customer;

  return (
    <PageShell>
      <section className="container py-24 md:py-32">
        <div className="max-w-md mx-auto text-center p-10 rounded-2xl bg-card border border-border/60">
          <Construction className="h-12 w-12 text-primary mx-auto mb-4" strokeWidth={1.5} />
          <h1 className="font-display text-3xl mb-2">{label.title}</h1>
          <p className="text-muted-foreground mb-6">{label.sub}</p>
          <div className="text-sm text-muted-foreground p-4 rounded-lg bg-secondary/40 border border-border/60 mb-6">
            Sign-in opens in Phase 2 — customer subscriptions, driver portal, and dispatch panel are next. For now, sign up below to reserve your spot.
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild className="bg-primary text-primary-foreground"><Link to="/signup">Start service</Link></Button>
            <Button asChild variant="outline"><Link to="/careers">Apply to drive</Link></Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
