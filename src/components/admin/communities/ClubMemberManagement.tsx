
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { AddMemberDialog } from './AddMemberDialog';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Crown,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface ClubMemberManagementProps {
  clubId: string;
  onBack: () => void;
}

export function ClubMemberManagement({ clubId, onBack }: ClubMemberManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: members, isLoading, refetch } = useQuery({
    queryKey: ['club-members', clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('club_membres')
        .select(`
          club_id,
          membre_id,
          role,
          is_admin,
          date_adhesion,
          utilisateurs!inner(
            id,
            prenom,
            nom,
            email,
            photo_profil_url
          )
        `)
        .eq('club_id', clubId);

      if (error) throw error;
      return data || [];
    }
  });

  const { data: club } = useQuery({
    queryKey: ['club', clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', clubId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const promoteToAdminMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('club_membres')
        .update({ is_admin: true, role: 'admin' })
        .eq('club_id', clubId)
        .eq('membre_id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Membre promu administrateur');
      refetch();
    },
    onError: (error) => {
      console.error('Error promoting member:', error);
      toast.error('Erreur lors de la promotion');
    }
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const { error } = await supabase
        .from('club_membres')
        .update({ role })
        .eq('club_id', clubId)
        .eq('membre_id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Permissions mises à jour');
      refetch();
    },
    onError: (error) => {
      console.error('Error updating permissions:', error);
      toast.error('Erreur lors de la mise à jour des permissions');
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('club_membres')
        .delete()
        .eq('club_id', clubId)
        .eq('membre_id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Membre retiré du club');
      refetch();
    },
    onError: (error) => {
      console.error('Error removing member:', error);
      toast.error('Erreur lors de la suppression');
    }
  });

  const filteredMembers = members?.filter(member =>
    member.utilisateurs.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.utilisateurs.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.utilisateurs.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div>
                <CardTitle>Gestion des membres - {club?.nom}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {members?.length || 0} membre(s)
                </p>
              </div>
            </div>
            <Button onClick={() => setAddMemberDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un membre
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des membres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membre</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Date d'adhésion</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.membre_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {member.utilisateurs.photo_profil_url ? (
                          <img 
                            src={member.utilisateurs.photo_profil_url} 
                            alt={`${member.utilisateurs.prenom} ${member.utilisateurs.nom}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {member.utilisateurs.prenom?.[0]}{member.utilisateurs.nom?.[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {member.utilisateurs.prenom} {member.utilisateurs.nom}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.utilisateurs.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.is_admin ? 'default' : 'secondary'}>
                      {member.is_admin ? 'Admin' : 'Membre'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={member.role || 'membre'}
                      onValueChange={(value) => updatePermissionsMutation.mutate({
                        memberId: member.membre_id,
                        role: value
                      })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="membre">Membre</SelectItem>
                        <SelectItem value="lecture_seule">Lecture seule</SelectItem>
                        <SelectItem value="moderateur">Modérateur</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {new Date(member.date_adhesion).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!member.is_admin && (
                          <DropdownMenuItem onClick={() => promoteToAdminMutation.mutate(member.membre_id)}>
                            <Crown className="h-4 w-4 mr-2" />
                            Promouvoir admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => removeMemberMutation.mutate(member.membre_id)}
                          className="text-red-600"
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Retirer du club
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddMemberDialog
        clubId={clubId}
        open={addMemberDialogOpen}
        onOpenChange={setAddMemberDialogOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
