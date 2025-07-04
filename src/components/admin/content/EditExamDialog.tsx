
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileUpload } from './FileUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Exam {
  id: string;
  matiere: string;
  ecole: string;
  niveau: string;
  annee: number;
  description: string;
  tags: string;
  difficulte: string;
  contenu_url: string;
}

interface EditExamDialogProps {
  exam: Exam;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditExamDialog({ exam, open, onOpenChange, onSuccess }: EditExamDialogProps) {
  const [formData, setFormData] = useState({
    matiere: exam.matiere,
    ecole: exam.ecole,
    niveau: exam.niveau,
    annee: exam.annee,
    description: exam.description || '',
    tags: exam.tags || '',
    difficulte: exam.difficulte || ''
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState(exam.contenu_url);

  const handleDocumentUpload = (file: File | null, url?: string) => {
    setDocumentFile(file);
    if (url) setDocumentUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.matiere || !formData.ecole || !formData.niveau || !documentUrl) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const { error } = await supabase
        .from('examens')
        .update({
          matiere: formData.matiere,
          ecole: formData.ecole,
          niveau: formData.niveau,
          annee: formData.annee,
          description: formData.description,
          tags: formData.tags,
          difficulte: formData.difficulte,
          contenu_url: documentUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', exam.id);

      if (error) throw error;

      toast.success('Épreuve mise à jour avec succès');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating exam:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'épreuve</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="matiere">Matière *</Label>
              <Input
                id="matiere"
                value={formData.matiere}
                onChange={(e) => setFormData(prev => ({ ...prev, matiere: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ecole">École *</Label>
              <Input
                id="ecole"
                value={formData.ecole}
                onChange={(e) => setFormData(prev => ({ ...prev, ecole: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="niveau">Niveau *</Label>
              <Input
                id="niveau"
                value={formData.niveau}
                onChange={(e) => setFormData(prev => ({ ...prev, niveau: e.target.value }))}
                placeholder="Ex: L1, L2, Master..."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="annee">Année</Label>
              <Input
                id="annee"
                type="number"
                value={formData.annee}
                onChange={(e) => setFormData(prev => ({ ...prev, annee: parseInt(e.target.value) }))}
                min="2000"
                max={new Date().getFullYear() + 1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulte">Difficulté</Label>
              <Select value={formData.difficulte} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulte: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facile">Facile</SelectItem>
                  <SelectItem value="moyen">Moyen</SelectItem>
                  <SelectItem value="difficile">Difficile</SelectItem>
                  <SelectItem value="tres_difficile">Très difficile</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="Ex: concours, partiel, rattrapage..."
            />
          </div>

          <div className="space-y-2">
            <Label>Document de l'épreuve *</Label>
            <FileUpload
              accept=".pdf,.doc,.docx"
              bucket="exam-documents"
              onFileSelect={handleDocumentUpload}
              selectedFile={documentFile}
              placeholder="Choisir un nouveau document ou garder l'actuel"
            />
            {exam.contenu_url && !documentFile && (
              <div className="text-sm text-muted-foreground">
                Document actuel : {exam.contenu_url}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Mettre à jour
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
