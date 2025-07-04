
import { GlobalStats } from '@/components/admin/dashboard/GlobalStats';
import { AdminOverview } from '@/components/admin/dashboard/AdminOverview';
import { InteractiveCharts } from '@/components/admin/dashboard/InteractiveCharts';
import { EnhancedRecentActivity } from '@/components/admin/dashboard/EnhancedRecentActivity';
import { PerformanceMetrics } from '@/components/admin/dashboard/PerformanceMetrics';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble complète de la plateforme EduSphere
        </p>
      </div>

      {/* Statistiques globales en temps réel */}
      <GlobalStats />

      {/* Vue d'ensemble administrative */}
      <AdminOverview />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Graphiques interactifs */}
        <div className="col-span-2">
          <InteractiveCharts />
        </div>
        
        {/* Colonne de droite */}
        <div className="space-y-6">
          {/* Métriques de performance */}
          <PerformanceMetrics />
          
          {/* Activité récente améliorée */}
          <EnhancedRecentActivity />
        </div>
      </div>
    </div>
  );
}
