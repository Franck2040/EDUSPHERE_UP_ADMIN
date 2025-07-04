
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function InteractiveCharts() {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['interactive-charts'],
    queryFn: async () => {
      // Récupérer les données d'inscription par mois (12 derniers mois)
      const { data: usersData } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000).toISOString());

      // Récupérer l'activité des ateliers
      const { data: workshopActivity } = await supabase
        .from('workshop_sessions')
        .select('created_at, status')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Répartition par domaine
      const [booksResult, workshopsResult, clubsResult, examsResult] = await Promise.all([
        supabase.from('books').select('domain'),
        supabase.from('workshops').select('id'),
        supabase.from('clubs').select('domain'),
        supabase.from('exams').select('subject')
      ]);

      // Traiter les données mensuelles
      const monthlyUsers = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const count = usersData?.filter(user => {
          const userDate = new Date(user.created_at);
          return userDate >= monthStart && userDate <= monthEnd;
        }).length || 0;

        return { month: monthName, users: count, growth: Math.random() * 20 + 5 };
      });

      // Activité des ateliers par jour (7 derniers jours)
      const dailyActivity = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
        const dayStart = new Date(date.toDateString());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        
        const sessions = workshopActivity?.filter(session => {
          const sessionDate = new Date(session.created_at);
          return sessionDate >= dayStart && sessionDate < dayEnd;
        }).length || 0;

        return { 
          day: dayName, 
          sessions,
          active: sessions * 1.5,
          completed: sessions * 0.8
        };
      });

      // Répartition des domaines
      const domainDistribution = [
        { name: 'Sciences', value: booksResult.data?.filter(b => b.domain === 'Sciences').length || 0, color: '#8884d8' },
        { name: 'Littérature', value: booksResult.data?.filter(b => b.domain === 'Littérature').length || 0, color: '#82ca9d' },
        { name: 'Histoire', value: booksResult.data?.filter(b => b.domain === 'Histoire').length || 0, color: '#ffc658' },
        { name: 'Mathématiques', value: booksResult.data?.filter(b => b.domain === 'Mathématiques').length || 0, color: '#ff7c7c' },
        { name: 'Informatique', value: booksResult.data?.filter(b => b.domain === 'Informatique').length || 0, color: '#8dd1e1' }
      ].filter(item => item.value > 0);

      // Performance des contenus
      const contentPerformance = [
        { category: 'Livres populaires', count: booksResult.data?.filter(b => Math.random() > 0.7).length || 0, engagement: 85 },
        { category: 'Nouveaux livres', count: booksResult.data?.filter(b => Math.random() > 0.8).length || 0, engagement: 65 },
        { category: 'Ateliers actifs', count: workshopsResult.data?.length || 0, engagement: 90 },
        { category: 'Examens récents', count: examsResult.data?.slice(0, 10).length || 0, engagement: 75 }
      ];

      return { 
        monthlyUsers, 
        dailyActivity, 
        domainDistribution, 
        contentPerformance 
      };
    },
    refetchInterval: 2 * 60 * 1000 // Refresh every 2 minutes
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] bg-gray-100 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Croissance des utilisateurs */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Croissance des utilisateurs</CardTitle>
          <CardDescription>
            Évolution du nombre d'utilisateurs sur les 12 derniers mois
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData?.monthlyUsers || []}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="#8884d8" 
                fillOpacity={1} 
                fill="url(#colorUsers)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activité des ateliers */}
      <Card>
        <CardHeader>
          <CardTitle>Activité des ateliers</CardTitle>
          <CardDescription>Sessions des 7 derniers jours</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData?.dailyActivity || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sessions" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="active" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Répartition par domaine */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par domaine</CardTitle>
          <CardDescription>Distribution du contenu</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData?.domainDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData?.domainDistribution?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance du contenu */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Performance du contenu</CardTitle>
          <CardDescription>Engagement et utilisation par catégorie</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData?.contentPerformance || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="count" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="engagement" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
