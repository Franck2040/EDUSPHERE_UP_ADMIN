
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, UserPlus, Shield, UserX } from 'lucide-react';

export function UserStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: recentUsers }
      ] = await Promise.all([
        supabase.from('utilisateurs').select('*', { count: 'exact', head: true }),
        supabase.from('utilisateurs').select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      // Pour les statistiques administrateurs et utilisateurs bloqués, 
      // nous devrons les calculer à partir des tables profiles et security_logs
      const { count: adminUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('role', ['admin', 'super_admin', 'moderator']);

      return {
        totalUsers: totalUsers || 0,
        adminUsers: adminUsers || 0,
        blockedUsers: 0, // À implémenter avec security_logs
        recentUsers: recentUsers || 0
      };
    },
    refetchInterval: 30000
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Utilisateurs",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Administrateurs",
      value: stats?.adminUsers || 0,
      icon: Shield,
      color: "text-green-600"
    },
    {
      title: "Utilisateurs Bloqués",
      value: stats?.blockedUsers || 0,
      icon: UserX,
      color: "text-red-600"
    },
    {
      title: "Nouveaux (7j)",
      value: stats?.recentUsers || 0,
      icon: UserPlus,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
