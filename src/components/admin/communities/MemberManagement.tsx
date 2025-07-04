
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
  Eye, 
  Ban,
  Shield,
  Users,
  FileText,
  Github
} from 'lucide-react';
import { toast } from 'sonner';

interface MemberManagementProps {
  onRefresh: () => void;
}

export function MemberManagement({ onRefresh }: MemberManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: members, isLoading, refetch } = useQuery({
    queryKey: ['admin-members', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('club_membres')
        .select(`
          *,
          membre:utilisateurs!club_membres_membre_id_fkey(
            id, prenom, nom, email, telephone, bio, created_at
          ),
          club:clubs!club_membres_club_id_fkey(nom, domaine),
          projets:projet_collaborateurs!projet_collaborateurs_collaborateur_id_fkey(
            projet:projets(nom, langages_utilises, statut)
          )
        `);

      const { data, error } = await query.order('date_adhesion', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cvs')
        .select('utilisateur_id, count(*)')
        .group('utilisateur_id');
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleViewProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('utilisateurs')
        .select(`
          *,
          competences(*),
          langues_parlees(*),
          loisirs(*),
          projets:projet_collaborateurs!projet_collaborateurs_collaborateur_id_fkey(
            projet:projets(*)
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      console.log('Profil utilisateur:', data);
      toast.success('Profil récupéré avec succès');
    } catch (error) {
      toast.error('Erreur lors de la récupération du profil');
      console.error('Error fetching profile:', error);
    }
  };

  const handleBanMember = async (memberId: string, userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir bannir ce membre ?')) return;

    try {
      // Supprimer le membre du club
      const { error: deleteError } = await supabase
        .from('club_membres')
        .delete()
        .eq('id', memberId);

      if (deleteError) throw deleteError;

      // Créer une notification
      const { error: notifError } = await supabase.rpc('create_notification', {
        p_utilisateur_id: userId,
        p_type: 'ban',
        p_message: 'Vous avez été exclu d\'une communauté pour violation des règles',
        p_source: 'admin'
      });

      if (notifError) throw notifError;

      toast.success('Membre banni avec succès');
      refetch();
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors du bannissement');
      console.error('Error banning member:', error);
    }
  };

  const handlePromoteToAdmin = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('club_membres')
        .update({ role: 'admin', is_admin: true })
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Membre promu administrateur');
      refetch();
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors de la promotion');
      console.error('Error promoting member:', error);
    }
  };

  const getCvCount = (userId: string) => {
    const userStat = userStats?.find(stat => stat.utilisateur_id === userId);
    return userStat?.count || 0;
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
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestion des Membres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des membres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membre</TableHead>
                <TableHead>Communauté</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Projets</TableHead>
                <TableHead>CVs générés</TableHead>
                <TableHead>Adhésion</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {member.membre?.prenom?.[0]}{member.membre?.nom?.[0]}
                      </div>
                      <div>
                        <div className="font-medium">
                          {member.membre?.prenom} {member.membre?.nom}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.membre?.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {member.club?.nom || 'Communauté supprimée'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.is_admin ? 'default' : 'secondary'}>
                      {member.role || 'membre'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Github className="h-4 w-4" />
                      {member.projets?.length || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {getCvCount(member.membre_id)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(member.date_adhesion).toLocaleDateString('fr-FR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewProfile(member.membre_id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir profil
                        </DropdownMenuItem>
                        {!member.is_admin && (
                          <DropdownMenuItem onClick={() => handlePromoteToAdmin(member.id)}>
                            <Shield className="h-4 w-4 mr-2" />
                            Promouvoir admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleBanMember(member.id, member.membre_id)}
                          className="text-red-600"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Bannir
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
