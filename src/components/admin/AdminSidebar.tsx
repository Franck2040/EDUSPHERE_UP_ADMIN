
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Settings,
  BarChart3,
  UserCog,
  Wrench,
  Users2,
  LogOut
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Badge } from '@/components/ui/badge';

const menuItems = [
  {
    title: 'Vue d\'ensemble',
    url: '/admin',
    icon: LayoutDashboard,
    exact: true
  },
  {
    title: 'Utilisateurs',
    url: '/admin/users',
    icon: Users,
  },
  {
    title: 'Communautés',
    url: '/admin/communities',
    icon: Users2,
    badge: 'Nouveau'
  },
  {
    title: 'Contenu',
    url: '/admin/content',
    icon: BookOpen,
  },
  {
    title: 'Ateliers',
    url: '/admin/workshops',
    icon: Wrench,
  },
  {
    title: 'Analytiques',
    url: '/admin/analytics',
    icon: BarChart3,
    disabled: true
  },
  {
    title: 'Paramètres',
    url: '/admin/settings',
    icon: Settings,
    disabled: true
  }
];

export function AdminSidebar() {
  const location = useLocation();
  const { signOut } = useAdminAuth();

  const isActive = (url: string, exact = false) => {
    if (exact) {
      return location.pathname === url;
    }
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar className="border-r bg-muted/40">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <UserCog className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Admin</h2>
            <p className="text-xs text-muted-foreground">Interface d'administration</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1 px-3 py-4">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.url, item.exact)}
                  disabled={item.disabled}
                  className={cn(
                    "w-full justify-start transition-colors",
                    isActive(item.url, item.exact) && "bg-primary text-primary-foreground",
                    item.disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Link 
                    to={item.disabled ? '#' : item.url}
                    className="flex items-center space-x-2 w-full"
                    onClick={(e) => item.disabled && e.preventDefault()}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </ScrollArea>

        <Separator />
        
        <SidebarFooter className="p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </Button>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
