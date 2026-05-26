import { Star } from "lucide-react";

const quotes = [
  { name: "Maria G.", role: "Plano homeowner", body: "I forgot it was even Tuesday. They just… handled it. Photo on my phone proving it. Best $63 I spend." },
  { name: "Mark D.", role: "Frisco HOA Board Member", body: "We rolled this out across 64 doors. Complaints dropped. Curb appeal went up. Easy decision." },
  { name: "Linda B.", role: "Arlington — daughter & caretaker", body: "Mom's on long-term care insurance — DashTrash handled the billing. She hasn't lifted a bin since." },
];

export function Testimonials() {
  return (
    <section className="relative py-24 md:py-32 border-t border-border/60">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-medium tracking-[0.2em] uppercase text-primary mb-4">Texas talks</div>
          <h2 className="font-display text-4xl md:text-6xl tracking-tight text-balance">Why neighbors switch.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {quotes.map((q) => (
            <figure key={q.name} className="p-7 rounded-2xl bg-card border border-border/60">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="font-display text-xl md:text-2xl leading-snug text-balance">"{q.body}"</blockquote>
              <figcaption className="mt-5 text-sm">
                <div className="font-medium">{q.name}</div>
                <div className="text-muted-foreground">{q.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
