import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/#how", label: "How it works" },
  { to: "/#services", label: "Services" },
  { to: "/#pricing", label: "Pricing" },
  { to: "/#coverage", label: "Coverage" },
  { to: "/careers", label: "Careers" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/60">
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src="/brand/logo.jpg" alt="DashTrashTX" className="h-9 w-9 md:h-10 md:w-10 rounded-md object-cover ring-1 ring-primary/30 group-hover:ring-primary/60 transition" />
          <span className="font-display text-lg md:text-xl tracking-tight">
            DashTrash<span className="text-primary">TX</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.to} href={l.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="text-foreground/80">
            Sign in
          </Button>
          <Button size="sm" onClick={() => navigate("/signup")} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Start service
          </Button>
        </div>

        <button onClick={() => setOpen((v) => !v)} className="lg:hidden p-2 -mr-2" aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className={cn("lg:hidden overflow-hidden transition-[max-height] duration-300 border-t border-border/60", open ? "max-h-96" : "max-h-0")}>
        <div className="container py-4 flex flex-col gap-3">
          {links.map((l) => (
            <a key={l.to} href={l.to} onClick={() => setOpen(false)} className="py-2 text-foreground/90">
              {l.label}
            </a>
          ))}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { setOpen(false); navigate("/login"); }}>Sign in</Button>
            <Button className="flex-1 bg-primary text-primary-foreground" onClick={() => { setOpen(false); navigate("/signup"); }}>Start service</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
