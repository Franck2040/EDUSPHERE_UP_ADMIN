
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
import { FileUpload } from './FileUpload';
import { toast } from 'sonner';

const examSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  subject: z.string().min(1, 'La matière est requise'),
  school_id: z.string().optional(),
  academic_level_id: z.string().optional(),
  year: z.number().optional(),
  description: z.string().optional(),
  is_new: z.boolean().default(true)
});

type ExamFormData = z.infer<typeof examSchema>;

interface ExamFormProps {
  exam?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExamForm({ exam, onClose, onSuccess }: ExamFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPdfFiles, setSelectedPdfFiles] = useState<File[]>([]);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);

  const form = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: exam?.title || '',
      subject: exam?.subject || '',
      school_id: exam?.school_id || '',
      academic_level_id: exam?.academic_level_id || '',
      year: exam?.year || new Date().getFullYear(),
      description: exam?.description || '',
      is_new: exam?.is_new !== undefined ? exam.is_new : true
    }
  });

  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: academicLevels } = useQuery({
    queryKey: ['academic-levels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_levels')
        .select('id, name, code')
        .order('name');
      
      if (error) throw error;
      return data || [];
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

  const onSubmit = async (data: ExamFormData) => {
    if (!exam && selectedPdfFiles.length === 0) {
      toast.error('Veuillez sélectionner au moins un fichier PDF');
      return;
    }

    setIsLoading(true);
    try {
      let file_url = exam?.file_url;
      let cover_url = exam?.cover_url;

      // Upload PDF files if selected
      if (selectedPdfFiles.length > 0) {
        const pdfFile = selectedPdfFiles[0]; // Prendre le premier PDF
        file_url = await uploadFile(pdfFile, 'exams', 'pdfs');

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
        cover_url = await uploadFile(imageFile, 'exam-covers', 'images');
      }

      const examData = {
        title: data.title,
        subject: data.subject,
        school_id: data.school_id || null,
        academic_level_id: data.academic_level_id || null,
        year: data.year || null,
        description: data.description || null,
        is_new: data.is_new,
        file_url: file_url || '',
        cover_url: cover_url || null
      };

      console.log('Saving exam data:', examData);

      if (exam) {
        // Update existing exam
        const { error } = await supabase
          .from('exams')
          .update(examData)
          .eq('id', exam.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        toast.success('Examen modifié avec succès');
      } else {
        // Create new exam
        const { error } = await supabase
          .from('exams')
          .insert(examData);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        toast.success('Examen ajouté avec succès');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving exam:', error);
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
            {exam ? 'Modifier l\'examen' : 'Ajouter un examen'}
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
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matière *</FormLabel>
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
                name="school_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>École</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une école" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {schools?.map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name}
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
                name="academic_level_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau académique</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un niveau" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {academicLevels?.map((level) => (
                          <SelectItem key={level.id} value={level.id}>
                            {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Année</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                    />
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
                  Fichier PDF {!exam && '*'}
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

            {/* Switch */}
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

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Sauvegarde...' : (exam ? 'Modifier' : 'Ajouter')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
