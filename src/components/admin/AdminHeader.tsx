
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Bell, Search, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function AdminHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 transition-all duration-200">
      <div className="flex h-16 items-center gap-4 px-6">
        <SidebarTrigger className="transition-transform duration-200 hover:scale-110" />
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full transition-all duration-200 hover:bg-accent hover:scale-105"
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Rechercher</span>
          </Button>
          
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full transition-all duration-200 hover:bg-accent hover:scale-105 relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
            <span className="sr-only">Notifications</span>
          </Button>
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-9 w-9 rounded-full transition-all duration-200 hover:scale-105"
              >
                <Avatar className="h-9 w-9 border-2 border-transparent hover:border-primary/20 transition-all duration-200">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                    A
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200" 
              align="end" 
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Admin</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    admin@edusphere.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer transition-colors duration-150">
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer transition-colors duration-150">
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer transition-colors duration-150 text-destructive focus:text-destructive">
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
