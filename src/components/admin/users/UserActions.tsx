
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
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
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { toast } from 'sonner';
import { MoreHorizontal, Shield, ShieldOff, Edit, UserX, Crown, User, UserCheck } from 'lucide-react';

type AdminRole = 'user' | 'super_admin' | 'moderator' | 'content_admin';

interface UserActionsProps {
  user: any;
  onUpdate: () => void;
}

export function UserActions({ user, onUpdate }: UserActionsProps) {
  const { role: currentUserRole } = useAdminAuth();
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showUnblockDialog, setShowUnblockDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const canManageRoles = currentUserRole === 'super_admin';
  const canBlockUser = ['super_admin', 'moderator'].includes(currentUserRole || '');
  
  // Check if user is blocked by looking for a block log without an unblock log
  const [isUserBlocked, setIsUserBlocked] = useState(false);

  // Check block status on component mount
  useEffect(() => {
    const checkBlockStatus = async () => {
      const { data: blockLogs } = await supabase
        .from('security_logs')
        .select('*')
        .eq('user_id', user.id)
        .in('event_type', ['user_blocked', 'user_unblocked'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (blockLogs && blockLogs.length > 0) {
        setIsUserBlocked(blockLogs[0].event_type === 'user_blocked');
      }
    };

    checkBlockStatus();
  }, [user.id]);

  const handleBlockUser = async () => {
    setIsLoading(true);
    try {
      // Log the blocking action
      const { error } = await supabase
        .from('security_logs')
        .insert({
          event_type: 'user_blocked',
          user_id: user.id,
          details: { 
            blocked_by: (await supabase.auth.getUser()).data.user?.id,
            reason: 'Blocked by admin'
          }
        });

      if (error) throw error;

      setIsUserBlocked(true);
      toast.success('Utilisateur bloqué avec succès');
      onUpdate();
    } catch (error) {
      toast.error('Erreur lors du blocage de l\'utilisateur');
      console.error('Error blocking user:', error);
    } finally {
      setIsLoading(false);
      setShowBlockDialog(false);
    }
  };

  const handleUnblockUser = async () => {
    setIsLoading(true);
    try {
      // Log the unblocking action
      const { error } = await supabase
        .from('security_logs')
        .insert({
          event_type: 'user_unblocked',
          user_id: user.id,
          details: { 
            unblocked_by: (await supabase.auth.getUser()).data.user?.id
          }
        });

      if (error) throw error;

      setIsUserBlocked(false);
      toast.success('Utilisateur débloqué avec succès');
      onUpdate();
    } catch (error) {
      toast.error('Erreur lors du déblocage de l\'utilisateur');
      console.error('Error unblocking user:', error);
    } finally {
      setIsLoading(false);
      setShowUnblockDialog(false);
    }
  };

  const handleChangeRole = async (newRole: AdminRole) => {
    if (!canManageRoles) {
      toast.error('Vous n\'avez pas les permissions pour modifier les rôles');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', user.id);

      if (error) throw error;

      // Log the role change
      await supabase
        .from('security_logs')
        .insert({
          event_type: 'role_changed',
          user_id: user.id,
          details: { 
            changed_by: (await supabase.auth.getUser()).data.user?.id,
            old_role: user.role,
            new_role: newRole
          }
        });

      toast.success('Rôle modifié avec succès');
      onUpdate();
    } catch (error) {
      toast.error('Erreur lors de la modification du rôle');
      console.error('Error updating role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Edit className="h-4 w-4 mr-2" />
            Modifier le profil
          </DropdownMenuItem>
          
          {canManageRoles && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleChangeRole('user')}>
                <User className="h-4 w-4 mr-2" />
                Utilisateur standard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleChangeRole('content_admin')}>
                <Shield className="h-4 w-4 mr-2" />
                Admin contenu
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleChangeRole('moderator')}>
                <ShieldOff className="h-4 w-4 mr-2" />
                Modérateur
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleChangeRole('super_admin')}>
                <Crown className="h-4 w-4 mr-2" />
                Super admin
              </DropdownMenuItem>
            </>
          )}

          {canBlockUser && (
            <>
              <DropdownMenuSeparator />
              {isUserBlocked ? (
                <DropdownMenuItem 
                  onClick={() => setShowUnblockDialog(true)}
                  className="text-green-600"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Débloquer l'utilisateur
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem 
                  onClick={() => setShowBlockDialog(true)}
                  className="text-red-600"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Bloquer l'utilisateur
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bloquer l'utilisateur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir bloquer {user.first_name} {user.last_name} ? 
              Cette action empêchera l'utilisateur d'accéder à la plateforme.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBlockUser}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Blocage...' : 'Bloquer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showUnblockDialog} onOpenChange={setShowUnblockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Débloquer l'utilisateur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir débloquer {user.first_name} {user.last_name} ? 
              L'utilisateur pourra à nouveau accéder à la plateforme.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUnblockUser}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Déblocage...' : 'Débloquer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
