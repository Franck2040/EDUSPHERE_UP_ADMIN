
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileUpload } from '../content/FileUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Club {
  id: string;
  nom: string;
  description: string;
  domaine: string;
  type: string;
  avatar_url?: string;
}

interface EditClubDialogProps {
  club: Club;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditClubDialog({ club, open, onOpenChange, onSuccess }: EditClubDialogProps) {
  const [formData, setFormData] = useState({
    nom: club.nom,
    description: club.description || '',
    domaine: club.domaine,
    type: club.type
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(club.avatar_url || '');

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

    try {
      const { error } = await supabase
        .from('clubs')
        .update({
          nom: formData.nom,
          description: formData.description,
          domaine: formData.domaine,
          type: formData.type,
          avatar_url: avatarUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', club.id);

      if (error) throw error;

      toast.success('Club mis à jour avec succès');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
      console.error('Error updating club:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le club</DialogTitle>
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
                <SelectItem value="suspended">Suspendu</SelectItem>
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
              placeholder="Sélectionner une nouvelle image de couverture"
            />
            {club.avatar_url && !avatarFile && (
              <div className="text-sm text-muted-foreground">
                Image actuelle : {club.avatar_url}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Mettre à jour
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
