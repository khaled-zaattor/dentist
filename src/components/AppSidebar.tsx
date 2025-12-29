import { useState, useEffect } from "react";
import { Users, Calendar, FileText, Stethoscope, UserCheck, Settings, FileSpreadsheet, ListChecks, MonitorPlay } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { authService } from "@/lib/api/services/auth.service";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { path: "/admin", label: "لوحة التحكم", icon: Stethoscope },
  { path: "/patients", label: "المرضى", icon: Users },
  { path: "/doctors", label: "الأطباء", icon: UserCheck },
  { path: "/appointments", label: "المواعيد", icon: Calendar },
  { path: "/treatments", label: "العلاجات", icon: FileText },
  { path: "/waiting-list-management", label: "إدارة لائحة الانتظار", icon: ListChecks },
  { path: "/waiting-list-display", label: "عرض لائحة الانتظار", icon: MonitorPlay },
  { path: "/activity-logs", label: "سجل النشاطات", icon: FileSpreadsheet },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get current user from Laravel auth
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const isActive = (path: string) => currentPath === path;
  const isCollapsed = state === "collapsed";

  const getNavCls = (active: boolean) =>
    active ? "bg-primary text-primary-foreground font-medium" : "hover:bg-accent hover:text-accent-foreground";

  // Show all menu items for now (you can add role-based filtering later)
  const visibleNavItems = navItems;

  return (
    <Sidebar 
      variant="sidebar" 
      side="right"
      className="border-l"
    >
      <SidebarContent>
        <div className="p-4 border-b">
          <h1 className={`font-bold text-primary transition-all ${isCollapsed ? "text-sm text-center" : "text-xl"}`}>
            {isCollapsed ? "ع.أ" : "عيادة الأسنان"}
          </h1>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            القائمة الرئيسية
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.path} 
                        end 
                        className={getNavCls(active)}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {!isCollapsed && <span className="mr-2">{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}