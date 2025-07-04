
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AddMemberDialogProps {
  clubId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddMemberDialog({ clubId, open, onOpenChange, onSuccess }: AddMemberDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [role, setRole] = useState('membre');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: availableUsers } = useQuery({
    queryKey: ['available-users', clubId, searchTerm],
    queryFn: async () => {
      // Obtenir les utilisateurs déjà membres du club
      const { data: existingMembers } = await supabase
        .from('club_membres')
        .select('membre_id')
        .eq('club_id', clubId);

      const existingMemberIds = existingMembers?.map(m => m.membre_id) || [];

      // Rechercher les utilisateurs qui ne sont pas encore membres
      let query = supabase
        .from('utilisateurs')
        .select('id, prenom, nom, email')
        .not('id', 'in', `(${existingMemberIds.length > 0 ? existingMemberIds.join(',') : 'null'})`);

      if (searchTerm) {
        query = query.or(`prenom.ilike.%${searchTerm}%,nom.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: open
  });

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Veuillez sélectionner au moins un utilisateur');
      return;
    }

    setIsSubmitting(true);

    try {
      const membersToAdd = selectedUsers.map(userId => ({
        club_id: clubId,
        membre_id: userId,
        role: role,
        is_admin: role === 'admin'
      }));

      const { error } = await supabase
        .from('club_membres')
        .insert(membersToAdd);

      if (error) throw error;

      // Envoyer des notifications aux nouveaux membres
      for (const userId of selectedUsers) {
        await supabase.rpc('create_notification', {
          p_utilisateur_id: userId,
          p_type: 'club_invitation',
          p_message: 'Vous avez été ajouté à un nouveau club',
          p_source: 'admin'
        });
      }

      toast.success(`${selectedUsers.length} membre(s) ajouté(s) avec succès`);
      setSelectedUsers([]);
      setSearchTerm('');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Erreur lors de l\'ajout des membres');
      console.error('Error adding members:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter des membres au club</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des utilisateurs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="membre">Membre</SelectItem>
                <SelectItem value="observateur">Observateur</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedUsers.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium mb-2">
                {selectedUsers.length} utilisateur(s) sélectionné(s)
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(userId => {
                  const user = availableUsers?.find(u => u.id === userId);
                  return (
                    <Badge key={userId} variant="outline">
                      {user?.prenom} {user?.nom}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto border rounded-lg">
            {availableUsers?.map((user) => (
              <div
                key={user.id}
                className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                  selectedUsers.includes(user.id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => toggleUserSelection(user.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.prenom?.[0]}{user.nom?.[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{user.prenom} {user.nom}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                  {selectedUsers.includes(user.id) && (
                    <Badge variant="default">Sélectionné</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleAddMembers}
              disabled={selectedUsers.length === 0 || isSubmitting}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter {selectedUsers.length > 0 && `(${selectedUsers.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
