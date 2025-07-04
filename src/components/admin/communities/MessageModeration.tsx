
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Trash2, 
  AlertTriangle,
  Eye,
  Ban,
  MessageSquare,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface MessageModerationProps {
  onRefresh: () => void;
}

export function MessageModeration({ onRefresh }: MessageModerationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedClub, setSelectedClub] = useState('all');

  const { data: messages, isLoading, refetch } = useQuery({
    queryKey: ['admin-messages', searchTerm, filterType, selectedClub],
    queryFn: async () => {
      let query = supabase
        .from('messages')
        .select(`
          *,
          expediteur:utilisateurs!messages_expediteur_id_fkey(prenom, nom, email),
          destinataire:utilisateurs!messages_destinataire_id_fkey(prenom, nom, email),
          club:clubs!messages_club_id_fkey(nom, domaine)
        `);

      if (searchTerm) {
        query = query.ilike('contenu', `%${searchTerm}%`);
      }

      if (filterType === 'media') {
        query = query.not('media_url', 'is', null);
      } else if (filterType === 'text') {
        query = query.is('media_url', null);
      }

      if (selectedClub !== 'all') {
        query = query.eq('club_id', selectedClub);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: clubs } = useQuery({
    queryKey: ['clubs-for-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clubs')
        .select('id, nom')
        .order('nom');
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      toast.success('Message supprimé avec succès');
      refetch();
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Error deleting message:', error);
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir bannir cet utilisateur ?')) return;

    try {
      // Créer une notification de bannissement
      const { error } = await supabase.rpc('create_notification', {
        p_utilisateur_id: userId,
        p_type: 'ban',
        p_message: 'Votre compte a été suspendu pour violation des règles de la communauté',
        p_source: 'admin'
      });

      if (error) throw error;

      toast.success('Utilisateur banni avec succès');
      refetch();
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors du bannissement');
      console.error('Error banning user:', error);
    }
  };

  const detectSuspiciousContent = (content: string) => {
    const suspiciousWords = ['merde', 'connard', 'salope', 'putain', 'con', 'idiot'];
    return suspiciousWords.some(word => content.toLowerCase().includes(word));
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
            <MessageSquare className="h-5 w-5" />
            Modération des Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="text">Texte</SelectItem>
                <SelectItem value="media">Médias</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedClub} onValueChange={setSelectedClub}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Toutes les communautés" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les communautés</SelectItem>
                {clubs?.map((club) => (
                  <SelectItem key={club.id} value={club.id}>
                    {club.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expéditeur</TableHead>
                <TableHead>Destinataire/Groupe</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages?.map((message) => {
                const isSuspicious = message.contenu && detectSuspiciousContent(message.contenu);
                
                return (
                  <TableRow key={message.id} className={isSuspicious ? 'bg-red-50' : ''}>
                    <TableCell>
                      <div className="font-medium text-sm">
                        {message.expediteur?.prenom} {message.expediteur?.nom}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {message.expediteur?.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {message.club ? (
                        <Badge variant="outline">{message.club.nom}</Badge>
                      ) : (
                        <div className="text-sm">
                          {message.destinataire?.prenom} {message.destinataire?.nom}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm">
                        {message.contenu ? truncateText(message.contenu) : 'Média'}
                      </div>
                      {message.media_url && (
                        <Badge variant="secondary" className="mt-1">
                          {message.type || 'Média'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={message.media_url ? 'default' : 'secondary'}>
                        {message.media_url ? 'Média' : 'Texte'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isSuspicious && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Suspect
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleString('fr-FR')}
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
                          <DropdownMenuItem onClick={() => handleDeleteMessage(message.id)}>
                            <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                            Supprimer
                          </DropdownMenuItem>
                          {message.expediteur_id && (
                            <DropdownMenuItem onClick={() => handleBanUser(message.expediteur_id)}>
                              <Ban className="h-4 w-4 mr-2 text-orange-500" />
                              Bannir utilisateur
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
