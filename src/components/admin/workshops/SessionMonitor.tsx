
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity,
  Users,
  Clock,
  ExternalLink,
  RefreshCw,
  Server
} from 'lucide-react';

interface SessionMonitorProps {
  sessionId: string;
}

export function SessionMonitor({ sessionId }: SessionMonitorProps) {
  const [session, setSession] = useState<any>(null);
  const [metrics, setMetrics] = useState({
    cpu: 0,
    memory: 0,
    activeUsers: 0,
    uptime: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSessionData();
    const interval = setInterval(fetchSessionData, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      const { data, error } = await supabase
        .from('workshop_sessions')
        .select(`
          *,
          workshops(name, description)
        `)
        .eq('id', sessionId)
        .single();

      if (error) throw error;

      setSession(data);
      
      // Simuler des métriques de performance
      setMetrics({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        activeUsers: Math.floor(Math.random() * 10) + 1,
        uptime: data.started_at ? 
          Math.floor((new Date().getTime() - new Date(data.started_at).getTime()) / 1000) : 0
      });
    } catch (error) {
      console.error('Error fetching session data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'stopped': return 'bg-red-500';
      case 'created': return 'bg-yellow-500';
      case 'error': return 'bg-red-600';
      default: return 'bg-gray-500';
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

  if (!session) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Session introuvable</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                {session.workshops?.name}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Session ID: {session.id.slice(0, 8)}...
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)}`}></div>
              <Badge variant={session.status === 'running' ? 'default' : 'secondary'}>
                {session.status === 'running' && 'En cours'}
                {session.status === 'stopped' && 'Arrêtée'}
                {session.status === 'created' && 'Créée'}
                {session.status === 'error' && 'Erreur'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{metrics.cpu.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">CPU</div>
              <Progress value={metrics.cpu} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Server className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold">{metrics.memory.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Mémoire</div>
              <Progress value={metrics.memory} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div className="text-2xl font-bold">{metrics.activeUsers}</div>
              <div className="text-sm text-muted-foreground">Utilisateurs</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <div className="text-lg font-bold">{formatUptime(metrics.uptime)}</div>
              <div className="text-sm text-muted-foreground">Durée</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-6">
            {session.environment_url && (
              <Button
                onClick={() => window.open(session.environment_url, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Ouvrir l'environnement
              </Button>
            )}
            <Button
              variant="outline"
              onClick={fetchSessionData}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Détails de la session</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Conteneur ID:</span>
              <div className="font-mono text-muted-foreground">
                {session.container_id || 'N/A'}
              </div>
            </div>
            <div>
              <span className="font-medium">URL d'environnement:</span>
              <div className="font-mono text-muted-foreground break-all">
                {session.environment_url || 'N/A'}
              </div>
            </div>
            <div>
              <span className="font-medium">Créée le:</span>
              <div>{new Date(session.created_at).toLocaleString('fr-FR')}</div>
            </div>
            <div>
              <span className="font-medium">Démarrée le:</span>
              <div>
                {session.started_at ? 
                  new Date(session.started_at).toLocaleString('fr-FR') : 
                  'Non démarrée'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
