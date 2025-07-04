
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function ContentAnalytics() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['content-analytics'],
    queryFn: async () => {
      console.log('Fetching analytics data...');

      // Données pour les livres par domaine
      const { data: booksByDomain } = await supabase
        .from('books')
        .select('domain');

      // Données pour l'évolution du contenu par mois (6 derniers mois)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: booksOverTime } = await supabase
        .from('books')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString());

      const { data: examsOverTime } = await supabase
        .from('exams')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString());

      // Données pour les notes par livre
      const { data: ratingsData } = await supabase
        .from('book_ratings')
        .select('rating, books(title)');

      // Traitement des données par domaine
      const domainCounts = {};
      booksByDomain?.forEach(book => {
        domainCounts[book.domain] = (domainCounts[book.domain] || 0) + 1;
      });

      const domainStats = Object.entries(domainCounts).map(([domain, count]) => ({
        domain,
        count: count as number
      }));

      // Traitement de l'évolution temporelle
      const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const booksCount = booksOverTime?.filter(book => {
          const bookDate = new Date(book.created_at);
          return bookDate >= monthStart && bookDate <= monthEnd;
        }).length || 0;

        const examsCount = examsOverTime?.filter(exam => {
          const examDate = new Date(exam.created_at);
          return examDate >= monthStart && examDate <= monthEnd;
        }).length || 0;

        return { 
          month: monthName, 
          livres: booksCount,
          examens: examsCount,
          total: booksCount + examsCount
        };
      });

      // Distribution des notes
      const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
        rating: `${rating} étoile${rating > 1 ? 's' : ''}`,
        count: ratingsData?.filter(r => r.rating === rating).length || 0
      }));

      // Top 5 des livres les mieux notés
      const bookRatings = {};
      ratingsData?.forEach(rating => {
        if (rating.books?.title) {
          if (!bookRatings[rating.books.title]) {
            bookRatings[rating.books.title] = { sum: 0, count: 0 };
          }
          bookRatings[rating.books.title].sum += rating.rating;
          bookRatings[rating.books.title].count += 1;
        }
      });

      const topBooks = Object.entries(bookRatings)
        .map(([title, data]: [string, any]) => ({
          title: title.length > 30 ? title.substring(0, 30) + '...' : title,
          average: (data.sum / data.count).toFixed(1),
          count: data.count
        }))
        .sort((a, b) => parseFloat(b.average) - parseFloat(a.average))
        .slice(0, 5);

      console.log('Analytics data processed:', {
        domainStats,
        monthlyData,
        ratingDistribution,
        topBooks
      });

      return {
        domainStats,
        monthlyData,
        ratingDistribution,
        topBooks
      };
    },
    refetchInterval: 10 * 60 * 1000 // Refresh every 10 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Chargement des analyses...</CardTitle>
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
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Évolution du contenu</CardTitle>
            <CardDescription>
              Nombre de livres et examens ajoutés par mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                livres: { label: "Livres", color: "#8884d8" },
                examens: { label: "Examens", color: "#82ca9d" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData?.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="livres" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="examens" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par domaine</CardTitle>
            <CardDescription>
              Distribution des livres par domaine d'étude
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: "Nombre", color: "#8884d8" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData?.domainStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="domain" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution des évaluations</CardTitle>
            <CardDescription>
              Répartition des notes données par les utilisateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: "Nombre", color: "#8884d8" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData?.ratingDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ rating, count }) => `${rating}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analyticsData?.ratingDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 des livres les mieux notés</CardTitle>
            <CardDescription>
              Livres avec les meilleures notes moyennes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                average: { label: "Note moyenne", color: "#ffc658" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData?.topBooks || []} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 5]} />
                  <YAxis dataKey="title" type="category" width={150} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="average" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
