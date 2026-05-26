import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "What exactly does DashTrashTX do?", a: "We are a curbside trash bin valet. We take your trash and recycling bins from where you store them out to the curb the night before pickup, then bring them back the day after collection. You never miss a pickup, never lift a bin." },
  { q: "How much does it cost?", a: "Residential is $63/month for weekly service on one home. Enterprise (HOAs, multi-family, property management) is quoted by volume. Elderly service is often fully or partially covered by long-term care or supplemental insurance — we help you submit it." },
  { q: "What if my pickup day is Tuesday?", a: "If your city collects on Tuesday, we roll your bins out Monday evening and return them Tuesday afternoon, after the truck. Same logic for any day of the week." },
  { q: "Do I need to be home?", a: "No. We work outside your home — you don't need to be there, and most customers never see us. You'll get a photo confirmation on every visit." },
  { q: "Is elderly service really covered by insurance?", a: "Many supplemental, Medicare Advantage, and long-term care plans cover daily-living assistance like bin valet under instrumental ADL coverage. We'll help you check eligibility and may bill insurance directly." },
  { q: "What if I'm outside your service area?", a: "Join the waitlist. When 25 or more households in your area sign up, we open a clustered route and notify everyone on the list immediately." },
  { q: "How do I cancel?", a: "Anytime, from your customer dashboard. We don't do contracts or cancellation fees. Service ends at the end of your billing cycle." },
  { q: "Are your drivers vetted?", a: "Every driver is background-checked, insured, and identified in our app. You'll see who's coming, and you'll get a timestamped photo of every completed visit." },
];

export function FAQ() {
  return (
    <section id="faq" className="relative py-24 md:py-32 bg-cream">
      <div className="container">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-4">
            <div className="font-mono-eyebrow text-muted-foreground mb-4">FAQ</div>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight text-balance text-ink">
              Common questions, <span className="text-primary">plainly answered</span>.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Don't see yours? Email{" "}
              <a className="text-ink font-semibold underline underline-offset-2 hover:text-primary" href="mailto:support@dashtrashtx.com">
                support@dashtrashtx.com
              </a>{" "}
              and we'll get back the same day.
            </p>
          </div>
          <div className="lg:col-span-8">
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`q${i}`}
                  className="rounded-2xl border border-border bg-white px-6 data-[state=open]:border-foreground/15"
                >
                  <AccordionTrigger className="text-left font-display font-bold text-lg md:text-xl text-ink hover:no-underline py-5">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-[0.95rem] pb-5">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
