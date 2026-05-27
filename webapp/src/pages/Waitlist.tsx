import { PageShell } from "@/components/site/PageShell";
import { CustomerSignupForm } from "@/components/forms/CustomerSignupForm";
import { useAuth } from "@/lib/auth";

export default function Waitlist() {
  const { user } = useAuth();

  return (
    <PageShell>
      <section className="relative bg-[#0F1722] overflow-hidden">
        <div className="absolute -top-32 right-[-10%] h-[500px] w-[500px] rounded-full bg-primary/15 blur-[160px] pointer-events-none" />
        <div className="absolute bottom-0 left-[-8%] h-[400px] w-[400px] rounded-full bg-[#FF7F65]/10 blur-[140px] pointer-events-none" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12 animate-fade-up">
              <div className="font-mono-eyebrow text-primary mb-4">Service-area check</div>
              <h1 className="font-display font-black text-4xl md:text-6xl tracking-tight text-balance text-white leading-[1.05]">
                Are we in your <span className="text-primary">neighborhood?</span>
              </h1>
              <p className="mt-5 text-lg text-white/60 leading-relaxed">
                Drop your address — if you're in range, we start this week. If not, you'll join the waitlist and we open your route once 25+ neighbors sign up nearby.
              </p>
            </div>
            <div className="p-7 md:p-10 rounded-3xl bg-white border border-border shadow-[0_30px_60px_-20px_rgba(15,23,34,0.5)]">
              <CustomerSignupForm
                customerType="residential"
                defaultEmail={user?.email ?? undefined}
                userId={user?.id ?? undefined}
              />
            </div>
            <p className="text-center text-white/40 text-sm mt-6">
              {user ? "Signed in — your check will be saved to your account." : "No account needed — we'll email you a magic link after we confirm your area."}
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
