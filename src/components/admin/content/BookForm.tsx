
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
import { Switch } from '@/components/ui/switch';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { FileUpload } from './FileUpload';
import { toast } from 'sonner';

const bookSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  author: z.string().optional(),
  domain: z.string().min(1, 'Le domaine est requis'),
  sub_domain: z.string().optional(),
  description: z.string().optional(),
  is_popular: z.boolean().default(false),
  is_new: z.boolean().default(true)
});

type BookFormData = z.infer<typeof bookSchema>;

interface BookFormProps {
  book?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookForm({ book, onClose, onSuccess }: BookFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPdfFiles, setSelectedPdfFiles] = useState<File[]>([]);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);

  const form = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: book?.title || '',
      author: book?.author || '',
      domain: book?.domain || '',
      sub_domain: book?.sub_domain || '',
      description: book?.description || '',
      is_popular: book?.is_popular || false,
      is_new: book?.is_new !== undefined ? book.is_new : true
    }
  });

  const uploadFile = async (file: File, bucketName: string, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    console.log(`Uploading to bucket: ${bucketName}, path: ${filePath}`);

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    console.log('File uploaded successfully, URL:', data.publicUrl);
    return data.publicUrl;
  };

  const extractPdfThumbnail = async (pdfFile: File): Promise<string | null> => {
    try {
      // Simuler l'extraction de la première page du PDF
      // En production, il faudrait utiliser une bibliothèque comme PDF.js
      console.log('Extracting thumbnail from PDF:', pdfFile.name);
      
      // Pour l'instant, on retourne null et on utilisera l'image uploadée manuellement
      // TODO: Implémenter l'extraction réelle avec PDF.js
      return null;
    } catch (error) {
      console.error('Error extracting PDF thumbnail:', error);
      return null;
    }
  };

  const onSubmit = async (data: BookFormData) => {
    if (!book && selectedPdfFiles.length === 0) {
      toast.error('Veuillez sélectionner au moins un fichier PDF');
      return;
    }

    setIsLoading(true);
    try {
      let file_url = book?.file_url;
      let cover_url = book?.cover_url;

      // Upload PDF files if selected
      if (selectedPdfFiles.length > 0) {
        const pdfFile = selectedPdfFiles[0]; // Prendre le premier PDF
        file_url = await uploadFile(pdfFile, 'books', 'pdfs');

        // Essayer d'extraire la première page comme couverture si aucune image n'est fournie
        if (selectedImageFiles.length === 0) {
          const thumbnail = await extractPdfThumbnail(pdfFile);
          if (thumbnail) {
            cover_url = thumbnail;
          }
        }
      }

      // Upload cover image if selected
      if (selectedImageFiles.length > 0) {
        const imageFile = selectedImageFiles[0]; // Prendre la première image
        cover_url = await uploadFile(imageFile, 'book-covers', 'images');
      }

      const bookData = {
        title: data.title,
        author: data.author || null,
        domain: data.domain,
        sub_domain: data.sub_domain || null,
        description: data.description || null,
        is_popular: data.is_popular,
        is_new: data.is_new,
        file_url: file_url || '',
        cover_url: cover_url || null
      };

      console.log('Saving book data:', bookData);

      if (book) {
        // Update existing book
        const { error } = await supabase
          .from('books')
          .update(bookData)
          .eq('id', book.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        toast.success('Livre modifié avec succès');
      } else {
        // Create new book
        const { error } = await supabase
          .from('books')
          .insert(bookData);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        toast.success('Livre ajouté avec succès');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving book:', error);
      toast.error('Erreur lors de la sauvegarde: ' + (error as any)?.message || 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdfFiles = (fileList: FileList) => {
    const files = Array.from(fileList).filter(file => file.type === 'application/pdf');
    setSelectedPdfFiles(files);
  };

  const handleImageFiles = (fileList: FileList) => {
    const files = Array.from(fileList).filter(file => file.type.startsWith('image/'));
    setSelectedImageFiles(files);
  };

  const removePdfFile = (index: number) => {
    setSelectedPdfFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeImageFile = (index: number) => {
    setSelectedImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {book ? 'Modifier le livre' : 'Ajouter un livre'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Auteur</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domaine *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ex: Informatique" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sub_domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sous-domaine</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ex: Intelligence Artificielle" />
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
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File uploads */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Fichier PDF {!book && '*'}
                </label>
                <FileUpload
                  accept=".pdf,application/pdf"
                  onFileSelect={handlePdfFiles}
                  selectedFiles={selectedPdfFiles}
                  onRemoveFile={removePdfFile}
                  placeholder="Sélectionner un fichier PDF"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Image de couverture
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Si aucune image n'est fournie, la première page du PDF sera utilisée automatiquement
                </p>
                <FileUpload
                  accept="image/*"
                  onFileSelect={handleImageFiles}
                  selectedFiles={selectedImageFiles}
                  onRemoveFile={removeImageFile}
                  placeholder="Sélectionner une image de couverture"
                />
              </div>
            </div>

            {/* Switches */}
            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="is_popular"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Marquer comme populaire</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_new"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Marquer comme nouveau</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Sauvegarde...' : (book ? 'Modifier' : 'Ajouter')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
