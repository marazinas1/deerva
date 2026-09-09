import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, Building2, LayoutDashboard, LogOut, UserCog } from "lucide-react";

import BrandLogo from "@/components/admin/BrandLogo";
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
import { supabase } from "@/integrations/supabase/client";

type Item = {
  title: string;
  url: string;
  icon: typeof Building2;
  managerOnly: boolean;
  match: (path: string) => boolean;
};

const GROUPS: { label: string; items: Item[] }[] = [
  {
    label: "Workspace",
    items: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
        managerOnly: false,
        match: (p) => p === "/admin",
      },
      {
        title: "Clients",
        url: "/admin/clients",
        icon: Building2,
        managerOnly: false,
        match: (p) => p.startsWith("/admin/clients"),
      },
      {
        title: "Users",
        url: "/admin/users",
        icon: UserCog,
        managerOnly: true,
        match: (p) => p.startsWith("/admin/users"),
      },
    ],
  },
];

const ROLE_LABEL: Record<string, string> = {
  developer: "Developer",
  owner: "Owner",
  editor: "Editor",
};

export default function AdminSidebar({
  email,
  role,
  isManager,
  onSignOut,
}: {
  email: string;
  role: string;
  isManager: boolean;
  onSignOut: () => void | Promise<void>;
}) {
  const navigate = useNavigate();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (router) => router.location.pathname });

  void navigate;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border">
        <Link to="/admin" className="flex h-12 items-center px-2">
          <BrandLogo className={collapsed ? "h-5 w-auto" : "h-7 w-auto"} />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items
                  .filter((item) => !item.managerOnly || isManager)
                  .map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.match(pathname)}
                        tooltip={item.title}
                      >
                        <Link
                          to={item.url}
                          className="flex items-center gap-2"
                          onClick={() => {
                            if (isMobile) setOpenMobile(false);
                          }}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className={`px-2 py-1 ${collapsed ? "hidden" : ""}`}>
              <div className="truncate text-xs text-muted">{email}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted/70">
                {ROLE_LABEL[role] ?? role}
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to site">
              <Link
                to="/"
                onClick={() => {
                  if (isMobile) setOpenMobile(false);
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => void onSignOut()} tooltip="Sign out">
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export { supabase };
