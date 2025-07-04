
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserNotificationDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserNotificationDialog({ user, open, onOpenChange }: UserNotificationDialogProps) {
  const [notificationData, setNotificationData] = useState({
    type: 'info',
    message: '',
    url_cible: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!notificationData.message.trim()) {
      toast.error('Le message est requis');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.rpc('create_notification', {
        p_utilisateur_id: user.id,
        p_type: notificationData.type,
        p_message: notificationData.message,
        p_source: 'admin',
        p_url_cible: notificationData.url_cible || null
      });

      if (error) throw error;

      toast.success('Notification envoyée avec succès');
      setNotificationData({ type: 'info', message: '', url_cible: '' });
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Erreur lors de l\'envoi de la notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Envoyer une notification à {user.prenom} {user.nom}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type de notification</Label>
            <Select 
              value={notificationData.type} 
              onValueChange={(value) => setNotificationData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Information</SelectItem>
                <SelectItem value="warning">Avertissement</SelectItem>
                <SelectItem value="success">Succès</SelectItem>
                <SelectItem value="error">Erreur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={notificationData.message}
              onChange={(e) => setNotificationData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Tapez votre message ici..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url_cible">URL cible (optionnel)</Label>
            <Input
              id="url_cible"
              value={notificationData.url_cible}
              onChange={(e) => setNotificationData(prev => ({ ...prev, url_cible: e.target.value }))}
              placeholder="https://exemple.com"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Envoi...' : 'Envoyer la notification'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
