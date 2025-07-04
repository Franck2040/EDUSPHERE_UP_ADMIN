
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkshopManager } from '@/components/admin/workshops/WorkshopManager';
import { WorkshopStats } from '@/components/admin/workshops/WorkshopStats';
import { SessionManager } from '@/components/admin/workshops/SessionManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Users, BarChart3 } from 'lucide-react';

export default function AdminWorkshops() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Ateliers</h1>
          <p className="text-muted-foreground">
            Gérez les ateliers, sessions et environnements de développement
          </p>
        </div>
      </div>

      <WorkshopStats />

      <Tabs defaultValue="workshops" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workshops" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Ateliers
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analyses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workshops">
          <WorkshopManager />
        </TabsContent>

        <TabsContent value="sessions">
          <SessionManager />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analyses des Ateliers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Fonctionnalité d'analyse avancée à venir...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
