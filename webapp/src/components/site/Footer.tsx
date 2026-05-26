import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background/60">
      <div className="container py-14 md:py-20">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/brand/logo.jpg" alt="DashTrashTX" className="h-10 w-10 rounded-md object-cover ring-1 ring-primary/30" />
              <span className="font-display text-xl tracking-tight">DashTrash<span className="text-primary">TX</span></span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
              The white-glove trash bin valet for Texas homes, properties, and seniors. Bins out the night before, back the day after — every week.
            </p>
            <p className="mt-6 text-xs text-muted-foreground">
              © {new Date().getFullYear()} DashTrashTX. All rights reserved.
            </p>
          </div>

          <FooterCol title="Service" links={[
            { to: "/signup?type=residential", label: "Residential" },
            { to: "/signup?type=enterprise", label: "Enterprise" },
            { to: "/signup?type=elderly", label: "Elderly + insurance" },
            { to: "/waitlist", label: "Waitlist" },
          ]} />
          <FooterCol title="Company" links={[
            { to: "/careers", label: "Careers" },
            { to: "/#how", label: "How it works" },
            { to: "/#pricing", label: "Pricing" },
            { to: "/#faq", label: "FAQ" },
          ]} />
          <FooterCol title="Account" links={[
            { to: "/login", label: "Customer sign in" },
            { to: "/login?role=driver", label: "Driver sign in" },
            { to: "/login?role=admin", label: "Dispatch" },
            { to: "mailto:support@dashtrashtx.com", label: "support@dashtrashtx.com", external: true },
          ]} />
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: Array<{ to: string; label: string; external?: boolean }> }) {
  return (
    <div className="md:col-span-2">
      <div className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-4">{title}</div>
      <ul className="space-y-2.5 text-sm">
        {links.map((l) =>
          l.external ? (
            <li key={l.label}><a href={l.to} className="text-foreground/80 hover:text-primary transition-colors">{l.label}</a></li>
          ) : (
            <li key={l.label}><Link to={l.to} className="text-foreground/80 hover:text-primary transition-colors">{l.label}</Link></li>
          )
        )}
      </ul>
    </div>
  );
}
