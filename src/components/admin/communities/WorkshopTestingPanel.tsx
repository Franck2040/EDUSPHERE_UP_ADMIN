
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
import { 
  TestTube, 
  Play, 
  Square, 
  Monitor, 
  Users, 
  Clock, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export function WorkshopTestingPanel() {
  const [testEnvironment, setTestEnvironment] = useState<string>('');
  const [isTestRunning, setIsTestRunning] = useState(false);

  const { data: workshops, isLoading: workshopsLoading, refetch: refetchWorkshops } = useQuery({
    queryKey: ['test-workshops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workshops')
        .select(`
          *,
          creator:profiles!workshops_creator_id_fkey(first_name, last_name),
          club:clubs!workshops_club_id_fkey(name),
          workshop_sessions(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const { data: environments } = useQuery({
    queryKey: ['workshop-environments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workshops')
        .select('environment_type')
        .not('environment_type', 'is', null);

      if (error) throw error;
      
      // Extraire les types d'environnements uniques
      const uniqueEnvironments = [...new Set(data?.map(w => w.environment_type).filter(Boolean) || [])];
      return uniqueEnvironments;
    }
  });

  const { data: activeSessions } = useQuery({
    queryKey: ['active-workshop-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workshop_sessions')
        .select(`
          *,
          workshop:workshops!workshop_sessions_workshop_id_fkey(name, environment_type)
        `)
        .eq('status', 'running');

      if (error) throw error;
      return data || [];
    }
  });

  const handleStartTest = async () => {
    if (!testEnvironment) {
      toast.error('Veuillez sélectionner un environnement à tester');
      return;
    }

    setIsTestRunning(true);
    try {
      // Simuler le lancement d'un test d'environnement
      const { data, error } = await supabase
        .from('workshop_sessions')
        .insert({
          workshop_id: 'test-workshop-id', // ID fictif pour les tests
          status: 'running',
          started_at: new Date().toISOString(),
          environment_url: `https://test-env-${Date.now()}.workshop.test`,
          container_id: `test-container-${Date.now()}`
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Test d\'environnement démarré avec succès');
      refetchWorkshops();
    } catch (error) {
      toast.error('Erreur lors du démarrage du test');
      console.error('Error starting test:', error);
    } finally {
      setIsTestRunning(false);
    }
  };

  const handleStopSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('workshop_sessions')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      toast.success('Session arrêtée avec succès');
      refetchWorkshops();
    } catch (error) {
      toast.error('Erreur lors de l\'arrêt de la session');
      console.error('Error stopping session:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'ended':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'created':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      running: 'default',
      ended: 'secondary',
      created: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status === 'running' ? 'Actif' : status === 'ended' ? 'Terminé' : 'Créé'}
      </Badge>
    );
  };

  const formatDuration = (startedAt: string, endedAt?: string) => {
    const start = new Date(startedAt);
    const end = endedAt ? new Date(endedAt) : new Date();
    const duration = end.getTime() - start.getTime();
    const minutes = Math.floor(duration / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Panneau de test d'environnements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test d'Environnements d'Ateliers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Environnement à tester
              </label>
              <Select value={testEnvironment} onValueChange={setTestEnvironment}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un environnement" />
                </SelectTrigger>
                <SelectContent>
                  {environments?.map((env) => (
                    <SelectItem key={env} value={env}>
                      {env || 'Environnement sans nom'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleStartTest} 
              disabled={isTestRunning || !testEnvironment}
              className="flex items-center gap-2"
            >
              {isTestRunning ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isTestRunning ? 'Test en cours...' : 'Démarrer le test'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sessions actives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Sessions d'Ateliers Actives ({activeSessions?.length || 0})
            </div>
            <Button size="sm" variant="outline" onClick={() => refetchWorkshops()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeSessions && activeSessions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Statut</TableHead>
                  <TableHead>Atelier</TableHead>
                  <TableHead>Environnement</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>URL d'accès</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(session.status)}
                        {getStatusBadge(session.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {session.workshop?.name || 'Test d\'environnement'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {session.workshop?.environment_type || 'Non spécifié'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {session.started_at && (
                        <span className="text-sm text-muted-foreground">
                          {formatDuration(session.started_at, session.ended_at || undefined)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {session.environment_url && (
                        <Button 
                          size="sm" 
                          variant="link" 
                          className="p-0 h-auto"
                          onClick={() => window.open(session.environment_url, '_blank')}
                        >
                          Accéder
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleStopSession(session.id)}
                            className="text-red-600"
                          >
                            <Square className="h-4 w-4 mr-2" />
                            Arrêter
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune session active</h3>
              <p className="text-muted-foreground">
                Démarrez un test d'environnement pour voir les sessions actives ici.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tous les ateliers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Historique des Ateliers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {workshopsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : workshops && workshops.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Créateur</TableHead>
                  <TableHead>Club</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Date création</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workshops.slice(0, 10).map((workshop) => (
                  <TableRow key={workshop.id}>
                    <TableCell className="font-medium">{workshop.name}</TableCell>
                    <TableCell>
                      {workshop.creator?.first_name} {workshop.creator?.last_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {workshop.club?.name || 'Aucun club'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {workshop.workshop_sessions?.length || 0} sessions
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(workshop.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={workshop.is_private ? 'secondary' : 'default'}>
                        {workshop.is_private ? 'Privé' : 'Public'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun atelier</h3>
              <p className="text-muted-foreground">
                Les ateliers créés par les utilisateurs apparaîtront ici.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
