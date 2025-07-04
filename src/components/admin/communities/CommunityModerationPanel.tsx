
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { Community } from '@/pages/AdminCommunities';
import { 
  Search, 
  MoreHorizontal, 
  Trash2, 
  Eye, 
  MessageCircle, 
  AlertTriangle,
  Users,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface CommunityModerationPanelProps {
  communities: Community[];
}

export function CommunityModerationPanel({ communities }: CommunityModerationPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<string>('all');
  const [messageType, setMessageType] = useState<string>('all');

  const { data: messages, isLoading, refetch } = useQuery({
    queryKey: ['community-messages', selectedCommunity, searchTerm, messageType],
    queryFn: async () => {
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(first_name, last_name, email),
          club:clubs!messages_club_id_fkey(name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (selectedCommunity !== 'all') {
        query = query.eq('club_id', selectedCommunity);
      }

      if (searchTerm) {
        query = query.ilike('content', `%${searchTerm}%`);
      }

      if (messageType === 'media') {
        query = query.not('media_url', 'is', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const { data: reports } = useQuery({
    queryKey: ['community-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          user:profiles!notifications_user_id_fkey(first_name, last_name, email)
        `)
        .eq('type', 'report')
        .order('created_at', { ascending: false });

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
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Error deleting message:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      {/* Signalements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Signalements en attente ({reports?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports && reports.length > 0 ? (
            <div className="space-y-2">
              {reports.slice(0, 5).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{report.content}</p>
                    <p className="text-xs text-muted-foreground">
                      Par {report.user?.first_name} {report.user?.last_name} - {formatDate(report.created_at)}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">Aucun signalement en attente</p>
          )}
        </CardContent>
      </Card>

      {/* Modération des messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
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
            <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Toutes les communautés" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les communautés</SelectItem>
                {communities.map((community) => (
                  <SelectItem key={community.id} value={community.id}>
                    {community.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={messageType} onValueChange={setMessageType}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="text">Texte</SelectItem>
                <SelectItem value="media">Médias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Communauté</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages?.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">
                          {message.sender?.first_name} {message.sender?.last_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {message.club?.name || 'Discussion privée'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm">{truncateContent(message.content)}</p>
                      {message.media_url && (
                        <Badge variant="secondary" className="mt-1">
                          {message.media_type || 'Média'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={message.media_url ? 'default' : 'secondary'}>
                        {message.media_url ? 'Média' : 'Texte'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(message.created_at)}
                      </span>
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
