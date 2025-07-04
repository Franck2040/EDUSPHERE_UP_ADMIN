
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Crown, User, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface WorkshopMemberManagerProps {
  workshopId: string;
  workshopName: string;
}

export function WorkshopMemberManager({ workshopId, workshopName }: WorkshopMemberManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('collaborator');

  const { data: members, isLoading, refetch } = useQuery({
    queryKey: ['workshop-members', workshopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workshop_members')
        .select(`
          *,
          profiles(first_name, last_name, email, avatar_url)
        `)
        .eq('workshop_id', workshopId);
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: availableUsers } = useQuery({
    queryKey: ['available-users', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, avatar_url')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: searchTerm.length >= 2
  });

  const handleAddMember = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('workshop_members')
        .insert({
          workshop_id: workshopId,
          user_id: userId,
          role: newMemberRole
        });

      if (error) throw error;

      toast.success('Membre ajouté avec succès');
      setShowAddDialog(false);
      setNewMemberEmail('');
      refetch();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du membre');
      console.error('Error adding member:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce membre ?')) return;

    try {
      const { error } = await supabase
        .from('workshop_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Membre retiré avec succès');
      refetch();
    } catch (error) {
      toast.error('Erreur lors du retrait du membre');
      console.error('Error removing member:', error);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('workshop_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Rôle mis à jour avec succès');
      refetch();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du rôle');
      console.error('Error updating role:', error);
    }
  };

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Membres de l'atelier: {workshopName}</CardTitle>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter un membre
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un membre</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="collaborator">Collaborateur</SelectItem>
                    <SelectItem value="manager">Gestionnaire</SelectItem>
                  </SelectContent>
                </Select>

                {availableUsers && availableUsers.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {availableUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback>
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.first_name} {user.last_name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleAddMember(user.id)}>
                          Ajouter
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membre</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Rejoint le</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members?.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.profiles?.avatar_url} />
                      <AvatarFallback>
                        {member.profiles?.first_name?.[0]}{member.profiles?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {member.profiles?.first_name} {member.profiles?.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member.profiles?.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Select 
                    value={member.role} 
                    onValueChange={(value) => handleChangeRole(member.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="collaborator">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Collaborateur
                        </div>
                      </SelectItem>
                      <SelectItem value="manager">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Gestionnaire
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {new Date(member.joined_at).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
