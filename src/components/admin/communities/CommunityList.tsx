
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Search, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { CommunityDetailsDialog } from './CommunityDetailsDialog';

interface Community {
  id: string;
  nom: string;
  description: string;
  statut: string;
  proprietaire_id: string;
  created_at: string;
  updated_at: string;
}

interface CommunityListProps {
  onRefresh: () => void;
}

export function CommunityList({ onRefresh }: CommunityListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { data: communities, isLoading, refetch } = useQuery({
    queryKey: ['admin-communities', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('communautes')
        .select('*');

      if (searchTerm) {
        query = query.ilike('nom', `%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleDelete = async (communityId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette communauté ?')) return;

    try {
      const { error } = await supabase
        .from('communautes')
        .delete()
        .eq('id', communityId);

      if (error) throw error;

      toast.success('Communauté supprimée avec succès');
      refetch();
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Error deleting community:', error);
    }
  };

  const handleViewDetails = (community: Community) => {
    setSelectedCommunity(community);
    setShowDetailsDialog(true);
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Liste des communautés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des communautés..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {communities?.map((community) => (
                <TableRow key={community.id}>
                  <TableCell className="font-medium">{community.nom}</TableCell>
                  <TableCell className="max-w-xs truncate">{community.description}</TableCell>
                  <TableCell>
                    <Badge variant={community.statut === 'active' ? 'default' : 'secondary'}>
                      {community.statut}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(community.created_at).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(community)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
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

      {selectedCommunity && (
        <CommunityDetailsDialog
          community={selectedCommunity}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
        />
      )}
    </>
  );
}
