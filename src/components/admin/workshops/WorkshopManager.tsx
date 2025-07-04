
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
import { WorkshopForm } from './WorkshopForm';
import { WorkshopMemberManager } from './WorkshopMemberManager';
import { StartSessionDialog } from './StartSessionDialog';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Users,
  Play
} from 'lucide-react';
import { toast } from 'sonner';

export function WorkshopManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<any>(null);
  const [showMemberManager, setShowMemberManager] = useState(false);
  const [showStartSession, setShowStartSession] = useState(false);

  const { data: workshops, isLoading, refetch } = useQuery({
    queryKey: ['admin-workshops', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('workshops')
        .select(`
          *,
          clubs(name),
          workshop_members(id),
          workshop_sessions(id, status)
        `);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
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
        .from('workshops')
        .delete()
        .eq('id', workshopId);

      if (error) throw error;

      toast.success('Atelier supprimé avec succès');
      refetch();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Error deleting workshop:', error);
    }
  };

  const getActiveSessions = (sessions: any[]) => {
    return sessions?.filter(s => s.status === 'running').length || 0;
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

  // Si on affiche le gestionnaire de membres
  if (showMemberManager && selectedWorkshop) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => {
            setShowMemberManager(false);
            setSelectedWorkshop(null);
          }}
        >
          ← Retour aux ateliers
        </Button>
        <WorkshopMemberManager 
          workshopId={selectedWorkshop.id}
          workshopName={selectedWorkshop.name}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestion des Ateliers</CardTitle>
            <Button onClick={() => setShowForm(true)}>
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
                <TableHead>Atelier</TableHead>
                <TableHead>Club</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workshops?.map((workshop) => (
                <TableRow key={workshop.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{workshop.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {workshop.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {workshop.clubs?.name || 'Aucun club'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{workshop.workshop_members?.length || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{workshop.workshop_sessions?.length || 0} total</span>
                      {getActiveSessions(workshop.workshop_sessions) > 0 && (
                        <Badge variant="default" className="text-xs">
                          <Play className="h-3 w-3 mr-1" />
                          {getActiveSessions(workshop.workshop_sessions)} actives
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={workshop.is_private ? 'secondary' : 'default'}>
                      {workshop.is_private ? 'Privé' : 'Public'}
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
                        <DropdownMenuItem onClick={() => {
                          setSelectedWorkshop(workshop);
                          setShowStartSession(true);
                        }}>
                          <Play className="h-4 w-4 mr-2" />
                          Démarrer session
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedWorkshop(workshop);
                          setShowForm(true);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedWorkshop(workshop);
                          setShowMemberManager(true);
                        }}>
                          <Users className="h-4 w-4 mr-2" />
                          Gérer les membres
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(workshop.id)}
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

      {showForm && (
        <WorkshopForm 
          workshop={selectedWorkshop}
          onClose={() => {
            setShowForm(false);
            setSelectedWorkshop(null);
          }}
          onSuccess={() => {
            refetch();
            setShowForm(false);
            setSelectedWorkshop(null);
          }}
        />
      )}

      {showStartSession && selectedWorkshop && (
        <StartSessionDialog
          workshop={selectedWorkshop}
          onClose={() => {
            setShowStartSession(false);
            setSelectedWorkshop(null);
          }}
          onSuccess={() => {
            refetch();
            setShowStartSession(false);
            setSelectedWorkshop(null);
          }}
        />
      )}
    </div>
  );
}
