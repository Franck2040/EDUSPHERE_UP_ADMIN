
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from './FileUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateBookDialog({ open, onOpenChange, onSuccess }: CreateBookDialogProps) {
  const [formData, setFormData] = useState({
    titre: '',
    auteur: '',
    description: '',
    domaine: '',
    sous_domaine: '',
    niveau: '',
    particularite: ''
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!formData.titre || (!documentFile && !documentUrl)) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('livres')
        .insert({
          titre: formData.titre,
          auteur: formData.auteur,
          description: formData.description,
          domaine: formData.domaine,
          sous_domaine: formData.sous_domaine,
          niveau: formData.niveau,
          particularite: formData.particularite,
          document_url: documentUrl,
          couverture_url: coverUrl || null,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast.success('Livre créé avec succès');
      
      // Reset form
      setFormData({
        titre: '',
        auteur: '',
        description: '',
        domaine: '',
        sous_domaine: '',
        niveau: '',
        particularite: ''
      });
      setDocumentFile(null);
      setDocumentUrl('');
      setCoverFile(null);
      setCoverUrl('');
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating book:', error);
      toast.error('Erreur lors de la création du livre');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouveau livre</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titre">Titre *</Label>
              <Input
                id="titre"
                value={formData.titre}
                onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="auteur">Auteur</Label>
              <Input
                id="auteur"
                value={formData.auteur}
                onChange={(e) => setFormData(prev => ({ ...prev, auteur: e.target.value }))}
              />
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

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="domaine">Domaine *</Label>
              <Input
                id="domaine"
                value={formData.domaine}
                onChange={(e) => setFormData(prev => ({ ...prev, domaine: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sous_domaine">Sous-domaine</Label>
              <Input
                id="sous_domaine"
                value={formData.sous_domaine}
                onChange={(e) => setFormData(prev => ({ ...prev, sous_domaine: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="niveau">Niveau</Label>
              <Select value={formData.niveau} onValueChange={(value) => setFormData(prev => ({ ...prev, niveau: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debutant">Débutant</SelectItem>
                  <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                  <SelectItem value="avance">Avancé</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="particularite">Particularité</Label>
            <Input
              id="particularite"
              value={formData.particularite}
              onChange={(e) => setFormData(prev => ({ ...prev, particularite: e.target.value }))}
              placeholder="Ex: Livre de référence, Guide pratique..."
            />
          </div>

          <div className="space-y-2">
            <Label>Document principal *</Label>
            <FileUpload
              accept=".pdf,.doc,.docx"
              bucket="book-documents"
              onFileSelect={handleDocumentUpload}
              selectedFile={documentFile}
              placeholder="Sélectionner le document principal"
            />
          </div>

          <div className="space-y-2">
            <Label>Image de couverture</Label>
            <FileUpload
              accept="image/*"
              bucket="book-covers"
              onFileSelect={handleCoverUpload}
              selectedFile={coverFile}
              placeholder="Sélectionner une image de couverture"
            />
            <p className="text-xs text-muted-foreground">
              Si aucune image n'est fournie, la première page du document sera utilisée comme couverture
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : 'Créer le livre'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
