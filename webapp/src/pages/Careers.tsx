import { useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle, DollarSign, MapPinned, Truck } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ROUTES = [
  "Dallas", "Fort Worth", "Plano", "Frisco", "Arlington", "Irving",
  "McKinney", "Garland", "Mesquite", "Carrollton", "Richardson",
  "Lewisville", "Allen", "Denton", "Mansfield", "Grand Prairie",
];

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  city: z.string().min(2),
  state: z.string().default("TX"),
  vehicle_make_model: z.string().optional(),
  has_truck_or_suv: z.enum(["yes", "no"]).default("yes"),
  years_driving: z.coerce.number().min(0).max(80).default(1),
  availability: z.string().min(2),
  has_license: z.enum(["yes", "no"]).default("yes"),
  has_insurance: z.enum(["yes", "no"]).default("yes"),
  why_join: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function Careers() {
  const navigate = useNavigate();
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);
  const [preferredRoutes, setPreferredRoutes] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "", email: "", phone: "", city: "", state: "TX",
      vehicle_make_model: "", has_truck_or_suv: "yes",
      years_driving: 1, availability: "", has_license: "yes", has_insurance: "yes", why_join: "",
    },
  });

  function toggleRoute(r: string) {
    setPreferredRoutes((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);
  }

  async function onSubmit(values: FormValues) {
    setState("submitting");
    setErr(null);
    try {
      const res = await fetch("/api/signup-driver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: values.full_name,
          email: values.email,
          phone: values.phone,
          city: values.city,
          state: values.state.toUpperCase(),
          vehicle_make_model: values.vehicle_make_model,
          has_truck_or_suv: values.has_truck_or_suv === "yes",
          years_driving: values.years_driving,
          availability: values.availability,
          has_license: values.has_license === "yes",
          has_insurance: values.has_insurance === "yes",
          why_join: values.why_join,
          preferred_routes: preferredRoutes,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error?.message || `Submit failed (${res.status})`);
      setState("done");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Submit failed");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <PageShell>
        <section className="container py-24 md:py-32 bg-background">
          <div className="max-w-xl mx-auto text-center p-10 rounded-3xl bg-white border border-border ring-soft animate-fade-up">
            <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-7 w-7 text-ink" strokeWidth={2} />
            </div>
            <h1 className="font-display font-extrabold text-3xl md:text-4xl text-ink mb-3">Application received.</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              We review every application within 48 hours. If you're a fit, we'll reach out to schedule a quick call and a ride-along.
            </p>
            <Button
              onClick={() => navigate("/")}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl px-7 font-semibold"
            >
              Back to home
            </Button>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="relative bg-background overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[500px] bg-dots opacity-30 pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 animate-fade-up">
              <div className="font-mono-eyebrow text-muted-foreground mb-4">Drive with us</div>
              <h1 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight text-balance text-ink">
                Drive for <span className="text-primary">DashTrash</span>.
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Earn weekly. Pick your routes. Be home before the kids wake up. We're hiring drivers across DFW.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mb-10">
              <Perk icon={DollarSign} title="$1/home + $0.15/mi" subtitle="Paid weekly via direct deposit" />
              <Perk icon={MapPinned} title="Choose your routes" subtitle="Built and optimized for you" />
              <Perk icon={Truck} title="Use your own vehicle" subtitle="Truck, SUV, or van" />
            </div>

            <div className="p-7 md:p-10 rounded-3xl bg-white border border-border ring-soft">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="full_name" render={({ field }) => (
                      <FormItem><FormLabel>Full name</FormLabel><FormControl><Input placeholder="Your name" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="(512) 555-0199" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="you@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem className="sm:col-span-2"><FormLabel>City</FormLabel><FormControl><Input placeholder="Plano" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="state" render={({ field }) => (
                      <FormItem><FormLabel>State</FormLabel><FormControl><Input maxLength={2} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  <div className="p-5 rounded-2xl bg-cream border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-7 w-7 rounded-lg bg-primary/15 flex items-center justify-center">
                        <MapPinned className="h-3.5 w-3.5 text-ink" strokeWidth={2} />
                      </div>
                      <div>
                        <div className="font-semibold text-ink leading-tight">Preferred routes</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Pick the cities you can cover — we'll match routes to you</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ROUTES.map((r) => {
                        const selected = preferredRoutes.includes(r);
                        return (
                          <button
                            type="button"
                            key={r}
                            onClick={() => toggleRoute(r)}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-sm font-medium border transition",
                              selected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-white text-foreground/80 border-border hover:bg-secondary"
                            )}
                          >
                            {r}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="vehicle_make_model" render={({ field }) => (
                      <FormItem><FormLabel>Vehicle (make/model)</FormLabel><FormControl><Input placeholder="2018 Ford F-150" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="years_driving" render={({ field }) => (
                      <FormItem><FormLabel>Years driving</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <YesNoField name="has_truck_or_suv" label="Truck / SUV?" form={form} />
                    <YesNoField name="has_license" label="Valid driver's license?" form={form} />
                    <YesNoField name="has_insurance" label="Vehicle insured?" form={form} />
                  </div>

                  <FormField control={form.control} name="availability" render={({ field }) => (
                    <FormItem><FormLabel>Availability</FormLabel><FormControl><Input placeholder="e.g. Mon–Fri evenings, Sat AM" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  <FormField control={form.control} name="why_join" render={({ field }) => (
                    <FormItem><FormLabel>Anything you want us to know? <span className="text-muted-foreground text-xs">(optional)</span></FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  {state === "error" && err ? (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/40 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{err}</span>
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={state === "submitting"}
                    className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-semibold"
                  >
                    {state === "submitting" ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</> : "Submit application"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Perk({ icon: Icon, title, subtitle }: { icon: typeof DollarSign; title: string; subtitle: string }) {
  return (
    <div className="p-5 rounded-2xl bg-white border border-border flex items-start gap-3">
      <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4.5 w-4.5 text-ink" strokeWidth={1.75} />
      </div>
      <div>
        <div className="font-display font-bold text-ink leading-tight">{title}</div>
        <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
      </div>
    </div>
  );
}

function YesNoField({ name, label, form }: { name: "has_truck_or_suv" | "has_license" | "has_insurance"; label: string; form: UseFormReturn<FormValues> }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-3">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id={`${name}-yes`} />
                <Label htmlFor={`${name}-yes`}>Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id={`${name}-no`} />
                <Label htmlFor={`${name}-no`}>No</Label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
