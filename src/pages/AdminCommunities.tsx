
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CommunityManagement } from '@/components/admin/communities/CommunityManagement';
import { ClubManagement } from '@/components/admin/communities/ClubManagement';
import { WorkshopManagement } from '@/components/admin/communities/WorkshopManagement';
import { MessageModeration } from '@/components/admin/communities/MessageModeration';
import { MemberManagement } from '@/components/admin/communities/MemberManagement';
import { CommunityStats } from '@/components/admin/communities/CommunityStats';
import { Button } from '@/components/ui/button';
import { Activity, Users, MessageSquare, Settings, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminCommunities() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data: communautes, isLoading: communautesLoading } = useQuery({
    queryKey: ['admin-communautes', refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communautes')
        .select(`
          *,
          communaute_clubs(
            club_id,
            clubs(id, nom, description, domaine, created_at, proprietaire_id)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const { data: clubs, isLoading: clubsLoading } = useQuery({
    queryKey: ['admin-clubs', refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clubs')
        .select(`
          *,
          club_membres(count),
          messages(count),
          ateliers_travail(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion des Communautés
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les communautés, groupes, ateliers et surveillez les activités
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <Activity className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>

      <CommunityStats communities={communautes || []} clubs={clubs || []} />

      <Tabs defaultValue="communities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="communities" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Communautés
          </TabsTrigger>
          <TabsTrigger value="clubs" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Clubs (Groupes)
          </TabsTrigger>
          <TabsTrigger value="workshops" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Ateliers
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Membres
          </TabsTrigger>
        </TabsList>

        <TabsContent value="communities">
          <CommunityManagement 
            communities={communautes || []} 
            isLoading={communautesLoading}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="clubs">
          <ClubManagement 
            clubs={clubs || []} 
            isLoading={clubsLoading}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="workshops">
          <WorkshopManagement onRefresh={handleRefresh} />
        </TabsContent>

        <TabsContent value="messages">
          <MessageModeration onRefresh={handleRefresh} />
        </TabsContent>

        <TabsContent value="members">
          <MemberManagement onRefresh={handleRefresh} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
