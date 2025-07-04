
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  FormMessage 
} from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const workshopSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  club_id: z.string().optional(),
  environment_type: z.string().optional(),
  is_private: z.boolean().default(true)
});

type WorkshopFormData = z.infer<typeof workshopSchema>;

interface WorkshopFormProps {
  workshop?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function WorkshopForm({ workshop, onClose, onSuccess }: WorkshopFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<WorkshopFormData>({
    resolver: zodResolver(workshopSchema),
    defaultValues: {
      name: workshop?.name || '',
      description: workshop?.description || '',
      club_id: workshop?.club_id || '',
      environment_type: workshop?.environment_type || '',
      is_private: workshop?.is_private !== undefined ? workshop.is_private : true
    }
  });

  const { data: clubs } = useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clubs')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const onSubmit = async (data: WorkshopFormData) => {
    setIsLoading(true);
    try {
      const workshopData = {
        name: data.name,
        description: data.description || null,
        club_id: data.club_id || null,
        environment_type: data.environment_type || null,
        is_private: data.is_private,
        creator_id: 'placeholder-user-id' // TODO: Get from auth context
      };

      if (workshop) {
        // Update existing workshop
        const { error } = await supabase
          .from('workshops')
          .update(workshopData)
          .eq('id', workshop.id);

        if (error) throw error;
        toast.success('Atelier modifié avec succès');
      } else {
        // Create new workshop
        const { error } = await supabase
          .from('workshops')
          .insert(workshopData);

        if (error) throw error;
        toast.success('Atelier créé avec succès');
      }

      onSuccess();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error('Error saving workshop:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {workshop ? 'Modifier l\'atelier' : 'Créer un atelier'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'atelier *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: Atelier React" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Décrivez l'objectif de l'atelier..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="club_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Club associé</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un club" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Aucun club</SelectItem>
                        {clubs?.map((club) => (
                          <SelectItem key={club.id} value={club.id}>
                            {club.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="environment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d'environnement</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="nodejs">Node.js</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="react">React</SelectItem>
                        <SelectItem value="vue">Vue.js</SelectItem>
                        <SelectItem value="angular">Angular</SelectItem>
                        <SelectItem value="docker">Docker</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_private"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Switch 
                      checked={field.value} 
                      onCheckedChange={field.onChange} 
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Atelier privé</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Sauvegarde...' : (workshop ? 'Modifier' : 'Créer')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
