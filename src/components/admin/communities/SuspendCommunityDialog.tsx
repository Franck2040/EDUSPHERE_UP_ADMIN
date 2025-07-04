
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SuspendCommunityDialogProps {
  community: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SuspendCommunityDialog({ community, open, onOpenChange, onSuccess }: SuspendCommunityDialogProps) {
  const [days, setDays] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!days || parseInt(days) <= 0) {
      toast.error('Veuillez entrer un nombre de jours valide');
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('communautes')
        .update({ 
          statut: 'suspended'
        })
        .eq('id', community.id);

      if (updateError) throw updateError;

      // Récupérer tous les membres des clubs de cette communauté
      const { data: clubMembers, error: membersError } = await supabase
        .from('club_membres')
        .select('membre_id')
        .in('club_id', community.communaute_clubs.map((cc: any) => cc.club_id));

      if (membersError) throw membersError;

      // Créer des notifications pour tous les membres
      const uniqueMembers = [...new Set(clubMembers.map(cm => cm.membre_id))];
      for (const memberId of uniqueMembers) {
        await supabase.rpc('create_notification', {
          p_utilisateur_id: memberId,
          p_type: 'suspension',
          p_message: `La communauté "${community.nom}" a été suspendue pour ${days} jour(s). Raison: ${reason || 'Non spécifiée'}`,
          p_source: 'admin'
        });
      }

      toast.success(`Communauté suspendue pour ${days} jour(s)`);
      setDays('');
      setReason('');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Erreur lors de la suspension');
      console.error('Error suspending community:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Suspendre la communauté "{community?.nom}"</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="days">Nombre de jours de suspension</Label>
            <Input
              id="days"
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="Nombre de jours"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Raison de la suspension</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Expliquez la raison de la suspension..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="destructive">
              Suspendre
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
