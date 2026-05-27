import { Link } from "react-router-dom";
import { Phone, Mail } from "lucide-react";
import { LogoTile, Wordmark } from "@/components/site/Logo";

export function Footer() {
  return (
    <footer className="bg-[#0F1722] text-white/70">
      <div className="container py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-6">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-5">
            <Link to="/" className="flex items-center gap-2.5 group">
              <LogoTile size={44} />
              <Wordmark className="text-xl text-white [&>span]:text-primary" />
            </Link>
            <p className="mt-5 max-w-sm text-[0.9rem] text-white/50 leading-relaxed">
              The white-glove trash bin valet for Dallas–Fort Worth homes, properties, and seniors. Bins out the night before, back the day after — every week.
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <a
                href="tel:+16823625847"
                className="flex items-center gap-2 text-white font-semibold hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4 text-primary" />
                (682) 362-5847
              </a>
              <a
                href="mailto:support@dashtrashtx.com"
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4 text-white/40" />
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

        <div className="mt-14 pt-7 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="text-xs text-white/30">
            © {new Date().getFullYear()} DashTrashTX, LLC. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <Link to="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span className="font-mono-eyebrow text-primary/60">Built in Texas</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<{ to: string; label: string; external?: boolean }>;
}) {
  return (
    <div className="col-span-1 md:col-span-2">
      <div className="font-mono-eyebrow text-white/30 mb-5">{title}</div>
      <ul className="space-y-3 text-sm">
        {links.map((l) =>
          l.external ? (
            <li key={l.label}>
              <a
                href={l.to}
                className="text-white/50 hover:text-white transition-colors leading-relaxed"
              >
                {l.label}
              </a>
            </li>
          ) : (
            <li key={l.label}>
              <Link
                to={l.to}
                className="text-white/50 hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
