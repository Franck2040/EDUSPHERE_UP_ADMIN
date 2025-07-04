
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
import { Upload, BookOpen, ArrowLeft } from 'lucide-react';

const bookSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis'),
  domaine: z.string().min(1, 'Le domaine est requis'),
  sous_domaine: z.string().optional(),
  description: z.string().optional(),
  auteur: z.string().optional(),
  niveau: z.string().optional(),
  file: z.any().refine((file) => file?.length > 0, 'Le fichier PDF est requis'),
  cover: z.any().optional()
});

type BookFormData = z.infer<typeof bookSchema>;

interface BookUploadProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function BookUpload({ onSuccess, onCancel }: BookUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      titre: '',
      domaine: '',
      sous_domaine: '',
      description: '',
      auteur: '',
      niveau: ''
    }
  });

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return data;
  };

  const onSubmit = async (data: BookFormData) => {
    setIsLoading(true);
    setUploadProgress(0);

    try {
      const file = data.file[0];
      const cover = data.cover?.[0];
      
      // Upload PDF file
      setUploadProgress(25);
      const fileId = `${Date.now()}-${file.name}`;
      await uploadFile(file, 'book-documents', fileId);
      const fileUrl = `https://ppfvnxscqdlhnpvwexjw.supabase.co/storage/v1/object/public/book-documents/${fileId}`;

      // Upload cover if provided
      let coverUrl = null;
      if (cover) {
        setUploadProgress(50);
        const coverId = `${Date.now()}-${cover.name}`;
        await uploadFile(cover, 'book-covers', coverId);
        coverUrl = `https://ppfvnxscqdlhnpvwexjw.supabase.co/storage/v1/object/public/book-covers/${coverId}`;
      }

      // Save to database using the correct table name
      setUploadProgress(75);
      const { error: dbError } = await supabase
        .from('livres')
        .insert({
          titre: data.titre,
          domaine: data.domaine,
          sous_domaine: data.sous_domaine,
          description: data.description,
          auteur: data.auteur,
          niveau: data.niveau,
          document_url: fileUrl,
          couverture_url: coverUrl,
          popularite: 0
        });

      if (dbError) throw dbError;

      setUploadProgress(100);
      toast.success('Livre ajouté avec succès!');
      onSuccess();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du livre');
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
            <BookOpen className="h-6 w-6 text-primary" />
            <CardTitle>Ajouter un Livre</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="titre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre du livre *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nom du livre" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="auteur"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Auteur</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nom de l'auteur" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="domaine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domaine *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Informatique, Mathématiques" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sous_domaine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sous-domaine</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Programmation, Algèbre" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="niveau"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Débutant, Intermédiaire, Avancé" />
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
                    <Textarea 
                      {...field} 
                      rows={3} 
                      placeholder="Description du contenu du livre..." 
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

            <FormField
              control={form.control}
              name="cover"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Image de couverture (optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="file"
                      accept="image/*"
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
                    Ajouter le livre
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
