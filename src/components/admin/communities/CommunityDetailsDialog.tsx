
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Community {
  id: string;
  nom: string;
  description: string;
  statut: string;
  proprietaire_id: string;
  created_at: string;
  updated_at: string;
}

interface CommunityDetailsDialogProps {
  community: Community;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommunityDetailsDialog({ community, open, onOpenChange }: CommunityDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails de la communauté</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {community.nom}
                <Badge variant={community.statut === 'active' ? 'default' : 'secondary'}>
                  {community.statut}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{community.description}</p>
              <div className="mt-4 space-y-2 text-sm">
                <div>
                  <strong>Créée le:</strong> {new Date(community.created_at).toLocaleDateString('fr-FR')}
                </div>
                <div>
                  <strong>Dernière mise à jour:</strong> {new Date(community.updated_at).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
