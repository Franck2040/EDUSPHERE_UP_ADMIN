
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateWorkshopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateWorkshopDialog({ open, onOpenChange, onSuccess }: CreateWorkshopDialogProps) {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    visibilite: 'privé',
    club_id: ''
  });

  const { data: clubs } = useQuery({
    queryKey: ['clubs-for-workshop'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clubs')
        .select('id, nom')
        .order('nom');
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom.trim()) {
      toast.error('Le nom de l\'atelier est requis');
      return;
    }

    try {
      const { error } = await supabase
        .from('ateliers_travail')
        .insert({
          nom: formData.nom,
          description: formData.description,
          visibilite: formData.visibilite,
          club_id: formData.club_id || null
        });

      if (error) throw error;

      toast.success('Atelier créé avec succès');
      setFormData({ nom: '', description: '', visibilite: 'privé', club_id: '' });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Erreur lors de la création');
      console.error('Error creating workshop:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un atelier</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom de l'atelier</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              placeholder="Nom de l'atelier"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description de l'atelier"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="club">Communauté (optionnel)</Label>
            <Select value={formData.club_id} onValueChange={(value) => setFormData(prev => ({ ...prev, club_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une communauté" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucune communauté</SelectItem>
                {clubs?.map((club) => (
                  <SelectItem key={club.id} value={club.id}>
                    {club.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibilite">Visibilité</Label>
            <Select value={formData.visibilite} onValueChange={(value) => setFormData(prev => ({ ...prev, visibilite: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="privé">Privé</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Créer l'atelier
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
