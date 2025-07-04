
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Monitor, Users, Play, CheckCircle } from 'lucide-react';

export function WorkshopStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['workshop-stats'],
    queryFn: async () => {
      const [workshopsResult, sessionsResult, membersResult, activeSessions] = await Promise.all([
        supabase.from('workshops').select('*', { count: 'exact', head: true }),
        supabase.from('workshop_sessions').select('*', { count: 'exact', head: true }),
        supabase.from('workshop_members').select('*', { count: 'exact', head: true }),
        supabase.from('workshop_sessions').select('*', { count: 'exact', head: true }).eq('status', 'running')
      ]);

      return {
        totalWorkshops: workshopsResult.count || 0,
        totalSessions: sessionsResult.count || 0,
        totalMembers: membersResult.count || 0,
        activeSessions: activeSessions.count || 0
      };
    }
  });

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Ateliers</CardTitle>
          <Monitor className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalWorkshops}</div>
          <p className="text-xs text-muted-foreground">
            +5% par rapport au mois dernier
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sessions Actives</CardTitle>
          <Play className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeSessions}</div>
          <p className="text-xs text-muted-foreground">
            Sessions en cours d'exécution
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Participants</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMembers}</div>
          <p className="text-xs text-muted-foreground">
            +15% par rapport au mois dernier
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sessions Terminées</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSessions - stats.activeSessions}</div>
          <p className="text-xs text-muted-foreground">
            Sessions complétées
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
