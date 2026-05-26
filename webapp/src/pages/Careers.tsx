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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  city: z.string().min(2),
  state: z.string().default("TX"),
  position: z.enum(["driver", "dispatcher", "operations"]).default("driver"),
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

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "", email: "", phone: "", city: "", state: "TX",
      position: "driver", vehicle_make_model: "", has_truck_or_suv: "yes",
      years_driving: 1, availability: "", has_license: "yes", has_insurance: "yes", why_join: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setState("submitting");
    setErr(null);
    try {
      const { error } = await supabase.from("job_applications").insert({
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        city: values.city,
        state: values.state.toUpperCase(),
        position: values.position,
        vehicle_make_model: values.vehicle_make_model || null,
        has_truck_or_suv: values.has_truck_or_suv === "yes",
        years_driving: values.years_driving,
        availability: values.availability,
        has_license: values.has_license === "yes",
        has_insurance: values.has_insurance === "yes",
        why_join: values.why_join || null,
      });
      if (error) throw error;

      await supabase.from("notifications_outbox").insert({
        recipient: "support@dashtrashtx.com",
        subject: `New ${values.position} application: ${values.full_name}`,
        body: `${values.full_name} (${values.email}, ${values.phone}) applied for ${values.position}. Location: ${values.city}, ${values.state}. Vehicle: ${values.vehicle_make_model || "n/a"}. Truck/SUV: ${values.has_truck_or_suv}. Years driving: ${values.years_driving}. License: ${values.has_license}. Insurance: ${values.has_insurance}. Availability: ${values.availability}. Why: ${values.why_join || "—"}.`,
        template: "new_application",
        payload: { position: values.position },
      });

      setState("done");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Submit failed");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <PageShell>
        <section className="container py-24 md:py-32">
          <div className="max-w-xl mx-auto text-center p-10 rounded-2xl bg-card border border-primary/30 ring-glow">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="font-display text-4xl mb-3">Application received.</h1>
            <p className="text-muted-foreground mb-8">We review every application within 48 hours. If you're a fit, we'll reach out to schedule a quick call and a ride-along.</p>
            <Button onClick={() => navigate("/")} className="bg-primary text-primary-foreground">Back to home</Button>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="relative">
        <div className="absolute inset-0 grid-lines opacity-30 pointer-events-none" />
        <div className="absolute -top-10 -left-32 h-[420px] w-[420px] rounded-full bg-primary/15 blur-[110px] pointer-events-none" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <div className="text-xs font-medium tracking-[0.2em] uppercase text-primary mb-3">Careers</div>
              <h1 className="font-display text-4xl md:text-6xl tracking-tight text-balance">Drive with DashTrashTX.</h1>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Earn weekly. Choose your routes. Be home before the kids wake up. We're hiring drivers and dispatchers across Texas.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mb-10">
              <Perk icon={DollarSign} title="$1/home + $0.15/mi" subtitle="Paid weekly via direct deposit" />
              <Perk icon={MapPinned} title="Smart routes" subtitle="Built and optimized for you" />
              <Perk icon={Truck} title="Use your own vehicle" subtitle="Truck, SUV, or van" />
            </div>

            <div className="p-6 md:p-8 rounded-2xl bg-card border border-border/60">
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
                      <FormItem className="sm:col-span-2"><FormLabel>City</FormLabel><FormControl><Input placeholder="Austin" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="state" render={({ field }) => (
                      <FormItem><FormLabel>State</FormLabel><FormControl><Input maxLength={2} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="position" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="driver">Driver</SelectItem>
                          <SelectItem value="dispatcher">Dispatcher</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

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
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/40 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{err}</span>
                    </div>
                  ) : null}

                  <Button type="submit" size="lg" disabled={state === "submitting"} className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90">
                    {state === "submitting" ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : "Submit application"}
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
    <div className="p-4 rounded-xl bg-card border border-border/60 flex items-start gap-3">
      <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={1.5} />
      <div>
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>
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
