
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Activity,
  MessageSquare
} from 'lucide-react';

export function AdminOverview() {
  const { data: overviewData, isLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const [
        recentUsers,
        recentClubs,
        recentMessages,
        systemAlerts
      ] = await Promise.all([
        supabase
          .from('utilisateurs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('clubs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('messages')
          .select(`
            *,
            expediteur:expediteur_id(nom, prenom, photo_profil_url),
            club:club_id(nom)
          `)
          .order('created_at', { ascending: false })
          .limit(5),
        // Simuler des alertes système
        Promise.resolve([
          {
            id: '1',
            type: 'warning',
            message: 'Espace disque faible sur le serveur de stockage',
            created_at: new Date().toISOString()
          },
          {
            id: '2', 
            type: 'info',
            message: 'Maintenance programmée ce week-end',
            created_at: new Date().toISOString()
          }
        ])
      ]);

      return {
        recentUsers: recentUsers.data || [],
        recentClubs: recentClubs.data || [],
        recentMessages: recentMessages.data || [],
        systemAlerts: systemAlerts || []
      };
    },
    refetchInterval: 60000 // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Nouveaux Utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-blue-600" />
            Nouveaux Utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {overviewData?.recentUsers.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun nouvel utilisateur</p>
          ) : (
            overviewData?.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photo_profil_url || ''} />
                  <AvatarFallback>
                    {user.prenom?.[0]}{user.nom?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.prenom} {user.nom}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Activité Récente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-green-600" />
            Activité Récente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {overviewData?.recentMessages.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucune activité récente</p>
          ) : (
            overviewData?.recentMessages.map((message) => (
              <div key={message.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {message.expediteur?.prenom} {message.expediteur?.nom}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {message.club?.nom || 'Message privé'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground pl-6 truncate">
                  {message.contenu}
                </p>
                <p className="text-xs text-muted-foreground pl-6">
                  {new Date(message.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Alertes Système */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Alertes Système
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {overviewData?.systemAlerts.length === 0 ? (
            <div className="flex items-center gap-2 text-green-600">
              <div className="h-2 w-2 bg-green-600 rounded-full"></div>
              <span className="text-sm">Tous les systèmes opérationnels</span>
            </div>
          ) : (
            overviewData?.systemAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3">
                <div className={`mt-1 h-2 w-2 rounded-full ${
                  alert.type === 'warning' ? 'bg-orange-500' : 
                  alert.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(alert.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
