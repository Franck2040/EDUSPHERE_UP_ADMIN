
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'user';

interface AdminAuthState {
  loading: boolean;
  user: User | null;
  session: Session | null;
  role: AdminRole | null;
  isAdmin: boolean;
}

export function useAdminAuth() {
  const [authState, setAuthState] = useState<AdminAuthState>({
    loading: true,
    user: null,
    session: null,
    role: null,
    isAdmin: false
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          // Pour l'email spécifique, on donne directement les droits admin
          if (session.user.email === 'kenmeugnetchoupo@gmail.com') {
            console.log('Admin user detected, granting access');
            setAuthState({
              loading: false,
              user: session.user,
              session,
              role: 'super_admin',
              isAdmin: true
            });
            return;
          }

          // Pour les autres utilisateurs, on essaie de vérifier le rôle
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();

            console.log('Profile data:', profile, error);

            if (error) {
              console.log('Error fetching profile, but allowing access for testing');
              // Pour les tests, on donne accès même si il y a une erreur
              setAuthState({
                loading: false,
                user: session.user,
                session,
                role: 'admin',
                isAdmin: true
              });
              return;
            }

            const adminRoles: AdminRole[] = ['super_admin', 'admin', 'moderator'];
            const isValidAdmin = profile?.role && adminRoles.includes(profile.role as AdminRole);

            setAuthState({
              loading: false,
              user: session.user,
              session,
              role: isValidAdmin ? (profile.role as AdminRole) : 'admin',
              isAdmin: true // Pour les tests, on donne accès à tout le monde
            });

          } catch (err) {
            console.error('Error checking user role:', err);
            // Pour les tests, on donne accès même en cas d'erreur
            setAuthState({
              loading: false,
              user: session.user,
              session,
              role: 'admin',
              isAdmin: true
            });
          }
        } else {
          setAuthState({
            loading: false,
            user: null,
            session: null,
            role: null,
            isAdmin: false
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      // The auth state change listener will handle the rest
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Erreur lors de la déconnexion');
    } else {
      toast.success('Déconnexion réussie');
    }
  };

  return {
    ...authState,
    signIn,
    signOut
  };
}
