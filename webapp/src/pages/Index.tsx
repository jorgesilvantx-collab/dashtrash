import { PageShell } from "@/components/site/PageShell";
import { Hero } from "@/components/site/Hero";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Services } from "@/components/site/Services";
import { Pricing } from "@/components/site/Pricing";
import { Coverage } from "@/components/site/Coverage";
import { Testimonials } from "@/components/site/Testimonials";
import { FAQ } from "@/components/site/FAQ";
import { CTA } from "@/components/site/CTA";
import { RollingBinsStrip } from "@/components/site/RollingBins";

export default function Index() {
  return (
    <PageShell>
      <Hero />
      <HowItWorks />
      <section aria-hidden className="bg-cream py-6 border-t border-border">
        <RollingBinsStrip />
      </section>
      <Services />
      <Pricing />
      <Coverage />
      <Testimonials />
      <FAQ />
      <CTA />
    </PageShell>
  );
}
