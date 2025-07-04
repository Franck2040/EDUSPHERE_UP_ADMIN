
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileUpload } from '../content/FileUpload';
import { UserSelectionDialog } from './UserSelectionDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateClubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface User {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  photo_profil_url?: string;
  matricule?: string;
}

export function CreateClubDialog({ open, onOpenChange, onSuccess }: CreateClubDialogProps) {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    domaine: '',
    type: 'public'
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [showUserSelection, setShowUserSelection] = useState(false);

  const domains = [
    'informatique',
    'sciences',
    'commerce',
    'medecine',
    'ingenierie',
    'arts',
    'langues',
    'sport'
  ];

  const handleAvatarUpload = (file: File | null, url?: string) => {
    setAvatarFile(file);
    if (url) setAvatarUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom.trim() || !formData.domaine) {
      toast.error('Le nom et le domaine sont requis');
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error('Veuillez sélectionner au moins un membre pour le club');
      return;
    }

    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) {
        throw new Error('Utilisateur non authentifié');
      }

      // Créer le club
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .insert({
          nom: formData.nom,
          description: formData.description,
          domaine: formData.domaine,
          type: formData.type,
          avatar_url: avatarUrl || null,
          proprietaire_id: currentUser.id
        })
        .select()
        .single();

      if (clubError) throw clubError;

      // Ajouter le propriétaire comme membre admin
      await supabase
        .from('club_membres')
        .insert({
          club_id: clubData.id,
          membre_id: currentUser.id,
          role: 'proprietaire',
          is_admin: true
        });

      // Ajouter les membres sélectionnés
      const membersToAdd = selectedUsers.map((user, index) => ({
        club_id: clubData.id,
        membre_id: user.id,
        role: index === 0 ? 'admin' : 'membre',
        is_admin: index === 0,
        admin_id: currentUser.id
      }));

      const { error: membersError } = await supabase
        .from('club_membres')
        .insert(membersToAdd);

      if (membersError) throw membersError;

      toast.success('Club créé avec succès');
      
      // Reset form
      setFormData({ nom: '', description: '', domaine: '', type: 'public' });
      setAvatarFile(null);
      setAvatarUrl('');
      setSelectedUsers([]);
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Erreur lors de la création');
      console.error('Error creating club:', error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un club</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom du club</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                placeholder="Nom du club"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du club"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domaine">Domaine</Label>
              <Select value={formData.domaine} onValueChange={(value) => setFormData(prev => ({ ...prev, domaine: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un domaine" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {domain.charAt(0).toUpperCase() + domain.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="privé">Privé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Image de couverture du club</Label>
              <FileUpload
                accept="image/*"
                bucket="avatars"
                onFileSelect={handleAvatarUpload}
                selectedFile={avatarFile}
                placeholder="Sélectionner une image de couverture"
              />
            </div>

            <div className="space-y-2">
              <Label>Membres du club</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUserSelection(true)}
                className="w-full"
              >
                Sélectionner les membres ({selectedUsers.length})
              </Button>
              {selectedUsers.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Premier membre sélectionné : <strong>{selectedUsers[0].prenom} {selectedUsers[0].nom}</strong> (sera admin)
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit">
                Créer le club
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <UserSelectionDialog
        open={showUserSelection}
        onOpenChange={setShowUserSelection}
        selectedUsers={selectedUsers}
        onUsersSelect={setSelectedUsers}
      />
    </>
  );
}
