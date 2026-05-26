import { Outlet } from "react-router-dom";
import { LayoutDashboard, Users, Truck, Route, ClipboardList, MapPinned } from "lucide-react";
import { PortalShell } from "@/components/portal/PortalShell";

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/drivers", label: "Drivers", icon: Truck },
  { to: "/admin/routes", label: "Routes", icon: Route },
  { to: "/admin/waitlist", label: "Waitlist", icon: MapPinned },
  { to: "/admin/applications", label: "Applications", icon: ClipboardList },
];

export default function AdminLayout() {
  return (
    <PortalShell title="Dispatch" nav={nav}>
      <Outlet />
    </PortalShell>
  );
}
