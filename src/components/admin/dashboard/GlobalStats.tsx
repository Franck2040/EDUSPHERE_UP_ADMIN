
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  MessageSquare, 
  TrendingUp,
  Activity,
  Clock,
  AlertTriangle
} from 'lucide-react';

export function GlobalStats() {
  const { data: globalStats, isLoading } = useQuery({
    queryKey: ['global-admin-stats'],
    queryFn: async () => {
      const [
        usersResult,
        booksResult,
        examsResult,
        clubsResult,
        workshopsResult,
        messagesResult,
        projectsResult
      ] = await Promise.all([
        supabase.from('utilisateurs').select('id, created_at', { count: 'exact' }),
        supabase.from('livres').select('id', { count: 'exact' }),
        supabase.from('examens').select('id', { count: 'exact' }),
        supabase.from('clubs').select('id', { count: 'exact' }),
        supabase.from('ateliers_travail').select('id, created_at', { count: 'exact' }),
        supabase.from('messages').select('id, created_at', { count: 'exact' }),
        supabase.from('projets').select('id', { count: 'exact' })
      ]);

      // Calculate growth stats (users registered in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const newUsers = usersResult.data?.filter(user => 
        new Date(user.created_at) > thirtyDaysAgo
      ).length || 0;

      const newWorkshops = workshopsResult.data?.filter(workshop => 
        new Date(workshop.created_at) > thirtyDaysAgo
      ).length || 0;

      const recentMessages = messagesResult.data?.filter(message => 
        new Date(message.created_at) > thirtyDaysAgo
      ).length || 0;

      return {
        totalUsers: usersResult.count || 0,
        totalBooks: booksResult.count || 0,
        totalExams: examsResult.count || 0,
        totalClubs: clubsResult.count || 0,
        totalWorkshops: workshopsResult.count || 0,
        totalMessages: messagesResult.count || 0,
        totalProjects: projectsResult.count || 0,
        newUsersThisMonth: newUsers,
        newWorkshopsThisMonth: newWorkshops,
        messagesThisMonth: recentMessages
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const statsCards = [
    {
      title: "Utilisateurs Totaux",
      value: globalStats?.totalUsers || 0,
      growth: globalStats?.newUsersThisMonth || 0,
      icon: Users,
      description: `+${globalStats?.newUsersThisMonth || 0} ce mois`,
      color: "text-blue-600"
    },
    {
      title: "Ressources Pédagogiques",
      value: (globalStats?.totalBooks || 0) + (globalStats?.totalExams || 0),
      growth: 0,
      icon: BookOpen,
      description: `${globalStats?.totalBooks || 0} livres, ${globalStats?.totalExams || 0} examens`,
      color: "text-green-600"
    },
    {
      title: "Communautés Actives",
      value: globalStats?.totalClubs || 0,
      growth: 0,
      icon: Users,
      description: "Clubs créés",
      color: "text-purple-600"
    },
    {
      title: "Ateliers Créés",
      value: globalStats?.totalWorkshops || 0,
      growth: globalStats?.newWorkshopsThisMonth || 0,
      icon: GraduationCap,
      description: `+${globalStats?.newWorkshopsThisMonth || 0} ce mois`,
      color: "text-orange-600"
    },
    {
      title: "Projets Actifs",
      value: globalStats?.totalProjects || 0,
      growth: 0,
      icon: Activity,
      description: "Projets en cours",
      color: "text-red-600"
    },
    {
      title: "Messages Échangés",
      value: globalStats?.totalMessages || 0,
      growth: globalStats?.messagesThisMonth || 0,
      icon: MessageSquare,
      description: `+${globalStats?.messagesThisMonth || 0} ce mois`,
      color: "text-indigo-600"
    },
    {
      title: "Activité Globale",
      value: Math.round(((globalStats?.messagesThisMonth || 0) + (globalStats?.newUsersThisMonth || 0)) / 30),
      growth: 0,
      icon: TrendingUp,
      description: "Actions par jour (moyenne)",
      color: "text-teal-600"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stat.value.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
            {stat.growth > 0 && (
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600 font-medium">
                  +{stat.growth}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
