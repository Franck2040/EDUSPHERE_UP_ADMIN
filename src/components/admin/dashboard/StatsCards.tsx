
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, GraduationCap, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [usersResult, booksResult, workshopsResult, clubsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('books').select('id', { count: 'exact', head: true }),
        supabase.from('workshops').select('id', { count: 'exact', head: true }),
        supabase.from('clubs').select('id', { count: 'exact', head: true })
      ]);

      console.log('Stats results:', { usersResult, booksResult, workshopsResult, clubsResult });

      return {
        totalUsers: usersResult.count || 0,
        totalBooks: booksResult.count || 0,
        totalWorkshops: workshopsResult.count || 0,
        totalClubs: clubsResult.count || 0
      };
    },
    refetchInterval: 5 * 60 * 1000 // Refresh every 5 minutes
  });

  const statsData = [
    {
      title: "Utilisateurs",
      value: stats?.totalUsers || 0,
      icon: Users,
      description: "Total des utilisateurs inscrits"
    },
    {
      title: "Livres",
      value: stats?.totalBooks || 0,
      icon: BookOpen,
      description: "Livres disponibles"
    },
    {
      title: "Ateliers",
      value: stats?.totalWorkshops || 0,
      icon: GraduationCap,
      description: "Ateliers créés"
    },
    {
      title: "Clubs",
      value: stats?.totalClubs || 0,
      icon: AlertTriangle,
      description: "Clubs actifs"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stat.value.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
