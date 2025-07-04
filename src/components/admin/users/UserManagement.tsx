import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { UserList } from './UserList';
import { DetailedUserProfile } from './DetailedUserProfile';

interface UserManagementProps {
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
  onUserSelect: (userId: string) => void;
  refreshTrigger: number;
}

export function UserManagement({ 
  searchTerm, 
  roleFilter, 
  statusFilter, 
  onUserSelect, 
  refreshTrigger 
}: UserManagementProps) {
  const [showDetailedProfile, setShowDetailedProfile] = useState<string | null>(null);

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users', searchTerm, roleFilter, statusFilter, refreshTrigger],
    queryFn: async () => {
      let query = supabase
        .from('utilisateurs')
        .select('*')
        .ilike('prenom', `%${searchTerm}%`);

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      if (statusFilter !== 'all') {
        query = query.eq('statut', statusFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        throw new Error(error.message);
      }
      return data;
    },
  });

  const filteredUsers = users?.filter(user => {
    const fullName = `${user.prenom} ${user.nom}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  if (showDetailedProfile) {
    return (
      <DetailedUserProfile
        userId={showDetailedProfile}
        onBack={() => setShowDetailedProfile(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Erreur lors du chargement des utilisateurs.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des utilisateurs</CardTitle>
      </CardHeader>
      <CardContent>
        <UserList 
          users={filteredUsers || []}
          onUserSelect={onUserSelect}
          onDetailedView={setShowDetailedProfile}
        />
      </CardContent>
    </Card>
  );
}
