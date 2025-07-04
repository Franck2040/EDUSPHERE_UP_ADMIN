
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUpload } from '../content/FileUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateCommunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateCommunityDialog({ open, onOpenChange, onSuccess }: CreateCommunityDialogProps) {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    createNewClub: true,
    clubName: '',
    clubDescription: '',
    clubDomain: '',
    selectedClubs: [] as string[]
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [clubAvatarFile, setClubAvatarFile] = useState<File | null>(null);
  const [clubAvatarUrl, setClubAvatarUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: availableClubs } = useQuery({
    queryKey: ['available-clubs', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('clubs')
        .select('id, nom, domaine, avatar_url')
        .not('id', 'in', `(${
          (await supabase.from('communaute_clubs').select('club_id')).data?.map(cc => `'${cc.club_id}'`).join(',') || "''"
        })`)
        .order('nom');
      
      if (searchTerm) {
        query = query.ilike('nom', `%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: open && !formData.createNewClub
  });

  const domains = [
    'informatique',
    'sciences',
    'commerce',
    'medecine',
    'ingenierie',
    'arts',
    'langues',
    'sport'
  ];

  const handleCoverUpload = (file: File | null, url?: string) => {
    setCoverFile(file);
    if (url) setCoverUrl(url);
  };

  const handleClubAvatarUpload = (file: File | null, url?: string) => {
    setClubAvatarFile(file);
    if (url) setClubAvatarUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom.trim()) {
      toast.error('Le nom de la communauté est requis');
      return;
    }

    if (formData.createNewClub && (!formData.clubName.trim() || !formData.clubDomain)) {
      toast.error('Les informations du club sont requises');
      return;
    }

    if (!formData.createNewClub && formData.selectedClubs.length === 0) {
      toast.error('Sélectionnez au moins un club existant');
      return;
    }

    try {
      // Créer la communauté
      const { data: community, error: communityError } = await supabase
        .from('communautes')
        .insert({
          nom: formData.nom,
          description: formData.description,
          proprietaire_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (communityError) throw communityError;

      if (formData.createNewClub) {
        // Créer un nouveau club
        const { data: club, error: clubError } = await supabase
          .from('clubs')
          .insert({
            nom: formData.clubName,
            description: formData.clubDescription,
            domaine: formData.clubDomain,
            avatar_url: clubAvatarUrl || null,
            proprietaire_id: (await supabase.auth.getUser()).data.user?.id
          })
          .select()
          .single();

        if (clubError) throw clubError;

        // Lier le club à la communauté
        const { error: linkError } = await supabase
          .from('communaute_clubs')
          .insert({
            communaute_id: community.id,
            club_id: club.id
          });

        if (linkError) throw linkError;
      } else {
        // Lier les clubs existants à la communauté
        const links = formData.selectedClubs.map(clubId => ({
          communaute_id: community.id,
          club_id: clubId
        }));

        const { error: linkError } = await supabase
          .from('communaute_clubs')
          .insert(links);

        if (linkError) throw linkError;
      }

      toast.success('Communauté créée avec succès');
      setFormData({
        nom: '',
        description: '',
        createNewClub: true,
        clubName: '',
        clubDescription: '',
        clubDomain: '',
        selectedClubs: []
      });
      setCoverFile(null);
      setCoverUrl('');
      setClubAvatarFile(null);
      setClubAvatarUrl('');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Erreur lors de la création');
      console.error('Error creating community:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une communauté</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom de la communauté</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              placeholder="Nom de la communauté"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description de la communauté"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Image de couverture de la communauté</Label>
            <FileUpload
              accept="image/*"
              bucket="avatars"
              onFileSelect={handleCoverUpload}
              selectedFile={coverFile}
              placeholder="Sélectionner une image de couverture"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="createNewClub"
                checked={formData.createNewClub}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, createNewClub: checked as boolean }))}
              />
              <Label htmlFor="createNewClub">Créer un nouveau club</Label>
            </div>

            {formData.createNewClub ? (
              <div className="space-y-3 pl-6 border-l-2 border-muted">
                <div className="space-y-2">
                  <Label htmlFor="clubName">Nom du club</Label>
                  <Input
                    id="clubName"
                    value={formData.clubName}
                    onChange={(e) => setFormData(prev => ({ ...prev, clubName: e.target.value }))}
                    placeholder="Nom du premier club"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clubDescription">Description du club</Label>
                  <Textarea
                    id="clubDescription"
                    value={formData.clubDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, clubDescription: e.target.value }))}
                    placeholder="Description du club"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clubDomain">Domaine du club</Label>
                  <Select value={formData.clubDomain} onValueChange={(value) => setFormData(prev => ({ ...prev, clubDomain: value }))}>
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
                  <Label>Image de couverture du club</Label>
                  <FileUpload
                    accept="image/*"
                    bucket="avatars"
                    onFileSelect={handleClubAvatarUpload}
                    selectedFile={clubAvatarFile}
                    placeholder="Sélectionner une image de couverture pour le club"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 pl-6 border-l-2 border-muted">
                <Label>Sélectionner des clubs existants</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Rechercher des clubs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {availableClubs?.map((club) => (
                    <div key={club.id} className="flex items-center space-x-2 p-2 border rounded">
                      <Checkbox
                        id={club.id}
                        checked={formData.selectedClubs.includes(club.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({ 
                              ...prev, 
                              selectedClubs: [...prev.selectedClubs, club.id] 
                            }));
                          } else {
                            setFormData(prev => ({ 
                              ...prev, 
                              selectedClubs: prev.selectedClubs.filter(id => id !== club.id) 
                            }));
                          }
                        }}
                      />
                      <div className="flex items-center gap-2">
                        {club.avatar_url && (
                          <img src={club.avatar_url} alt={club.nom} className="w-8 h-8 rounded-full object-cover" />
                        )}
                        <Label htmlFor={club.id} className="text-sm cursor-pointer">
                          {club.nom} ({club.domaine})
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Créer la communauté
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
