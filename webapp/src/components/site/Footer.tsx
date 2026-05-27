import { Link } from "react-router-dom";
import { Phone, Mail } from "lucide-react";
import { LogoTile } from "@/components/site/Logo";

export function Footer() {
  return (
    <footer className="bg-background hairline-bottom border-t border-border">
      <div className="container py-16 md:py-20">
        <div className="grid md:grid-cols-12 gap-10 md:gap-6">
          <div className="md:col-span-5">
            <Link to="/" className="flex items-center gap-2.5">
              <LogoTile size={44} />
              <span className="font-display font-extrabold text-xl tracking-tight text-ink">
                DashTrashTX<span className="text-primary">TX</span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-[0.95rem] text-muted-foreground leading-relaxed">
              The white-glove trash bin valet for Dallas–Fort Worth homes, properties, and seniors. Bins out the night before, back the day after — every week.
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <a href="tel:+16823625847" className="flex items-center gap-2 text-ink font-semibold hover:text-primary transition-colors">
                <Phone className="h-4 w-4 text-primary" />
                (682) 362-5847
              </a>
              <a href="mailto:support@dashtrashtx.com" className="flex items-center gap-2 text-foreground/80 hover:text-ink transition-colors">
                <Mail className="h-4 w-4 text-muted-foreground" />
                support@dashtrashtx.com
              </a>
            </div>
          </div>

          <FooterCol title="Service" links={[
            { to: "/signup?type=residential", label: "Residential" },
            { to: "/signup?type=enterprise", label: "Enterprise" },
            { to: "/signup?type=elderly", label: "Elderly + insurance" },
            { to: "/waitlist", label: "Waitlist" },
          ]} />
          <FooterCol title="Company" links={[
            { to: "/partners", label: "Partners" },
            { to: "/careers", label: "Careers" },
            { to: "/#how", label: "How it works" },
            { to: "/#pricing", label: "Pricing" },
            { to: "/#faq", label: "FAQ" },
          ]} />
          <FooterCol title="Account" links={[
            { to: "/login", label: "Customer sign in" },
            { to: "/login?role=driver", label: "Driver sign in" },
            { to: "/login?role=admin", label: "Owner / routes" },
            { to: "mailto:support@dashtrashtx.com", label: "support@dashtrashtx.com", external: true },
          ]} />
        </div>

        <div className="mt-14 pt-7 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DashTrashTX, LLC. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link to="/legal/terms" className="hover:text-ink">Terms</Link>
            <Link to="/legal/privacy" className="hover:text-ink">Privacy</Link>
            <span className="font-mono-eyebrow">Built in Texas</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: Array<{ to: string; label: string; external?: boolean }> }) {
  return (
    <div className="md:col-span-2">
      <div className="font-mono-eyebrow text-muted-foreground mb-5">{title}</div>
      <ul className="space-y-3 text-sm">
        {links.map((l) =>
          l.external ? (
            <li key={l.label}>
              <a href={l.to} className="text-foreground/80 hover:text-ink transition-colors">{l.label}</a>
            </li>
          ) : (
            <li key={l.label}>
              <Link to={l.to} className="text-foreground/80 hover:text-ink transition-colors">{l.label}</Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
