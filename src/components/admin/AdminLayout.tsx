
import { Outlet, Navigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export function AdminLayout() {
  const { loading, isAdmin } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 border-4 border-primary/30 rounded-full animate-spin border-t-primary"></div>
            <div className="absolute inset-0 h-16 w-16 border-4 border-transparent rounded-full animate-ping border-t-primary/20"></div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background transition-colors duration-300">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 bg-gradient-to-br from-background via-muted/30 to-background animate-fade-in overflow-auto">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
