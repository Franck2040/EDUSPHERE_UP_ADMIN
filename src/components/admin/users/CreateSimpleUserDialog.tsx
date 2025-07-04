
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateSimpleUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
}

export function CreateSimpleUserDialog({ open, onOpenChange, onUserCreated }: CreateSimpleUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    matricule: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create user via Supabase signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update the user's matricule if provided
        if (formData.matricule) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ matricule: formData.matricule })
            .eq('id', authData.user.id);

          if (profileError) throw profileError;
        }

        // Log the creation
        await supabase
          .from('security_logs')
          .insert({
            event_type: 'user_created',
            user_id: authData.user.id,
            details: { 
              created_by: (await supabase.auth.getUser()).data.user?.id,
              role: 'user'
            }
          });

        toast.success('Utilisateur créé avec succès');
        onUserCreated();
        onOpenChange(false);
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          matricule: ''
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création de l\'utilisateur');
      console.error('Create user error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer un utilisateur simple</DialogTitle>
          <DialogDescription>
            Ajoutez un nouvel utilisateur standard à la plateforme
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              minLength={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="matricule">Matricule (optionnel)</Label>
            <Input
              id="matricule"
              value={formData.matricule}
              onChange={(e) => setFormData(prev => ({ ...prev, matricule: e.target.value }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Création...' : 'Créer l\'utilisateur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
