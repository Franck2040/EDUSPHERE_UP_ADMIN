
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Settings, Building } from 'lucide-react';

interface CommunityStatsProps {
  communities: any[];
  clubs: any[];
}

export function CommunityStats({ communities, clubs }: CommunityStatsProps) {
  const totalCommunities = communities.length;
  const totalClubs = clubs.length;
  const totalMembers = clubs.reduce((acc, club) => acc + (club.club_membres?.[0]?.count || 0), 0);
  const totalMessages = clubs.reduce((acc, club) => acc + (club.messages?.[0]?.count || 0), 0);

  const stats = [
    {
      title: 'Communautés',
      value: totalCommunities,
      icon: Building,
      description: 'Communautés créées'
    },
    {
      title: 'Clubs',
      value: totalClubs,
      icon: Users,
      description: 'Clubs actifs'
    },
    {
      title: 'Membres',
      value: totalMembers,
      icon: Users,
      description: 'Membres total'
    },
    {
      title: 'Messages',
      value: totalMessages,
      icon: MessageSquare,
      description: 'Messages échangés'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
