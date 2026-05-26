import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import {
  Loader2, CheckCircle2, AlertCircle, HeartHandshake, ShieldCheck,
  FileText, Users, Phone, Mail, ArrowRight,
} from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

const schema = z.object({
  organization: z.string().min(2, "Required"),
  full_name: z.string().min(2, "Required"),
  role: z.string().min(2, "Required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Required"),
  org_type: z.enum(["agency", "hospice", "assisted_living", "case_manager", "family", "other"]).default("agency"),
  clients_count: z.string().default("1-10"),
  city: z.string().min(2, "Required"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function Partners() {
  const navigate = useNavigate();
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      organization: "", full_name: "", role: "", email: "", phone: "",
      org_type: "agency", clients_count: "1-10", city: "", notes: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setState("submitting");
    setErr(null);
    try {
      await supabase.from("notifications_outbox").insert([
        {
          recipient: "sales@dashtrashtx.com",
          subject: `New partner inquiry: ${values.organization} (${values.org_type})`,
          body: [
            `Organization: ${values.organization}`,
            `Contact: ${values.full_name} — ${values.role}`,
            `Email: ${values.email}`,
            `Phone: ${values.phone}`,
            `Type: ${values.org_type}`,
            `Clients: ${values.clients_count}`,
            `City: ${values.city}`,
            `Notes: ${values.notes || "—"}`,
          ].join("\n"),
          template: "new_partner",
          payload: { org_type: values.org_type },
        },
      ]);
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
            <h1 className="font-display font-extrabold text-3xl md:text-4xl text-ink mb-3">Thanks — we'll be in touch.</h1>
            <p className="text-muted-foreground mb-2 leading-relaxed">
              Our partnerships team typically responds within one business day. For anything urgent, call us at <a href="tel:+16823625847" className="text-ink font-semibold">(682) 362-5847</a>.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Confirmation sent to <span className="font-mono-eyebrow">sales@dashtrashtx.com</span>
            </p>
            <Button onClick={() => navigate("/")} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl px-7 font-semibold">
              Back to home
            </Button>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Hero */}
      <section className="relative bg-background overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[600px] bg-dots opacity-30 pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black_15%,transparent_70%)]" />
        <div className="absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-primary/25 blur-[140px] pointer-events-none" />

        <div className="container relative pt-20 pb-12 md:pt-28 md:pb-16">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white hairline text-foreground/80 text-xs font-medium mb-7">
                <HeartHandshake className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono-eyebrow text-[0.65rem]">Partner program · Elderly care</span>
              </div>

              <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-[1.02] tracking-[-0.025em] text-ink">
                Caring for seniors?
                <br />
                <span className="text-primary">We've got the bins.</span>
              </h1>

              <p className="mt-6 text-lg md:text-xl text-foreground/70 max-w-xl leading-relaxed">
                We partner with home-care agencies, case managers, hospice teams, and families across DFW to make sure no senior ever drags a trash bin to the curb again. Many clients qualify for coverage through long-term care insurance.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="h-12 px-7 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-semibold group">
                  <a href="#partner-form">
                    Become a partner
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-7 rounded-2xl border-foreground/15 text-foreground bg-white hover:bg-secondary font-semibold">
                  <a href="tel:+16823625847">
                    <Phone className="mr-2 h-4 w-4 text-primary" />
                    (682) 362-5847
                  </a>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5 animate-fade-up delay-150">
              <div className="relative aspect-[4/5] max-w-[440px] mx-auto">
                <div className="absolute inset-0 rounded-[32px] overflow-hidden bg-white ring-soft border border-border shadow-[0_30px_60px_-20px_rgba(15,23,34,0.35)]">
                  <img
                    src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80"
                    alt="Caregiver helping senior at home — DashTrashTX elderly bin valet"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-background/95 backdrop-blur-xl hairline">
                    <div className="font-mono-eyebrow text-muted-foreground mb-1">Often covered</div>
                    <div className="font-display font-bold text-ink leading-tight">Long-term care insurance</div>
                    <div className="text-xs text-muted-foreground mt-1.5">We handle the billing paperwork.</div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-3 p-3.5 rounded-2xl bg-ink text-background shadow-[0_20px_40px_-15px_rgba(15,23,34,0.5)] rotate-[4deg]">
                  <div className="font-mono-eyebrow text-primary/80 mb-1">Partner referral</div>
                  <div className="font-display font-extrabold text-2xl leading-none">$50</div>
                  <div className="text-xs text-background/60 mt-1">per signed client</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why partner */}
      <section className="bg-cream py-20 md:py-28">
        <div className="container">
          <div className="max-w-2xl mb-12 md:mb-16">
            <div className="font-mono-eyebrow text-muted-foreground mb-4">Why partner</div>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight text-balance text-ink">
              One less daily-living task to coordinate.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              Trash day is one of the most physically risky moments in a senior's week. We take it off your plate — and your client's.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-5">
            <Benefit
              icon={ShieldCheck}
              title="Insurance billing — handled"
              body="We submit documentation to long-term care insurance carriers and chase reimbursement on the client's behalf."
            />
            <Benefit
              icon={Users}
              title="Same valet every week"
              body="Familiar face, consistent schedule, family text updates after each visit. Less confusion for clients with cognitive decline."
            />
            <Benefit
              icon={FileText}
              title="Care-plan documentation"
              body="Timestamped photo proof goes straight to the family or case manager — useful for care notes and audits."
            />
          </div>
        </div>
      </section>

      {/* Who we partner with */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-5">
              <div className="font-mono-eyebrow text-muted-foreground mb-4">Who we work with</div>
              <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight text-ink leading-[1.05]">
                Partners across the care continuum.
              </h2>
              <p className="mt-5 text-lg text-muted-foreground max-w-md leading-relaxed">
                Whether you're managing 5 clients or 500, we make it easy to add curbside bin service to the care plan.
              </p>
              <div className="mt-8 p-5 rounded-2xl bg-cream border border-border">
                <div className="font-mono-eyebrow text-muted-foreground mb-2">Direct line</div>
                <a href="tel:+16823625847" className="font-display font-extrabold text-2xl text-ink hover:text-primary transition-colors block">
                  (682) 362-5847
                </a>
                <a href="mailto:sales@dashtrashtx.com" className="text-sm text-foreground/70 hover:text-ink transition-colors flex items-center gap-1.5 mt-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  sales@dashtrashtx.com
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-3">
              <PartnerType title="Home-care agencies" body="Add bin valet as a value-add line item in your weekly care plan." />
              <PartnerType title="Hospice & palliative" body="One less burden on families during the hardest weeks." />
              <PartnerType title="Assisted living" body="Independent-living wings — keep residents in their own routine longer." />
              <PartnerType title="Case managers" body="Refer clients in 90 seconds. We handle onboarding + insurance." />
              <PartnerType title="Senior centers / SHIPs" body="Educational partner — we'll join Q&A sessions or community events." />
              <PartnerType title="Adult children & POAs" body="Set it and forget it from across the country. Photo proof every week." />
            </div>
          </div>
        </div>
      </section>

      {/* Partner form */}
      <section id="partner-form" className="relative bg-cream py-20 md:py-28">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10 animate-fade-up">
              <div className="font-mono-eyebrow text-muted-foreground mb-4">Get started</div>
              <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight text-balance text-ink">
                Tell us about your organization.
              </h2>
              <p className="mt-4 text-muted-foreground max-w-md mx-auto">
                We'll follow up within one business day with a partner kit and a personal contact.
              </p>
            </div>

            <div className="p-7 md:p-10 rounded-3xl bg-white border border-border ring-soft">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="organization" render={({ field }) => (
                      <FormItem><FormLabel>Organization</FormLabel><FormControl><Input placeholder="Acme Home Care" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="org_type" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="agency">Home-care agency</SelectItem>
                            <SelectItem value="hospice">Hospice / palliative</SelectItem>
                            <SelectItem value="assisted_living">Assisted living</SelectItem>
                            <SelectItem value="case_manager">Case manager</SelectItem>
                            <SelectItem value="family">Family / POA</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="full_name" render={({ field }) => (
                      <FormItem><FormLabel>Your name</FormLabel><FormControl><Input placeholder="Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="role" render={({ field }) => (
                      <FormItem><FormLabel>Your role</FormLabel><FormControl><Input placeholder="Director of Care" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="you@org.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="(682) 362-5847" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Plano" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="clients_count" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Approx. clients we could serve</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="1-10">1–10</SelectItem>
                            <SelectItem value="11-50">11–50</SelectItem>
                            <SelectItem value="51-200">51–200</SelectItem>
                            <SelectItem value="200+">200+</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anything we should know? <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                      <FormControl><Textarea rows={4} placeholder="Coverage area, timeline, insurance carriers you work with…" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {state === "error" && err ? (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/40 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{err}</span>
                    </div>
                  ) : null}

                  <Button type="submit" size="lg" disabled={state === "submitting"} className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-semibold">
                    {state === "submitting" ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</> : "Become a partner"}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    By submitting you agree to be contacted by DashTrashTX. We never share your information.
                  </p>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Benefit({ icon: Icon, title, body }: { icon: typeof HeartHandshake; title: string; body: string }) {
  return (
    <div className="p-7 rounded-3xl bg-white border border-border hover:border-foreground/15 transition-all">
      <div className="h-12 w-12 rounded-2xl bg-primary/15 flex items-center justify-center mb-5">
        <Icon className="h-6 w-6 text-ink" strokeWidth={1.75} />
      </div>
      <h3 className="font-display font-bold text-xl text-ink mb-2 leading-tight">{title}</h3>
      <p className="text-[0.95rem] text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function PartnerType({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-5 rounded-2xl bg-cream border border-border hover:bg-white transition-colors">
      <div className="font-display font-bold text-ink mb-1.5 leading-tight">{title}</div>
      <div className="text-sm text-muted-foreground leading-relaxed">{body}</div>
    </div>
  );
}
