
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from '@/components/admin/users/UserManagement';
import { UserFilters } from '@/components/admin/users/UserFilters';
import { UserDetails } from '@/components/admin/users/UserDetails';
import { UserStats } from '@/components/admin/users/UserStats';
import { UserBanPanel } from '@/components/admin/users/UserBanPanel';
import { ReportsManagement } from '@/components/admin/users/ReportsManagement';
import { CreateUserDialog } from '@/components/admin/users/CreateUserDialog';
import { UserExport } from '@/components/admin/users/UserExport';
import { Users, Plus, Shield, Flag } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminUsers() {
  const { role: currentUserRole } = useAdminAuth();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUserCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (selectedUser) {
    return (
      <UserDetails 
        userId={selectedUser} 
        onBack={() => setSelectedUser(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gestion des utilisateurs
          </h1>
          <p className="text-muted-foreground">
            Gérez les utilisateurs, leurs rôles et les signalements
          </p>
        </div>
        <div className="flex gap-2">
          <UserExport 
            searchTerm={searchTerm}
            roleFilter={roleFilter}
            statusFilter={statusFilter}
          />
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel utilisateur
          </Button>
        </div>
      </div>

      <UserStats />

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="banned" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Bloqués
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Signalements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filtres et recherche</CardTitle>
              <CardDescription>
                Filtrez et recherchez parmi les utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserFilters
                searchTerm={searchTerm}
                roleFilter={roleFilter}
                statusFilter={statusFilter}
                onSearchChange={setSearchTerm}
                onRoleChange={setRoleFilter}
                onStatusChange={setStatusFilter}
              />
            </CardContent>
          </Card>

          <UserManagement
            searchTerm={searchTerm}
            roleFilter={roleFilter}
            statusFilter={statusFilter}
            onUserSelect={setSelectedUser}
            refreshTrigger={refreshTrigger}
          />
        </TabsContent>

        <TabsContent value="banned">
          <UserBanPanel />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsManagement />
        </TabsContent>
      </Tabs>

      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
}
