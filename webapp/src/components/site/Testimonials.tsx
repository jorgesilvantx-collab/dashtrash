import { Star, Quote } from "lucide-react";

const quotes = [
  {
    name: "Maria G.",
    role: "Plano homeowner",
    body: "I forgot it was even Tuesday. They just… handled it. Photo on my phone proving it. Best $63 I spend.",
  },
  {
    name: "Mark D.",
    role: "Frisco HOA Board Member",
    body: "We rolled this out across 64 doors. Complaints dropped. Curb appeal went up. Easy decision.",
  },
  {
    name: "Linda B.",
    role: "Arlington — daughter & caretaker",
    body: "Mom's on long-term care insurance — DashTrashTX handled the billing. She hasn't lifted a bin since.",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-24 md:py-32 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="font-mono-eyebrow text-muted-foreground mb-4">Texas talks</div>
          <h2 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight text-balance text-ink">
            Why neighbors <span className="text-primary">switch</span>.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {quotes.map((q, i) => (
            <figure
              key={q.name}
              className="relative p-8 rounded-3xl bg-white border border-border hover:border-foreground/15 transition-all animate-fade-up"
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <Quote className="absolute top-7 right-7 h-7 w-7 text-primary/40" strokeWidth={1.5} />
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="font-display font-bold text-xl md:text-[1.35rem] leading-snug text-balance text-ink">
                "{q.body}"
              </blockquote>
              <figcaption className="mt-6 text-sm flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center font-display font-bold text-ink text-sm">
                  {q.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-ink">{q.name}</div>
                  <div className="text-muted-foreground text-[0.8rem]">{q.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
