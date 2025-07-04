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
import { CreateClubDialog } from './CreateClubDialog';
import { EditClubDialog } from './EditClubDialog';
import { ViewClubMessagesDialog } from './ViewClubMessagesDialog';
import { ClubMemberManagement } from './ClubMemberManagement';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Ban,
  Shield,
  Users,
  MessageSquare,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface Club {
  id: string;
  nom: string;
  description: string;
  domaine: string;
  type: string;
  created_at: string;
  proprietaire_id: string;
  club_membres: Array<{ count: number }>;
  messages: Array<{ count: number }>;
  ateliers_travail: Array<{ count: number }>;
}

interface ClubManagementProps {
  clubs: Club[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function ClubManagement({ clubs, isLoading, onRefresh }: ClubManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewMessagesDialogOpen, setViewMessagesDialogOpen] = useState(false);
  const [showMemberManagement, setShowMemberManagement] = useState<string | null>(null);

  const filteredClubs = clubs.filter(club =>
    club.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.domaine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSuspendClub = async (clubId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir suspendre ce club ?')) return;

    try {
      const { error } = await supabase
        .from('clubs')
        .update({ type: 'suspended' })
        .eq('id', clubId);

      if (error) throw error;

      toast.success('Club suspendu avec succès');
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors de la suspension');
      console.error('Error suspending club:', error);
    }
  };

  const handleDeleteClub = async (clubId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce club ? Cette action est irréversible.')) return;

    try {
      const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', clubId);

      if (error) throw error;

      toast.success('Club supprimé avec succès');
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Error deleting club:', error);
    }
  };

  const handleModerateContent = async (clubId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('club_id', clubId)
        .or('contenu.ilike.%merde%,contenu.ilike.%connard%,contenu.ilike.%salope%,contenu.ilike.%putain%')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data.length > 0) {
        toast.warning(`${data.length} message(s) suspect(s) détecté(s)`);
        console.log('Messages suspects:', data);
      } else {
        toast.success('Aucun contenu suspect détecté');
      }
    } catch (error) {
      toast.error('Erreur lors de la modération');
      console.error('Error moderating content:', error);
    }
  };

  if (showMemberManagement) {
    return (
      <ClubMemberManagement 
        clubId={showMemberManagement}
        onBack={() => setShowMemberManagement(null)}
      />
    );
  }

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
            <CardTitle>Gestion des Clubs (Groupes)</CardTitle>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un club
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Club</TableHead>
                <TableHead>Domaine</TableHead>
                <TableHead>Membres</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Ateliers</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClubs.map((club) => (
                <TableRow key={club.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">{club.nom}</div>
                        <div className="text-sm text-muted-foreground">
                          {club.description || 'Aucune description'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{club.domaine}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {club.club_membres?.[0]?.count || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {club.messages?.[0]?.count || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Settings className="h-4 w-4" />
                      {club.ateliers_travail?.[0]?.count || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={club.type === 'public' ? 'default' : 'secondary'}>
                      {club.type === 'public' ? 'Actif' : club.type === 'suspended' ? 'Suspendu' : 'Privé'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setShowMemberManagement(club.id)}>
                          <Users className="h-4 w-4 mr-2" />
                          Gérer membres
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedClub(club);
                          setEditDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedClub(club);
                          setViewMessagesDialogOpen(true);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir messages
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleModerateContent(club.id)}>
                          <Shield className="h-4 w-4 mr-2" />
                          Modérer contenu
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSuspendClub(club.id)}>
                          <Ban className="h-4 w-4 mr-2" />
                          Suspendre
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClub(club.id)}
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

      <CreateClubDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={onRefresh}
      />

      {selectedClub && (
        <>
          <EditClubDialog
            club={selectedClub}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={onRefresh}
          />
          <ViewClubMessagesDialog
            club={selectedClub}
            open={viewMessagesDialogOpen}
            onOpenChange={setViewMessagesDialogOpen}
          />
        </>
      )}
    </div>
  );
}
