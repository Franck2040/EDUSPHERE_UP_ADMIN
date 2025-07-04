
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '../content/FileUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    sexe: '',
    date_de_naissance: '',
    bio: '',
    role: 'user'
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handlePhotoUpload = (file: File | null, url?: string) => {
    setPhotoFile(file);
    if (url) setPhotoUrl(url);
  };

  const generateUniqueMatricule = async (): Promise<string> => {
    const prefixe = 'UNIV';
    let matricule: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
      matricule = `${prefixe}${randomPart}`;
      
      const { data } = await supabase
        .from('utilisateurs')
        .select('matricule')
        .eq('matricule', matricule)
        .single();
      
      if (!data) break;
      
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error('Impossible de générer un matricule unique');
    }

    return matricule;
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Générer un matricule unique
      const matricule = await generateUniqueMatricule();

      // Créer l'utilisateur dans auth avec un mot de passe temporaire
      const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          data: {
            first_name: formData.prenom,
            last_name: formData.nom
          }
        }
      });

      if (authError) {
        if (authError.message.includes('User already registered')) {
          setErrors({ email: 'Cet email est déjà utilisé' });
          return;
        }
        throw authError;
      }

      if (authData.user) {
        // Créer le profil utilisateur
        const { error: profileError } = await supabase
          .from('utilisateurs')
          .insert({
            id: authData.user.id,
            prenom: formData.prenom,
            nom: formData.nom,
            email: formData.email,
            telephone: formData.telephone,
            adresse: formData.adresse,
            sexe: formData.sexe,
            date_de_naissance: formData.date_de_naissance || null,
            bio: formData.bio,
            photo_profil_url: photoUrl || null,
            matricule: matricule
          });

        if (profileError) throw profileError;

        // Créer le profil dans la table profiles avec le rôle
        const { error: roleError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            first_name: formData.prenom,
            last_name: formData.nom,
            email: formData.email,
            role: formData.role,
            matricule: matricule
          });

        if (roleError) throw roleError;
      }

      toast.success('Utilisateur créé avec succès');
      
      // Reset form
      setFormData({
        prenom: '',
        nom: '',
        email: '',
        telephone: '',
        adresse: '',
        sexe: '',
        date_de_naissance: '',
        bio: '',
        role: 'user'
      });
      setPhotoFile(null);
      setPhotoUrl('');
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.message.includes('duplicate key value violates unique constraint')) {
        if (error.message.includes('email')) {
          setErrors({ email: 'Cet email est déjà utilisé' });
        } else {
          toast.error('Une erreur de duplication s\'est produite. Veuillez réessayer.');
        }
      } else {
        toast.error('Erreur lors de la création de l\'utilisateur: ' + (error.message || 'Erreur inconnue'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
                className={errors.prenom ? 'border-red-500' : ''}
                required
              />
              {errors.prenom && <p className="text-sm text-red-500">{errors.prenom}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                className={errors.nom ? 'border-red-500' : ''}
                required
              />
              {errors.nom && <p className="text-sm text-red-500">{errors.nom}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={errors.email ? 'border-red-500' : ''}
              required
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Utilisateur</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
                <SelectItem value="super_admin">Super Administrateur</SelectItem>
                <SelectItem value="moderator">Modérateur</SelectItem>
                <SelectItem value="content_admin">Admin Contenu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sexe">Sexe</Label>
              <Select value={formData.sexe} onValueChange={(value) => setFormData(prev => ({ ...prev, sexe: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Homme">Homme</SelectItem>
                  <SelectItem value="Femme">Femme</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_de_naissance">Date de naissance</Label>
            <Input
              id="date_de_naissance"
              type="date"
              value={formData.date_de_naissance}
              onChange={(e) => setFormData(prev => ({ ...prev, date_de_naissance: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Input
              id="adresse"
              value={formData.adresse}
              onChange={(e) => setFormData(prev => ({ ...prev, adresse: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biographie</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Photo de profil</Label>
            <FileUpload
              accept="image/*"
              bucket="avatars"
              onFileSelect={handlePhotoUpload}
              selectedFile={photoFile}
              placeholder="Sélectionner une photo de profil"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : 'Créer l\'utilisateur'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
