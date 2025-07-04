
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Community {
  id: string;
  nom: string;
  description: string;
  statut: string;
}

interface EditCommunityDialogProps {
  community: Community;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditCommunityDialog({ community, open, onOpenChange, onSuccess }: EditCommunityDialogProps) {
  const [formData, setFormData] = useState({
    nom: community.nom,
    description: community.description || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom.trim()) {
      toast.error('Le nom de la communauté est requis');
      return;
    }

    try {
      const { error } = await supabase
        .from('communautes')
        .update({
          nom: formData.nom,
          description: formData.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', community.id);

      if (error) throw error;

      toast.success('Communauté mise à jour avec succès');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
      console.error('Error updating community:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier la communauté</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom de la communauté</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              placeholder="Nom de la communauté"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description de la communauté"
              rows={3}
            />
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
