
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface Community {
  id: string;
  nom: string;
  communaute_clubs: Array<{
    club_id: string;
    clubs: {
      id: string;
      nom: string;
      domaine: string;
    };
  }>;
}

interface ManageCommunityClubsDialogProps {
  community: Community;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ManageCommunityClubsDialog({ 
  community, 
  open, 
  onOpenChange, 
  onSuccess 
}: ManageCommunityClubsDialogProps) {
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);

  const { data: availableClubs } = useQuery({
    queryKey: ['available-clubs-for-community', community.id],
    queryFn: async () => {
      const currentClubIds = community.communaute_clubs.map(cc => cc.club_id);
      
      const { data, error } = await supabase
        .from('clubs')
        .select('id, nom, domaine')
        .not('id', 'in', `(${currentClubIds.map(id => `'${id}'`).join(',') || "''"})`)
        .order('nom');
      
      if (error) throw error;
      return data || [];
    },
    enabled: open
  });

  const handleAddClubs = async () => {
    if (selectedClubs.length === 0) {
      toast.error('Sélectionnez au moins un club');
      return;
    }

    try {
      const links = selectedClubs.map(clubId => ({
        communaute_id: community.id,
        club_id: clubId
      }));

      const { error } = await supabase
        .from('communaute_clubs')
        .insert(links);

      if (error) throw error;

      toast.success(`${selectedClubs.length} club(s) ajouté(s) à la communauté`);
      setSelectedClubs([]);
      onSuccess();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout des clubs');
      console.error('Error adding clubs:', error);
    }
  };

  const handleRemoveClub = async (clubId: string, clubName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir retirer "${clubName}" de cette communauté ?`)) return;

    try {
      const { error } = await supabase
        .from('communaute_clubs')
        .delete()
        .eq('communaute_id', community.id)
        .eq('club_id', clubId);

      if (error) throw error;

      toast.success(`Club "${clubName}" retiré de la communauté`);
      onSuccess();
    } catch (error) {
      toast.error('Erreur lors du retrait');
      console.error('Error removing club:', error);
    }
  };

  const handleDeleteClub = async (clubId: string, clubName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement le club "${clubName}" ? Cette action est irréversible.`)) return;

    try {
      const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', clubId);

      if (error) throw error;

      // Notifier les membres du club
      const { data: members } = await supabase
        .from('club_membres')
        .select('membre_id')
        .eq('club_id', clubId);

      if (members) {
        for (const member of members) {
          await supabase.rpc('create_notification', {
            p_utilisateur_id: member.membre_id,
            p_type: 'club_deleted',
            p_message: `Le club "${clubName}" a été supprimé par l'administration.`,
            p_source: 'admin'
          });
        }
      }

      toast.success(`Club "${clubName}" supprimé définitivement`);
      onSuccess();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Error deleting club:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gérer les clubs de "{community.nom}"</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Clubs actuels */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Clubs actuels ({community.communaute_clubs.length})</h3>
            <ScrollArea className="h-48 w-full border rounded-lg p-4">
              {community.communaute_clubs.length > 0 ? (
                <div className="space-y-2">
                  {community.communaute_clubs.map((cc) => (
                    <div key={cc.club_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{cc.clubs.nom}</span>
                        <Badge variant="outline" className="ml-2">
                          {cc.clubs.domaine}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveClub(cc.club_id, cc.clubs.nom)}
                        >
                          <Minus className="h-4 w-4" />
                          Retirer
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteClub(cc.club_id, cc.clubs.nom)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">Aucun club dans cette communauté</p>
              )}
            </ScrollArea>
          </div>

          {/* Ajouter des clubs */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Ajouter des clubs</h3>
            <ScrollArea className="h-48 w-full border rounded-lg p-4">
              {availableClubs && availableClubs.length > 0 ? (
                <div className="space-y-2">
                  {availableClubs.map((club) => (
                    <div key={club.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={club.id}
                        checked={selectedClubs.includes(club.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedClubs(prev => [...prev, club.id]);
                          } else {
                            setSelectedClubs(prev => prev.filter(id => id !== club.id));
                          }
                        }}
                      />
                      <Label htmlFor={club.id} className="flex-1">
                        {club.nom}
                        <Badge variant="outline" className="ml-2">
                          {club.domaine}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">Aucun club disponible à ajouter</p>
              )}
            </ScrollArea>
            
            {selectedClubs.length > 0 && (
              <Button onClick={handleAddClubs} className="mt-3">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter {selectedClubs.length} club(s)
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
