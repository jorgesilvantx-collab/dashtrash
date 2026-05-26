import { Outlet } from "react-router-dom";
import { Home, CreditCard, Camera, Settings } from "lucide-react";
import { PortalShell } from "@/components/portal/PortalShell";

const nav = [
  { to: "/dashboard", label: "Overview", icon: Home },
  { to: "/dashboard/homes", label: "My homes", icon: Home },
  { to: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { to: "/dashboard/photos", label: "Photo proof", icon: Camera },
  { to: "/dashboard/profile", label: "Account", icon: Settings },
];

export default function CustomerLayout() {
  return (
    <PortalShell title="Customer portal" nav={nav}>
      <Outlet />
    </PortalShell>
  );
}
