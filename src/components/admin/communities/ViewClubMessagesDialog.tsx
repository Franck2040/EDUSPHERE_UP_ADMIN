
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Search, Trash2, Flag, User, Calendar, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Club {
  id: string;
  nom: string;
  description: string;
  domaine: string;
}

interface ViewClubMessagesDialogProps {
  club: Club;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewClubMessagesDialog({ club, open, onOpenChange }: ViewClubMessagesDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  const { data: messages, isLoading, refetch } = useQuery({
    queryKey: ['club-messages', club.id, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('messages')
        .select(`
          *,
          expediteur:utilisateurs!messages_expediteur_id_fkey(
            id, prenom, nom, email
          )
        `)
        .eq('club_id', club.id)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('contenu', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: open
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

  const handleReportMessage = async (messageId: string, reason: string) => {
    try {
      // Créer une notification pour signaler le message
      await supabase.rpc('create_notification', {
        p_utilisateur_id: (await supabase.auth.getUser()).data.user?.id,
        p_type: 'report',
        p_message: `Message signalé dans le club "${club.nom}". Raison: ${reason}`,
        p_source: 'admin_moderation'
      });

      toast.success('Message signalé avec succès');
    } catch (error) {
      toast.error('Erreur lors du signalement');
      console.error('Error reporting message:', error);
    }
  };

  const detectSuspiciousContent = (content: string) => {
    const suspiciousWords = ['merde', 'connard', 'salope', 'putain', 'con', 'idiot'];
    return suspiciousWords.some(word => content.toLowerCase().includes(word));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Messages du club "{club.nom}"</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => refetch()}>
              Actualiser
            </Button>
          </div>

          <ScrollArea className="h-[500px] w-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 border rounded-lg ${
                      detectSuspiciousContent(message.contenu) ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">
                            {message.expediteur?.prenom} {message.expediteur?.nom}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({message.expediteur?.email})
                          </span>
                          <Calendar className="h-4 w-4 ml-2" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(message.created_at).toLocaleString('fr-FR')}
                          </span>
                          {detectSuspiciousContent(message.contenu) && (
                            <Badge variant="destructive" className="ml-2">
                              Contenu suspect
                            </Badge>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="flex items-start gap-2">
                            <MessageCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                            <p className="text-sm">{message.contenu}</p>
                          </div>
                          {message.media_url && (
                            <div className="mt-2">
                              <Badge variant="outline">Fichier joint</Badge>
                              <a 
                                href={message.media_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline ml-2"
                              >
                                Voir le fichier
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReportMessage(message.id, 'Contenu inapproprié')}
                        >
                          <Flag className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteMessage(message.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucun message trouvé
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
