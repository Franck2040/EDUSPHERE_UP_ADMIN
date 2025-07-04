
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function DashboardCharts() {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['admin-charts'],
    queryFn: async () => {
      // Récupérer les données d'inscription par mois (6 derniers mois)
      const { data: usersData } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

      // Récupérer la répartition du contenu
      const [booksResult, workshopsResult, clubsResult, examsResult] = await Promise.all([
        supabase.from('books').select('id', { count: 'exact', head: true }),
        supabase.from('workshops').select('id', { count: 'exact', head: true }),
        supabase.from('clubs').select('id', { count: 'exact', head: true }),
        supabase.from('exams').select('id', { count: 'exact', head: true })
      ]);

      // Traiter les données d'inscription par mois
      const monthlyUsers = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const count = usersData?.filter(user => {
          const userDate = new Date(user.created_at);
          return userDate >= monthStart && userDate <= monthEnd;
        }).length || 0;

        return { month: monthName, users: count };
      });

      const contentStats = [
        { category: 'Livres', count: booksResult.count || 0 },
        { category: 'Examens', count: examsResult.count || 0 },
        { category: 'Ateliers', count: workshopsResult.count || 0 },
        { category: 'Clubs', count: clubsResult.count || 0 },
      ];

      return { monthlyUsers, contentStats };
    },
    refetchInterval: 10 * 60 * 1000 // Refresh every 10 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Chargement des données...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Croissance des utilisateurs</CardTitle>
          <CardDescription>
            Évolution du nombre d'utilisateurs au cours des 6 derniers mois
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData?.monthlyUsers || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Répartition du contenu</CardTitle>
          <CardDescription>
            Distribution du contenu par catégorie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData?.contentStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
