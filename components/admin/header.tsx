"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
// import { ThemeToggle } from "@/components/theme-toggle"

const pathNameMap: Record<string, string> = {
  admin: "Admin",
  users: "Users",
  referrals: "Referral Network",
  trades: "Trade History",
  withdrawals: "Withdrawals",
  products: "Products",
  orders: "Orders",
  reports: "Reports",
  settings: "Settings",
};

export function AdminHeader() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          {segments.slice(1).map((segment, index) => (
            <span key={segment} className="flex items-center gap-2">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {index === segments.length - 2 ? (
                  <BreadcrumbPage>
                    {pathNameMap[segment] || segment}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={`/${segments.slice(0, index + 2).join("/")}`}
                  >
                    {pathNameMap[segment] || segment}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto">{/* <ThemeToggle />/ */}</div>
    </header>
  );
}
