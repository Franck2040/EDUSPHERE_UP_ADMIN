
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { CreateCommunityDialog } from './CreateCommunityDialog';
import { EditCommunityDialog } from './EditCommunityDialog';
import { SuspendCommunityDialog } from './SuspendCommunityDialog';
import { ManageCommunityClubsDialog } from './ManageCommunityClubsDialog';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Ban,
  PlayCircle,
  Users,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface Community {
  id: string;
  nom: string;
  description: string;
  proprietaire_id: string;
  created_at: string;
  statut: string;
  communaute_clubs: Array<{
    club_id: string;
    clubs: {
      id: string;
      nom: string;
      description: string;
      domaine: string;
      created_at: string;
      proprietaire_id: string;
    };
  }>;
}

interface CommunityManagementProps {
  communities: Community[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function CommunityManagement({ communities, isLoading, onRefresh }: CommunityManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [manageClubsDialogOpen, setManageClubsDialogOpen] = useState(false);

  const filteredCommunities = communities.filter(community =>
    community.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (communityId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette communauté ?')) return;

    try {
      const { error } = await supabase
        .from('communautes')
        .delete()
        .eq('id', communityId);

      if (error) throw error;

      toast.success('Communauté supprimée avec succès');
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Error deleting community:', error);
    }
  };

  const handleActivate = async (communityId: string) => {
    try {
      const { error } = await supabase
        .from('communautes')
        .update({ statut: 'active' })
        .eq('id', communityId);

      if (error) throw error;

      toast.success('Communauté activée avec succès');
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors de l\'activation');
      console.error('Error activating community:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestion des Communautés</CardTitle>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une communauté
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Communauté</TableHead>
                <TableHead>Clubs</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommunities.map((community) => (
                <TableRow key={community.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{community.nom}</div>
                      <div className="text-sm text-muted-foreground">
                        {community.description || 'Aucune description'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {community.communaute_clubs?.length || 0} clubs
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={community.statut === 'active' ? 'default' : 'secondary'}>
                      {community.statut === 'active' ? 'Active' : 
                       community.statut === 'suspended' ? 'Suspendue' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(community.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedCommunity(community);
                          setEditDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedCommunity(community);
                          setManageClubsDialogOpen(true);
                        }}>
                          <Settings className="h-4 w-4 mr-2" />
                          Gérer les clubs
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedCommunity(community);
                          setSuspendDialogOpen(true);
                        }}>
                          <Ban className="h-4 w-4 mr-2" />
                          Suspendre
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleActivate(community.id)}>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Activer
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(community.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateCommunityDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={onRefresh}
      />

      {selectedCommunity && (
        <>
          <EditCommunityDialog
            community={selectedCommunity}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={onRefresh}
          />
          <SuspendCommunityDialog
            community={selectedCommunity}
            open={suspendDialogOpen}
            onOpenChange={setSuspendDialogOpen}
            onSuccess={onRefresh}
          />
          <ManageCommunityClubsDialog
            community={selectedCommunity}
            open={manageClubsDialogOpen}
            onOpenChange={setManageClubsDialogOpen}
            onSuccess={onRefresh}
          />
        </>
      )}
    </div>
  );
}
