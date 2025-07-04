
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Users, BookOpen, TrendingUp, Activity, Zap } from 'lucide-react';

interface PerformanceMetric {
  title: string;
  value: number;
  target: number;
  unit: string;
  description: string;
  status: 'excellent' | 'good' | 'warning' | 'poor';
  icon: React.ComponentType<any>;
}

export function PerformanceMetrics() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async () => {
      // Calculer les métriques de performance
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalUsers,
        activeUsersWeek,
        totalBooks,
        newBooksWeek,
        totalWorkshops,
        activeWorkshops,
        totalMessages,
        recentMessages
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', oneWeekAgo.toISOString()),
        supabase.from('books').select('id', { count: 'exact', head: true }),
        supabase.from('books').select('id', { count: 'exact', head: true }).gte('created_at', oneWeekAgo.toISOString()),
        supabase.from('workshops').select('id', { count: 'exact', head: true }),
        supabase.from('workshop_sessions').select('id', { count: 'exact', head: true }).gte('created_at', oneWeekAgo.toISOString()),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true }).gte('created_at', oneWeekAgo.toISOString())
      ]);

      // Calculs de performance
      const userGrowthRate = totalUsers.count ? (activeUsersWeek.count! / totalUsers.count! * 100) : 0;
      const contentGrowthRate = totalBooks.count ? (newBooksWeek.count! / totalBooks.count! * 100) : 0;
      const workshopActivityRate = totalWorkshops.count ? (activeWorkshops.count! / totalWorkshops.count! * 100) : 0;
      const messagingActivity = recentMessages.count || 0;
      const platformUtilization = ((userGrowthRate + contentGrowthRate + workshopActivityRate) / 3);
      const engagementScore = Math.min(100, (messagingActivity / 10) * 20); // Score basé sur les messages

      return {
        userGrowthRate,
        contentGrowthRate,
        workshopActivityRate,
        messagingActivity,
        platformUtilization,
        engagementScore
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const getStatus = (value: number, target: number): 'excellent' | 'good' | 'warning' | 'poor' => {
    const percentage = (value / target) * 100;
    if (percentage >= 90) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 50) return 'warning';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const performanceMetrics: PerformanceMetric[] = [
    {
      title: "Croissance utilisateurs",
      value: metrics?.userGrowthRate || 0,
      target: 15,
      unit: "%",
      description: "Nouveaux utilisateurs cette semaine",
      status: getStatus(metrics?.userGrowthRate || 0, 15),
      icon: Users
    },
    {
      title: "Croissance contenu",
      value: metrics?.contentGrowthRate || 0,
      target: 10,
      unit: "%",
      description: "Nouveau contenu ajouté",
      status: getStatus(metrics?.contentGrowthRate || 0, 10),
      icon: BookOpen
    },
    {
      title: "Activité ateliers",
      value: metrics?.workshopActivityRate || 0,
      target: 25,
      unit: "%",
      description: "Ateliers actifs cette semaine",
      status: getStatus(metrics?.workshopActivityRate || 0, 25),
      icon: Activity
    },
    {
      title: "Engagement",
      value: metrics?.engagementScore || 0,
      target: 80,
      unit: "/100",
      description: "Score d'engagement global",
      status: getStatus(metrics?.engagementScore || 0, 80),
      icon: TrendingUp
    },
    {
      title: "Utilisation plateforme",
      value: metrics?.platformUtilization || 0,
      target: 70,
      unit: "%",
      description: "Utilisation globale des fonctionnalités",
      status: getStatus(metrics?.platformUtilization || 0, 70),
      icon: Zap
    },
    {
      title: "Messages actifs",
      value: metrics?.messagingActivity || 0,
      target: 50,
      unit: "msg",
      description: "Messages échangés cette semaine",
      status: getStatus(metrics?.messagingActivity || 0, 50),
      icon: Clock
    }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métriques de performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Métriques de performance
        </CardTitle>
        <CardDescription>
          Indicateurs clés de performance en temps réel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {performanceMetrics.map((metric) => (
            <div key={metric.title} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <metric.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{metric.title}</span>
                  <Badge variant="outline" className={getStatusBadge(metric.status)}>
                    {metric.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-lg">
                    {metric.value.toFixed(1)}{metric.unit}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / {metric.target}{metric.unit}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <Progress 
                  value={(metric.value / metric.target) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Score global */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Score global de performance</h4>
              <p className="text-sm text-muted-foreground">
                Moyenne pondérée de tous les indicateurs
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {((metrics?.platformUtilization || 0 + metrics?.engagementScore || 0) / 2).toFixed(0)}/100
              </div>
              <div className="text-xs text-muted-foreground">Performance</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
