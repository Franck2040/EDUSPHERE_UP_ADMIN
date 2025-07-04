
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function RecentActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: async () => {
      // Récupérer les dernières activités
      const [newUsers, newBooks, newWorkshops, newClubs] = await Promise.all([
        supabase
          .from('profiles')
          .select('first_name, last_name, created_at')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('books')
          .select('title, created_at')
          .order('created_at', { ascending: false })
          .limit(2),
        supabase
          .from('workshops')
          .select('name, created_at')
          .order('created_at', { ascending: false })
          .limit(2),
        supabase
          .from('clubs')
          .select('name, created_at')
          .order('created_at', { ascending: false })
          .limit(2)
      ]);

      const activities = [];

      // Ajouter les nouveaux utilisateurs
      newUsers.data?.forEach(user => {
        activities.push({
          id: `user-${user.created_at}`,
          user: `${user.first_name} ${user.last_name}`,
          action: 'Nouvel utilisateur inscrit',
          timestamp: getTimeAgo(user.created_at),
          type: 'user'
        });
      });

      // Ajouter les nouveaux livres
      newBooks.data?.forEach(book => {
        activities.push({
          id: `book-${book.created_at}`,
          user: 'Système',
          action: `Livre "${book.title}" ajouté`,
          timestamp: getTimeAgo(book.created_at),
          type: 'content'
        });
      });

      // Ajouter les nouveaux ateliers
      newWorkshops.data?.forEach(workshop => {
        activities.push({
          id: `workshop-${workshop.created_at}`,
          user: 'Utilisateur',
          action: `Atelier "${workshop.name}" créé`,
          timestamp: getTimeAgo(workshop.created_at),
          type: 'workshop'
        });
      });

      // Ajouter les nouveaux clubs
      newClubs.data?.forEach(club => {
        activities.push({
          id: `club-${club.created_at}`,
          user: 'Utilisateur',
          action: `Club "${club.name}" créé`,
          timestamp: getTimeAgo(club.created_at),
          type: 'community'
        });
      });

      // Trier par date (plus récent en premier)
      return activities
        .sort((a, b) => new Date(b.id.split('-')[1]).getTime() - new Date(a.id.split('-')[1]).getTime())
        .slice(0, 5);
    },
    refetchInterval: 2 * 60 * 1000 // Refresh every 2 minutes
  });

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays}j`;
    } else if (diffInHours > 0) {
      return `${diffInHours}h`;
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}min`;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'user':
        return <Badge variant="secondary">Utilisateur</Badge>;
      case 'content':
        return <Badge variant="default">Contenu</Badge>;
      case 'workshop':
        return <Badge variant="outline">Atelier</Badge>;
      case 'community':
        return <Badge variant="destructive">Communauté</Badge>;
      default:
        return <Badge variant="secondary">Activité</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
        <CardDescription>
          Dernières actions sur la plateforme
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activities && activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.user}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.action}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {getActivityBadge(activity.type)}
                    <span className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Aucune activité récente</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
