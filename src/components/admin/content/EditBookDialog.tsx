
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

interface Book {
  id: string;
  titre: string;
  auteur: string;
  domaine: string;
  sous_domaine: string;
  niveau: string;
  description: string;
  document_url: string;
  couverture_url: string;
  particularite: string;
}

interface EditBookDialogProps {
  book: Book;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditBookDialog({ book, open, onOpenChange, onSuccess }: EditBookDialogProps) {
  const [formData, setFormData] = useState({
    titre: book.titre,
    auteur: book.auteur || '',
    domaine: book.domaine,
    sous_domaine: book.sous_domaine || '',
    niveau: book.niveau || '',
    description: book.description || '',
    particularite: book.particularite || ''
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState(book.document_url);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState(book.couverture_url || '');

  const domains = [
    'informatique',
    'mathematiques',
    'physique',
    'chimie',
    'biologie',
    'economie',
    'gestion',
    'droit',
    'medecine',
    'ingenierie',
    'langues',
    'litterature',
    'histoire',
    'geographie',
    'philosophie',
    'arts'
  ];

  const levels = [
    'primaire',
    'college',
    'lycee',
    'licence',
    'master',
    'doctorat',
    'professionnel'
  ];

  const handleDocumentUpload = (file: File | null, url?: string) => {
    setDocumentFile(file);
    if (url) setDocumentUrl(url);
  };

  const handleCoverUpload = (file: File | null, url?: string) => {
    setCoverFile(file);
    if (url) setCoverUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titre.trim() || !formData.domaine || !documentUrl.trim()) {
      toast.error('Le titre, domaine et document sont requis');
      return;
    }

    try {
      const { error } = await supabase
        .from('livres')
        .update({
          titre: formData.titre,
          auteur: formData.auteur,
          domaine: formData.domaine,
          sous_domaine: formData.sous_domaine,
          niveau: formData.niveau,
          description: formData.description,
          document_url: documentUrl,
          couverture_url: coverUrl,
          particularite: formData.particularite,
          updated_at: new Date().toISOString()
        })
        .eq('id', book.id);

      if (error) throw error;

      toast.success('Livre mis à jour avec succès');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
      console.error('Error updating book:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le livre</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titre">Titre</Label>
              <Input
                id="titre"
                value={formData.titre}
                onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
                placeholder="Titre du livre"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auteur">Auteur</Label>
              <Input
                id="auteur"
                value={formData.auteur}
                onChange={(e) => setFormData(prev => ({ ...prev, auteur: e.target.value }))}
                placeholder="Auteur du livre"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="domaine">Domaine</Label>
              <Select value={formData.domaine} onValueChange={(value) => setFormData(prev => ({ ...prev, domaine: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un domaine" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {domain.charAt(0).toUpperCase() + domain.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sous_domaine">Sous-domaine</Label>
              <Input
                id="sous_domaine"
                value={formData.sous_domaine}
                onChange={(e) => setFormData(prev => ({ ...prev, sous_domaine: e.target.value }))}
                placeholder="Sous-domaine (optionnel)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="niveau">Niveau</Label>
            <Select value={formData.niveau} onValueChange={(value) => setFormData(prev => ({ ...prev, niveau: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un niveau" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description du livre"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="particularite">Particularité</Label>
            <Input
              id="particularite"
              value={formData.particularite}
              onChange={(e) => setFormData(prev => ({ ...prev, particularite: e.target.value }))}
              placeholder="Particularité du livre (optionnel)"
            />
          </div>

          <div className="space-y-2">
            <Label>Document principal *</Label>
            <FileUpload
              accept=".pdf,.doc,.docx"
              bucket="book-documents"
              onFileSelect={handleDocumentUpload}
              selectedFile={documentFile}
              placeholder="Choisir un nouveau document ou garder l'actuel"
            />
            {book.document_url && !documentFile && (
              <div className="text-sm text-muted-foreground">
                Document actuel : {book.document_url}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Image de couverture</Label>
            <FileUpload
              accept="image/*"
              bucket="book-covers"
              onFileSelect={handleCoverUpload}
              selectedFile={coverFile}
              placeholder="Choisir une nouvelle image de couverture"
            />
            {book.couverture_url && !coverFile && (
              <div className="text-sm text-muted-foreground">
                Couverture actuelle : {book.couverture_url}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Si aucune image n'est fournie, la première page du document sera utilisée comme couverture
            </p>
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
