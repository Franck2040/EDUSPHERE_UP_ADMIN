
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Upload, FileText, ArrowLeft } from 'lucide-react';

const examSchema = z.object({
  matiere: z.string().min(1, 'La matière est requise'),
  ecole: z.string().min(1, 'L\'école est requise'),
  niveau: z.string().min(1, 'Le niveau est requis'),
  annee: z.number().min(1900, 'Année invalide').max(new Date().getFullYear(), 'Année invalide'),
  description: z.string().optional(),
  difficulte: z.string().optional(),
  tags: z.string().optional(),
  file: z.any().refine((file) => file?.length > 0, 'Le fichier PDF est requis'),
});

type ExamFormData = z.infer<typeof examSchema>;

interface ExamUploadProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ExamUpload({ onSuccess, onCancel }: ExamUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      matiere: '',
      ecole: '',
      niveau: '',
      annee: new Date().getFullYear(),
      description: '',
      difficulte: '',
      tags: ''
    }
  });

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('exam-documents')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return data;
  };

  const onSubmit = async (data: ExamFormData) => {
    setIsLoading(true);
    setUploadProgress(0);

    try {
      const file = data.file[0];
      
      // Upload PDF file
      setUploadProgress(50);
      const fileId = `${Date.now()}-${file.name}`;
      await uploadFile(file, fileId);
      const fileUrl = `https://ppfvnxscqdlhnpvwexjw.supabase.co/storage/v1/object/public/exam-documents/${fileId}`;

      // Save to database using the correct table name
      setUploadProgress(75);
      const { error: dbError } = await supabase
        .from('examens')
        .insert({
          matiere: data.matiere,
          ecole: data.ecole,
          niveau: data.niveau,
          annee: data.annee,
          description: data.description,
          difficulte: data.difficulte,
          tags: data.tags,
          contenu_url: fileUrl
        });

      if (dbError) throw dbError;

      setUploadProgress(100);
      toast.success('Examen ajouté avec succès!');
      onSuccess();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de l\'examen');
      console.error('Upload error:', error);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <CardTitle>Ajouter un Examen</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="matiere"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matière *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Mathématiques, Physique" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ecole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>École *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nom de l'établissement" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="niveau"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: L1, L2, Master" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="annee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Année *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="difficulte"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulté</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Facile, Moyen, Difficile" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: algebra, calcul, géométrie" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={3} 
                      placeholder="Description de l'examen..." 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Fichier PDF *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="file"
                      accept=".pdf"
                      onChange={(e) => onChange(e.target.files)}
                      className="cursor-pointer"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Ajouter l'examen
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
