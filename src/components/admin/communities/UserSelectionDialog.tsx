
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Search, Plus } from 'lucide-react';

interface User {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  photo_profil_url?: string;
  matricule?: string;
}

interface UserSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUsers: User[];
  onUsersSelect: (users: User[]) => void;
}

export function UserSelectionDialog({ 
  open, 
  onOpenChange, 
  selectedUsers, 
  onUsersSelect 
}: UserSelectionDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('utilisateurs')
        .select('id, prenom, nom, email, photo_profil_url, matricule')
        .order('prenom');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateAvatar = (firstName: string, lastName: string) => {
    const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    return (
      <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
        {initials}
      </div>
    );
  };

  const handleUserToggle = (user: User) => {
    const isSelected = selectedUsers.some(u => u.id === user.id);
    
    if (isSelected) {
      onUsersSelect(selectedUsers.filter(u => u.id !== user.id));
    } else {
      onUsersSelect([...selectedUsers, user]);
    }
  };

  const handleConfirm = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            Sélectionner les membres du club ({selectedUsers.length} sélectionné{selectedUsers.length > 1 ? 's' : ''})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des utilisateurs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Utilisateurs sélectionnés :</h4>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user, index) => (
                  <Badge key={user.id} variant={index === 0 ? 'default' : 'secondary'}>
                    {user.prenom} {user.nom} {index === 0 && '(Admin)'}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Le premier utilisateur sélectionné sera automatiquement administrateur du club.
              </p>
            </div>
          )}

          <ScrollArea className="h-80">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => {
                  const isSelected = selectedUsers.some(u => u.id === user.id);
                  const selectedIndex = selectedUsers.findIndex(u => u.id === user.id);
                  
                  return (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        isSelected ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handleUserToggle(user)}
                    >
                      <div className="flex items-center gap-3">
                        {user.photo_profil_url ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photo_profil_url} />
                            <AvatarFallback>
                              {user.prenom?.[0]}{user.nom?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          generateAvatar(user.prenom, user.nom)
                        )}
                        <div>
                          <div className="font-medium">
                            {user.prenom} {user.nom}
                            {selectedIndex === 0 && (
                              <Badge variant="outline" className="ml-2">Admin</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email} • {user.matricule}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                      >
                        {isSelected ? "Sélectionné" : "Sélectionner"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleConfirm}>
              Confirmer ({selectedUsers.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
