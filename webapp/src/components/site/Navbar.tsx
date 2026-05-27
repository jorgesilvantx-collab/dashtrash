import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogoTile } from "@/components/site/Logo";
import { cn } from "@/lib/utils";

const links = [
  { to: "/#how", label: "How it works" },
  { to: "/#services", label: "Services" },
  { to: "/#pricing", label: "Pricing" },
  { to: "/#coverage", label: "Coverage" },
  { to: "/partners", label: "Partners" },
  { to: "/careers", label: "Careers" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/85 hairline-bottom">
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2.5 group">
          <LogoTile size={40} className="md:[width:44px] md:[height:44px] transition group-hover:rotate-[-3deg]" />
          <span className="font-display font-extrabold text-lg md:text-xl tracking-tight text-ink">
            DashTrashTX<span className="text-primary">TX</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-9">
          {links.map((l) => (
            <a key={l.to} href={l.to} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <a href="tel:+16823625847" className="hidden xl:inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/80 hover:text-ink mr-2 px-2">
            <Phone className="h-3.5 w-3.5" />
            (682) 362-5847
          </a>
          <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="text-foreground/80 font-semibold rounded-xl">
            Sign in
          </Button>
          <Button size="sm" onClick={() => navigate("/signup")} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-10 px-5 font-semibold">
            Start service
          </Button>
        </div>

        <button onClick={() => setOpen((v) => !v)} className="lg:hidden p-2 -mr-2" aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className={cn("lg:hidden overflow-hidden transition-[max-height] duration-300 border-t border-border", open ? "max-h-96" : "max-h-0")}>
        <div className="container py-4 flex flex-col gap-3 bg-background">
          {links.map((l) => (
            <a key={l.to} href={l.to} onClick={() => setOpen(false)} className="py-2 text-foreground/90 font-medium">
              {l.label}
            </a>
          ))}
          <a href="tel:+16823625847" className="flex items-center gap-2 py-2 text-ink font-semibold">
            <Phone className="h-4 w-4 text-primary" />
            (682) 362-5847
          </a>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => { setOpen(false); navigate("/login"); }}>Sign in</Button>
            <Button className="flex-1 bg-primary text-primary-foreground rounded-xl" onClick={() => { setOpen(false); navigate("/signup"); }}>Start service</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
