
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserRoleChangeDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UserRoleChangeDialog({ user, open, onOpenChange, onSuccess }: UserRoleChangeDialogProps) {
  const [newRole, setNewRole] = useState(user.role || 'user');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newRole === user.role) {
      toast.error('Le rôle sélectionné est déjà celui de l\'utilisateur');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', user.id);

      if (error) throw error;

      // Log de sécurité
      await supabase
        .from('security_logs')
        .insert({
          event_type: 'role_changed',
          user_id: user.id,
          details: { 
            changed_by: (await supabase.auth.getUser()).data.user?.id,
            old_role: user.role,
            new_role: newRole
          }
        });

      toast.success('Rôle modifié avec succès');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error changing role:', error);
      toast.error('Erreur lors de la modification du rôle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Changer le rôle de {user.prenom} {user.nom}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rôle actuel: <strong>{user.role}</strong></Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newRole">Nouveau rôle</Label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Utilisateur</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
                <SelectItem value="super_admin">Super Administrateur</SelectItem>
                <SelectItem value="moderator">Modérateur</SelectItem>
                <SelectItem value="content_admin">Admin Contenu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Modification...' : 'Changer le rôle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
