
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, GraduationCap, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface StatChange {
  value: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface RealTimeStat {
  title: string;
  value: number;
  icon: React.ComponentType<any>;
  description: string;
  change: StatChange;
  color: string;
  bgGradient: string;
}

export function RealTimeStats() {
  const [previousStats, setPreviousStats] = useState<any>(null);

  const { data: currentStats, isLoading } = useQuery({
    queryKey: ['realtime-stats'],
    queryFn: async () => {
      const [usersResult, booksResult, workshopsResult, clubsResult, messagesResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('books').select('id', { count: 'exact', head: true }),
        supabase.from('workshops').select('id', { count: 'exact', head: true }),
        supabase.from('clubs').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true })
      ]);

      const stats = {
        totalUsers: usersResult.count || 0,
        totalBooks: booksResult.count || 0,
        totalWorkshops: workshopsResult.count || 0,
        totalClubs: clubsResult.count || 0,
        totalMessages: messagesResult.count || 0,
        timestamp: new Date().getTime()
      };

      // Calculer les changements
      if (previousStats) {
        const changes = {
          users: calculateChange(previousStats.totalUsers, stats.totalUsers),
          books: calculateChange(previousStats.totalBooks, stats.totalBooks),
          workshops: calculateChange(previousStats.totalWorkshops, stats.totalWorkshops),
          clubs: calculateChange(previousStats.totalClubs, stats.totalClubs),
          messages: calculateChange(previousStats.totalMessages, stats.totalMessages),
        };
        setPreviousStats(stats);
        return { ...stats, changes };
      } else {
        setPreviousStats(stats);
        return { 
          ...stats, 
          changes: {
            users: { value: 0, percentage: 0, trend: 'stable' as const },
            books: { value: 0, percentage: 0, trend: 'stable' as const },
            workshops: { value: 0, percentage: 0, trend: 'stable' as const },
            clubs: { value: 0, percentage: 0, trend: 'stable' as const },
            messages: { value: 0, percentage: 0, trend: 'stable' as const },
          }
        };
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const calculateChange = (previous: number, current: number): StatChange => {
    if (previous === 0) return { value: current, percentage: 0, trend: 'stable' };
    
    const change = current - previous;
    const percentage = Math.abs((change / previous) * 100);
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
    
    return { value: change, percentage, trend };
  };

  // Set up real-time subscriptions
  useEffect(() => {
    const channels = [
      supabase.channel('profiles-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        // Trigger refetch when profiles change
      }),
      supabase.channel('books-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, () => {
        // Trigger refetch when books change  
      }),
      supabase.channel('workshops-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'workshops' }, () => {
        // Trigger refetch when workshops change
      }),
      supabase.channel('clubs-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'clubs' }, () => {
        // Trigger refetch when clubs change
      })
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  const statsData: RealTimeStat[] = [
    {
      title: "Utilisateurs",
      value: currentStats?.totalUsers || 0,
      icon: Users,
      description: "Total des utilisateurs inscrits",
      change: currentStats?.changes?.users || { value: 0, percentage: 0, trend: 'stable' },
      color: "text-blue-600 dark:text-blue-400",
      bgGradient: "from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20"
    },
    {
      title: "Livres",
      value: currentStats?.totalBooks || 0,
      icon: BookOpen,
      description: "Livres disponibles",
      change: currentStats?.changes?.books || { value: 0, percentage: 0, trend: 'stable' },
      color: "text-green-600 dark:text-green-400",
      bgGradient: "from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20"
    },
    {
      title: "Ateliers",
      value: currentStats?.totalWorkshops || 0,
      icon: GraduationCap,
      description: "Ateliers créés",
      change: currentStats?.changes?.workshops || { value: 0, percentage: 0, trend: 'stable' },
      color: "text-purple-600 dark:text-purple-400",
      bgGradient: "from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20"
    },
    {
      title: "Messages",
      value: currentStats?.totalMessages || 0,
      icon: MessageSquare,
      description: "Messages échangés",
      change: currentStats?.changes?.messages || { value: 0, percentage: 0, trend: 'stable' },
      color: "text-orange-600 dark:text-orange-400",
      bgGradient: "from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20"
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => (
        <Card 
          key={stat.title} 
          className={`relative overflow-hidden card-hover animate-fade-in bg-gradient-to-br ${stat.bgGradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-background/50 backdrop-blur-sm`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                ) : (
                  <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    {stat.value.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {getTrendIcon(stat.change.trend)}
                <span>
                  {stat.change.trend !== 'stable' && (
                    <span className={stat.change.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {stat.change.trend === 'up' ? '+' : ''}{stat.change.value} ({stat.change.percentage.toFixed(1)}%)
                    </span>
                  )}
                </span>
                <span className="text-xs">{stat.description}</span>
              </div>
            </div>
            
            {/* Pulse animation for real-time effect */}
            {!isLoading && (
              <div className="absolute top-3 right-3">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
              </div>
            )}
            
            {/* Subtle animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
