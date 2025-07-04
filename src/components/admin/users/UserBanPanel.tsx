
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserX, UserCheck, AlertTriangle } from 'lucide-react';

export function UserBanPanel() {
  const [isLoading, setIsLoading] = useState(false);

  const { data: bannedUsers, refetch } = useQuery({
    queryKey: ['banned-users'],
    queryFn: async () => {
      // Get users who have been blocked (latest block log without unblock)
      const { data: blockLogs, error } = await supabase
        .from('security_logs')
        .select(`
          *,
          profiles(id, first_name, last_name, email)
        `)
        .eq('event_type', 'user_blocked')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out users who have been unblocked
      const blockedUsers = [];
      const processedUsers = new Set();

      for (const log of blockLogs) {
        if (processedUsers.has(log.user_id)) continue;
        
        // Check if user has been unblocked after this block
        const { data: unblockLogs } = await supabase
          .from('security_logs')
          .select('created_at')
          .eq('user_id', log.user_id)
          .eq('event_type', 'user_unblocked')
          .gt('created_at', log.created_at)
          .limit(1);

        if (!unblockLogs || unblockLogs.length === 0) {
          blockedUsers.push(log);
        }
        
        processedUsers.add(log.user_id);
      }

      return blockedUsers;
    }
  });

  const handleUnblockUser = async (userId: string, userName: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('security_logs')
        .insert({
          event_type: 'user_unblocked',
          user_id: userId,
          details: { 
            unblocked_by: (await supabase.auth.getUser()).data.user?.id
          }
        });

      if (error) throw error;

      toast.success(`${userName} a été débloqué avec succès`);
      refetch();
    } catch (error) {
      toast.error('Erreur lors du déblocage de l\'utilisateur');
      console.error('Error unblocking user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          Utilisateurs Bloqués ({bannedUsers?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!bannedUsers || bannedUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserCheck className="h-8 w-8 mx-auto mb-2" />
            <p>Aucun utilisateur bloqué</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date de blocage</TableHead>
                <TableHead>Bloqué par</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bannedUsers.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                        <UserX className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {log.profiles?.first_name} {log.profiles?.last_name}
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          Bloqué
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{log.profiles?.email}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {new Date(log.created_at).toLocaleDateString('fr-FR', {
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
                      Admin
                    </span>
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          disabled={isLoading}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Débloquer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Débloquer l'utilisateur</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir débloquer {log.profiles?.first_name} {log.profiles?.last_name} ? 
                            L'utilisateur pourra à nouveau accéder à la plateforme.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleUnblockUser(
                              log.user_id, 
                              `${log.profiles?.first_name} ${log.profiles?.last_name}`
                            )}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Débloquer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
