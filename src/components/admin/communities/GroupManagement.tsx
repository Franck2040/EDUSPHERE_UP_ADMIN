
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
import { 
  Search, 
  MoreHorizontal, 
  MessageSquare, 
  Users, 
  Eye, 
  Ban,
  Shield,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface GroupManagementProps {
  onRefresh: () => void;
}

export function GroupManagement({ onRefresh }: GroupManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const { data: groups, isLoading, refetch } = useQuery({
    queryKey: ['admin-groups', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('clubs')
        .select(`
          *,
          club_membres(count),
          messages(count),
          demandes_adhesion(count)
        `);

      if (searchTerm) {
        query = query.or(`nom.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleViewMessages = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          expediteur:profiles!messages_expediteur_id_fkey(first_name, last_name)
        `)
        .eq('club_id', groupId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      console.log('Messages du groupe:', data);
      toast.success(`${data.length} messages récupérés`);
    } catch (error) {
      toast.error('Erreur lors de la récupération des messages');
      console.error('Error fetching messages:', error);
    }
  };

  const handleSuspendGroup = async (groupId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir suspendre ce groupe ?')) return;

    try {
      const { error } = await supabase
        .from('clubs')
        .update({ type: 'suspended' })
        .eq('id', groupId);

      if (error) throw error;

      toast.success('Groupe suspendu avec succès');
      refetch();
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors de la suspension');
      console.error('Error suspending group:', error);
    }
  };

  const handleModerateContent = async (groupId: string) => {
    try {
      // Recherche de contenu suspect dans les messages
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('club_id', groupId)
        .or('contenu.ilike.%merde%,contenu.ilike.%connard%,contenu.ilike.%salope%')
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
          <CardTitle>Gestion des Groupes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des groupes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Groupe</TableHead>
                <TableHead>Domaine</TableHead>
                <TableHead>Membres</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Demandes</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups?.map((group) => (
                <TableRow key={group.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {group.avatar_url && (
                        <img 
                          src={group.avatar_url} 
                          alt={group.nom}
                          className="w-8 h-8 object-cover rounded-full"
                        />
                      )}
                      <div>
                        <div className="font-medium">{group.nom}</div>
                        <div className="text-sm text-muted-foreground">
                          {group.description || 'Aucune description'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{group.domaine}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {group.club_membres?.[0]?.count || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {group.messages?.[0]?.count || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {group.demandes_adhesion?.[0]?.count || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={group.type === 'public' ? 'default' : 'secondary'}>
                      {group.type === 'public' ? 'Actif' : group.type === 'suspended' ? 'Suspendu' : 'Privé'}
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
                        <DropdownMenuItem onClick={() => handleViewMessages(group.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir messages
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleModerateContent(group.id)}>
                          <Shield className="h-4 w-4 mr-2" />
                          Modérer contenu
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSuspendGroup(group.id)}>
                          <Ban className="h-4 w-4 mr-2" />
                          Suspendre
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
    </div>
  );
}
