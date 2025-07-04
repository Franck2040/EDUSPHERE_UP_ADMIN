
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Play, Server, Code } from 'lucide-react';

const sessionSchema = z.object({
  environment_type: z.string().min(1, 'Le type d\'environnement est requis'),
  description: z.string().optional(),
  auto_start: z.boolean().default(true)
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface StartSessionDialogProps {
  workshop: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function StartSessionDialog({ workshop, onClose, onSuccess }: StartSessionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      environment_type: workshop?.environment_type || 'nodejs',
      description: '',
      auto_start: true
    }
  });

  const onSubmit = async (data: SessionFormData) => {
    setIsLoading(true);
    try {
      // Créer la session dans la base de données
      const { data: session, error } = await supabase
        .from('workshop_sessions')
        .insert({
          workshop_id: workshop.id,
          status: 'created',
          environment_type: data.environment_type,
          description: data.description
        })
        .select()
        .single();

      if (error) throw error;

      // Simuler le provisioning de l'environnement
      if (data.auto_start) {
        // Générer un ID de conteneur simulé
        const containerId = `ws_${session.id.slice(0, 8)}_${Date.now()}`;
        const environmentUrl = `https://env-${containerId}.workshop.dev`;

        // Mettre à jour la session avec les détails de l'environnement
        const { error: updateError } = await supabase
          .from('workshop_sessions')
          .update({
            status: 'running',
            container_id: containerId,
            environment_url: environmentUrl,
            started_at: new Date().toISOString()
          })
          .eq('id', session.id);

        if (updateError) throw updateError;

        toast.success('Session démarrée avec succès! Environnement en cours de provisioning...');
      } else {
        toast.success('Session créée avec succès!');
      }

      onSuccess();
    } catch (error) {
      toast.error('Erreur lors de la création de la session');
      console.error('Error creating session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const environmentTypes = [
    { value: 'nodejs', label: 'Node.js', icon: Server },
    { value: 'python', label: 'Python', icon: Code },
    { value: 'react', label: 'React', icon: Code },
    { value: 'vue', label: 'Vue.js', icon: Code },
    { value: 'angular', label: 'Angular', icon: Code },
    { value: 'docker', label: 'Docker', icon: Server }
  ];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Démarrer une session
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900">{workshop.name}</h4>
              <p className="text-sm text-blue-700">{workshop.description}</p>
            </div>

            <FormField
              control={form.control}
              name="environment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type d'environnement</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un environnement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {environmentTypes.map((env) => {
                        const Icon = env.icon;
                        return (
                          <SelectItem key={env.value} value={env.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {env.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    L'environnement sera provisionné automatiquement
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description de la session (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={2} 
                      placeholder="Objectifs ou notes pour cette session..." 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Démarrage...' : 'Démarrer la session'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
