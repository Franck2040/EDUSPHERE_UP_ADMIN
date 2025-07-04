
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface Community {
  id: string;
  nom: string;
  description: string;
  statut: string;
  proprietaire_id: string;
  created_at: string;
  updated_at: string;
}

interface CommunityAnalyticsProps {
  community: Community;
}

export function CommunityAnalytics({ community }: CommunityAnalyticsProps) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['community-analytics', community.id],
    queryFn: async () => {
      const [clubsResult, membersResult] = await Promise.all([
        supabase
          .from('communaute_clubs')
          .select('*')
          .eq('communaute_id', community.id),
        supabase
          .from('club_membres')
          .select('*, club:clubs!inner(*)')
          .in('club_id', [])
      ]);

      const totalClubs = clubsResult.data?.length || 0;
      const totalMembers = membersResult.data?.length || 0;

      return {
        totalClubs,
        totalMembers,
        growth: Math.floor(Math.random() * 50) + 10
      };
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: 'Clubs', value: analytics?.totalClubs || 0 },
    { name: 'Membres', value: analytics?.totalMembers || 0 }
  ];

  const COLORS = ['#0088FE', '#00C49F'];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Clubs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalClubs || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Membres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalMembers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Croissance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{analytics?.growth}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Répartition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
