
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Flag, 
  MoreHorizontal, 
  CheckCircle, 
  UserX, 
  AlertTriangle,
  Eye
} from 'lucide-react';

export function ReportsManagement() {
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: reports, refetch } = useQuery({
    queryKey: ['user-reports'],
    queryFn: async () => {
      // Simuler des signalements pour l'instant
      // Dans la nouvelle structure, il faudrait créer une table 'signalements' ou similaire
      const mockReports = [
        {
          id: '1',
          utilisateur: {
            nom: 'Dupont',
            prenom: 'Jean',
            email: 'jean.dupont@example.com'
          },
          type_signalement: 'spam',
          raison: 'Messages répétitifs dans le chat',
          created_at: new Date().toISOString(),
          statut: 'en_attente'
        },
        {
          id: '2',
          utilisateur: {
            nom: 'Martin',
            prenom: 'Marie',
            email: 'marie.martin@example.com'
          },
          type_signalement: 'harassment',
          raison: 'Comportement inapproprié',
          created_at: new Date().toISOString(),
          statut: 'en_attente'
        }
      ];

      return mockReports;
    }
  });

  const handleMarkResolved = async (reportId: string) => {
    setIsLoading(true);
    try {
      // Implémenter la logique de résolution
      toast.success('Signalement marqué comme résolu');
      refetch();
    } catch (error) {
      toast.error('Erreur lors de la résolution du signalement');
      console.error('Error resolving report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedReport) return;
    
    setIsLoading(true);
    try {
      // Implémenter la logique de blocage
      toast.success('Utilisateur bloqué et signalement résolu');
      setShowBlockDialog(false);
      setSelectedReport(null);
    } catch (error) {
      toast.error('Erreur lors du blocage de l\'utilisateur');
      console.error('Error blocking user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getReportTypeVariant = (reportType: string) => {
    switch (reportType) {
      case 'spam':
        return 'secondary';
      case 'harassment':
        return 'destructive';
      case 'inappropriate_content':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-600" />
            Signalements d'Utilisateurs ({reports?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!reports || reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Aucun signalement en attente</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur signalé</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Détails</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {report.utilisateur?.prenom} {report.utilisateur?.nom}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {report.utilisateur?.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getReportTypeVariant(report.type_signalement || 'other')}>
                        {report.type_signalement || 'Autre'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(report.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {report.raison || 'Aucun détail fourni'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleMarkResolved(report.id)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marquer résolu
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedReport(report);
                              setShowBlockDialog(true);
                            }}
                            className="text-red-600"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Bloquer utilisateur
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bloquer l'utilisateur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir bloquer {selectedReport?.utilisateur?.prenom} {selectedReport?.utilisateur?.nom} ? 
              Cette action empêchera l'utilisateur d'accéder à la plateforme et marquera le signalement comme résolu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBlockUser}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Blocage...' : 'Bloquer et résoudre'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
