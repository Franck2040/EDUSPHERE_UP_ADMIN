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
import { SessionMonitor } from './SessionMonitor';
import { 
  Search, 
  MoreHorizontal, 
  Play, 
  Square, 
  ExternalLink,
  Trash2,
  Clock,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

export function SessionManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const { data: sessions, isLoading, refetch } = useQuery({
    queryKey: ['admin-sessions', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('workshop_sessions')
        .select(`
          *,
          workshops(name, description)
        `);

      if (searchTerm) {
        query = query.or(`workshops.name.ilike.%${searchTerm}%,container_id.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleStopSession = async (sessionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir arrêter cette session ?')) return;

    try {
      const { error } = await supabase
        .from('workshop_sessions')
        .update({ 
          status: 'stopped',
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      toast.success('Session arrêtée avec succès');
      refetch();
    } catch (error) {
      toast.error('Erreur lors de l\'arrêt de la session');
      console.error('Error stopping session:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) return;

    try {
      const { error } = await supabase
        .from('workshop_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      toast.success('Session supprimée avec succès');
      refetch();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Error deleting session:', error);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'created': 'secondary',
      'running': 'default',
      'stopped': 'outline',
      'error': 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status === 'created' && 'Créée'}
        {status === 'running' && 'En cours'}
        {status === 'stopped' && 'Arrêtée'}
        {status === 'error' && 'Erreur'}
      </Badge>
    );
  };

  const formatDuration = (startedAt: string, endedAt?: string) => {
    const start = new Date(startedAt);
    const end = endedAt ? new Date(endedAt) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / 60000); // en minutes

    if (duration < 60) {
      return `${duration}min`;
    }
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}min`;
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

  // Si une session est sélectionnée pour monitoring
  if (selectedSessionId) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setSelectedSessionId(null)}
        >
          ← Retour aux sessions
        </Button>
        <SessionMonitor sessionId={selectedSessionId} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleRefresh} variant="outline">
              Actualiser
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Atelier</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Conteneur</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions?.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{session.workshops?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {session.id.slice(0, 8)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(session.status)}
                  </TableCell>
                  <TableCell>
                    {session.started_at && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDuration(session.started_at, session.ended_at)}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {session.container_id?.slice(0, 12) || 'N/A'}
                    </code>
                  </TableCell>
                  <TableCell>
                    {session.environment_url ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(session.environment_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(session.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedSessionId(session.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Monitorer
                        </DropdownMenuItem>
                        {session.status === 'running' && (
                          <DropdownMenuItem onClick={() => handleStopSession(session.id)}>
                            <Square className="h-4 w-4 mr-2" />
                            Arrêter
                          </DropdownMenuItem>
                        )}
                        {session.environment_url && (
                          <DropdownMenuItem 
                            onClick={() => window.open(session.environment_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Ouvrir
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDeleteSession(session.id)}
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
    </div>
  );
}
