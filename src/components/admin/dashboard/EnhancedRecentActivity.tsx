
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Eye, MessageSquare, Users, BookOpen, GraduationCap, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Activity {
  id: string;
  type: 'user_registration' | 'book_upload' | 'workshop_creation' | 'club_creation' | 'message_sent' | 'session_started';
  user: string;
  action: string;
  timestamp: string;
  details?: string;
  metadata?: any;
}

export function EnhancedRecentActivity() {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ['enhanced-recent-activity', refreshKey],
    queryFn: async () => {
      const activities: Activity[] = [];
      
      // Récupérer les dernières inscriptions
      const { data: newUsers } = await supabase
        .from('profiles')
        .select('first_name, last_name, created_at, email')
        .order('created_at', { ascending: false })
        .limit(5);

      // Récupérer les derniers livres
      const { data: newBooks } = await supabase
        .from('books')
        .select('title, created_at, author, domain')
        .order('created_at', { ascending: false })
        .limit(3);

      // Récupérer les derniers ateliers
      const { data: newWorkshops } = await supabase
        .from('workshops')
        .select('name, created_at, creator_id')
        .order('created_at', { ascending: false })
        .limit(3);

      // Récupérer les dernières sessions
      const { data: recentSessions } = await supabase
        .from('workshop_sessions')
        .select('workshop_id, created_at, status, workshops(name)')
        .order('created_at', { ascending: false })
        .limit(3);

      // Récupérer les derniers clubs
      const { data: newClubs } = await supabase
        .from('clubs')
        .select('name, created_at, domain')
        .order('created_at', { ascending: false })
        .limit(2);

      // Ajouter les activités utilisateurs
      newUsers?.forEach(user => {
        activities.push({
          id: `user-${user.created_at}`,
          type: 'user_registration',
          user: `${user.first_name} ${user.last_name}`,
          action: 'Inscription d\'un nouvel utilisateur',
          timestamp: user.created_at,
          details: user.email,
          metadata: { userType: 'standard' }
        });
      });

      // Ajouter les activités livres
      newBooks?.forEach(book => {
        activities.push({
          id: `book-${book.created_at}`,
          type: 'book_upload',
          user: book.author || 'Auteur inconnu',
          action: `Nouveau livre: "${book.title}"`,
          timestamp: book.created_at,
          details: `Domaine: ${book.domain}`,
          metadata: { domain: book.domain }
        });
      });

      // Ajouter les activités ateliers
      newWorkshops?.forEach(workshop => {
        activities.push({
          id: `workshop-${workshop.created_at}`,
          type: 'workshop_creation',
          user: 'Organisateur',
          action: `Nouvel atelier: "${workshop.name}"`,
          timestamp: workshop.created_at,
          details: 'Atelier créé',
          metadata: { workshopId: workshop.creator_id }
        });
      });

      // Ajouter les activités sessions
      recentSessions?.forEach(session => {
        activities.push({
          id: `session-${session.created_at}`,
          type: 'session_started',
          user: 'Système',
          action: `Session démarrée: "${session.workshops?.name}"`,
          timestamp: session.created_at,
          details: `Statut: ${session.status}`,
          metadata: { status: session.status }
        });
      });

      // Ajouter les activités clubs
      newClubs?.forEach(club => {
        activities.push({
          id: `club-${club.created_at}`,
          type: 'club_creation',
          user: 'Créateur',
          action: `Nouveau club: "${club.name}"`,
          timestamp: club.created_at,
          details: `Domaine: ${club.domain}`,
          metadata: { domain: club.domain }
        });
      });

      // Trier par date et limiter à 10
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Set up real-time subscriptions
  useEffect(() => {
    const channels = [
      supabase.channel('activity-profiles').on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'profiles' 
      }, () => {
        console.log('New user registered');
        refetch();
      }),
      supabase.channel('activity-books').on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'books' 
      }, () => {
        console.log('New book added');
        refetch();
      }),
      supabase.channel('activity-workshops').on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'workshops' 
      }, () => {
        console.log('New workshop created');
        refetch();
      })
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [refetch]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <Users className="h-4 w-4" />;
      case 'book_upload':
        return <BookOpen className="h-4 w-4" />;
      case 'workshop_creation':
      case 'session_started':
        return <GraduationCap className="h-4 w-4" />;
      case 'club_creation':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getActivityBadge = (type: string) => {
    const badges = {
      user_registration: { variant: 'secondary' as const, text: 'Utilisateur' },
      book_upload: { variant: 'default' as const, text: 'Contenu' },
      workshop_creation: { variant: 'outline' as const, text: 'Atelier' },
      session_started: { variant: 'outline' as const, text: 'Session' },
      club_creation: { variant: 'destructive' as const, text: 'Communauté' },
    };
    const badge = badges[type as keyof typeof badges] || { variant: 'secondary' as const, text: 'Activité' };
    return <Badge variant={badge.variant}>{badge.text}</Badge>;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) return `${diffInDays}j`;
    if (diffInHours > 0) return `${diffInHours}h`;
    if (diffInMinutes > 0) return `${diffInMinutes}min`;
    return 'À l\'instant';
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Activité en temps réel
            </CardTitle>
            <CardDescription>
              Dernières actions sur la plateforme
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activities && activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-xs">
                      {getActivityIcon(activity.type)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">
                        {activity.user}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.action}
                    </p>
                    {activity.details && (
                      <p className="text-xs text-muted-foreground italic">
                        {activity.details}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {getActivityBadge(activity.type)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune activité récente
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
