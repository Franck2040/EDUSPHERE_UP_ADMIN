
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
import { CreateWorkshopDialog } from './CreateWorkshopDialog';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Users,
  Settings,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface WorkshopManagementProps {
  onRefresh: () => void;
}

export function WorkshopManagement({ onRefresh }: WorkshopManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: workshops, isLoading, refetch } = useQuery({
    queryKey: ['admin-workshops', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('ateliers_travail')
        .select(`
          *,
          club:clubs(nom, domaine),
          atelier_participants(count)
        `);

      if (searchTerm) {
        query = query.ilike('nom', `%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleDelete = async (workshopId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet atelier ?')) return;

    try {
      const { error } = await supabase
        .from('ateliers_travail')
        .delete()
        .eq('id', workshopId);

      if (error) throw error;

      toast.success('Atelier supprimé avec succès');
      refetch();
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Error deleting workshop:', error);
    }
  };

  const handleChangeVisibility = async (workshopId: string, visibility: string) => {
    try {
      const { error } = await supabase
        .from('ateliers_travail')
        .update({ visibilite: visibility })
        .eq('id', workshopId);

      if (error) throw error;

      toast.success('Visibilité modifiée avec succès');
      refetch();
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors de la modification');
      console.error('Error changing visibility:', error);
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
            <CardTitle>Gestion des Ateliers</CardTitle>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un atelier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des ateliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Atelier</TableHead>
                <TableHead>Communauté</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Visibilité</TableHead>
                <TableHead>Date création</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workshops?.map((workshop) => (
                <TableRow key={workshop.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{workshop.nom}</div>
                      <div className="text-sm text-muted-foreground">
                        {workshop.description || 'Aucune description'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {workshop.club?.nom || 'Aucune communauté'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {workshop.atelier_participants?.[0]?.count || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={workshop.visibilite === 'public' ? 'default' : 'secondary'}>
                      {workshop.visibilite === 'public' ? 'Public' : 'Privé'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(workshop.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleChangeVisibility(workshop.id, workshop.visibilite === 'public' ? 'privé' : 'public')}>
                          <Settings className="h-4 w-4 mr-2" />
                          {workshop.visibilite === 'public' ? 'Rendre privé' : 'Rendre public'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(workshop.id)} className="text-red-600">
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

      <CreateWorkshopDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          refetch();
          onRefresh();
        }}
      />
    </div>
  );
}
