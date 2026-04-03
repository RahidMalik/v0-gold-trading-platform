"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  ShoppingBag,
  Users,
  ArrowDownToLine,
  Bot,
  History,
  Settings,
  LogOut,
  ChevronUp,
  Gem,
  ShieldCheck,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { formatCurrency, formatGoldWeight } from "@/lib/gold-price";

interface DashboardSidebarProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
    referralCode: string;
    goldBalance: number;
    cashBalance: number;
  };
}

const menuItems = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Trade Gold", href: "/dashboard/trade", icon: TrendingUp },
      { title: "My Portfolio", href: "/dashboard/portfolio", icon: Wallet },
    ],
  },
  {
    title: "Shop",
    items: [
      { title: "Gold Shop", href: "/dashboard/shop", icon: ShoppingBag },
      { title: "My Orders", href: "/dashboard/orders", icon: History },
    ],
  },
  {
    title: "Rewards",
    items: [
      { title: "Referrals", href: "/dashboard/referrals", icon: Users },
      {
        title: "Withdrawals",
        href: "/dashboard/withdrawals",
        icon: ArrowDownToLine,
      },
    ],
  },
  {
    title: "Advanced",
    items: [
      { title: "AI Assistant", href: "/dashboard/assistant", icon: Bot },
      { title: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex items-center justify-center rounded-lg bg-primary text-primary-foreground aspect-square size-8">
                  <Gem className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">GoldInvest</span>
                  <span className="text-xs text-muted-foreground">
                    Trading Platform
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Balance Card */}
        {state === "expanded" && (
          <SidebarGroup>
            <SidebarGroupLabel>Your Balance</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="rounded-lg bg-sidebar-accent p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-sidebar-foreground/70">
                    Gold
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {formatGoldWeight(user.goldBalance)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-sidebar-foreground/70">
                    Cash
                  </span>
                  <span className="text-sm font-semibold">
                    {formatCurrency(user.cashBalance)}
                  </span>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Main Menu */}
        {menuItems.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/admin")}
                    tooltip="Admin Panel"
                  >
                    <Link href="/admin">
                      <ShieldCheck className="size-4" />
                      <span>Admin Panel</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={undefined} alt={user.name || "User"} />
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                      {getInitials(user.name ?? null)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
