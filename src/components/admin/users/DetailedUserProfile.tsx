import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  MessageSquare, 
  Users, 
  Book, 
  FileText,
  Phone,
  Ban,
  Code,
  Calendar,
  Activity,
  TrendingUp,
  Award,
  Globe
} from 'lucide-react';

interface DetailedUserProfileProps {
  userId: string;
  onBack: () => void;
}

export function DetailedUserProfile({ userId, onBack }: DetailedUserProfileProps) {
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['detailed-user-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('utilisateurs')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { data: userMessages } = useQuery({
    queryKey: ['user-messages', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          club:clubs(nom),
          destinataire:utilisateurs!messages_destinataire_id_fkey(prenom, nom)
        `)
        .eq('expediteur_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    }
  });

  const { data: userClubs } = useQuery({
    queryKey: ['user-clubs', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('club_membres')
        .select(`
          *,
          club:clubs(nom, description, domaine)
        `)
        .eq('membre_id', userId);

      if (error) throw error;
      return data || [];
    }
  });

  const { data: userProjects } = useQuery({
    queryKey: ['user-projects', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projets')
        .select('*')
        .eq('proprietaire_id', userId);

      if (error) throw error;
      return data || [];
    }
  });

  const { data: userLanguages } = useQuery({
    queryKey: ['user-languages', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('langues_parlees')
        .select('*')
        .eq('utilisateur_id', userId);

      if (error) throw error;
      return data || [];
    }
  });

  const { data: userCompetences } = useQuery({
    queryKey: ['user-competences', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competences')
        .select('*')
        .eq('utilisateur_id', userId);

      if (error) throw error;
      return data || [];
    }
  });

  const { data: userCalls } = useQuery({
    queryKey: ['user-calls', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .or(`caller_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    }
  });

  const { data: userCVs } = useQuery({
    queryKey: ['user-cvs', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('utilisateur_id', userId)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const { data: notifications } = useQuery({
    queryKey: ['user-notifications', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('utilisateur_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    }
  });

  const { data: userStats } = useQuery({
    queryKey: ['user-detailed-stats', userId],
    queryFn: async () => {
      const [messagesCount, projectsCount, clubsCount, cvsCount] = await Promise.all([
        supabase.from('messages').select('*', { count: 'exact', head: true }).eq('expediteur_id', userId),
        supabase.from('projets').select('*', { count: 'exact', head: true }).eq('proprietaire_id', userId),
        supabase.from('club_membres').select('*', { count: 'exact', head: true }).eq('membre_id', userId),
        supabase.from('cvs').select('*', { count: 'exact', head: true }).eq('utilisateur_id', userId)
      ]);

      return {
        messages: messagesCount.count || 0,
        projects: projectsCount.count || 0,
        clubs: clubsCount.count || 0,
        cvs: cvsCount.count || 0
      };
    }
  });

  const generateAvatar = (firstName: string, lastName: string) => {
    const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    return (
      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-medium">
        {initials}
      </div>
    );
  };

  const handleSuspendUser = async () => {
    const days = prompt('Nombre de jours de suspension (ou "permanent" pour une suspension permanente):');
    if (!days) return;

    try {
      const suspensionEnd = days === 'permanent' ? null : new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000).toISOString();
      
      await supabase
        .from('security_logs')
        .insert({
          user_id: userId,
          event_type: 'user_suspended',
          details: { suspension_duration: days, suspended_until: suspensionEnd }
        });

      await supabase.rpc('create_notification', {
        p_utilisateur_id: userId,
        p_type: 'account_suspended',
        p_message: `Votre compte a été suspendu ${days === 'permanent' ? 'de façon permanente' : `pour ${days} jour(s)`}`,
        p_source: 'admin'
      });

      alert('Utilisateur suspendu avec succès');
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Erreur lors de la suspension');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userProfile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Utilisateur non trouvé</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>
          <div className="flex items-center gap-4">
            {userProfile.photo_profil_url ? (
              <Avatar className="h-12 w-12">
                <AvatarImage src={userProfile.photo_profil_url} />
                <AvatarFallback>
                  {userProfile.prenom?.[0]}{userProfile.nom?.[0]}
                </AvatarFallback>
              </Avatar>
            ) : (
              generateAvatar(userProfile.prenom, userProfile.nom)
            )}
            <div>
              <h2 className="text-2xl font-bold">
                {userProfile.prenom} {userProfile.nom}
              </h2>
              <p className="text-muted-foreground">{userProfile.email}</p>
              <Badge variant="outline" className="mt-1">
                {userProfile.matricule}
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="destructive" onClick={handleSuspendUser}>
          <Ban className="h-4 w-4 mr-2" />
          Suspendre
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.messages || 0}</div>
            <p className="text-sm text-muted-foreground">messages envoyés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Projets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.projects || 0}</div>
            <p className="text-sm text-muted-foreground">projets créés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clubs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.clubs || 0}</div>
            <p className="text-sm text-muted-foreground">clubs rejoints</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              CVs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.cvs || 0}</div>
            <p className="text-sm text-muted-foreground">CVs générés</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Téléphone:</span>
              <p>{userProfile.telephone || 'Non renseigné'}</p>
            </div>
            <div>
              <span className="font-medium">Date de naissance:</span>
              <p>{userProfile.date_de_naissance ? new Date(userProfile.date_de_naissance).toLocaleDateString('fr-FR') : 'Non renseignée'}</p>
            </div>
            <div>
              <span className="font-medium">Sexe:</span>
              <p>{userProfile.sexe || 'Non renseigné'}</p>
            </div>
            <div>
              <span className="font-medium">Adresse:</span>
              <p>{userProfile.adresse || 'Non renseignée'}</p>
            </div>
            <div>
              <span className="font-medium">Bio:</span>
              <p className="text-sm">{userProfile.bio || 'Aucune bio'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Compétences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userCompetences?.map((competence) => (
                <div key={competence.id} className="flex items-center justify-between">
                  <span className="text-sm">{competence.nom}</span>
                  <Badge variant="outline">{competence.niveau}</Badge>
                </div>
              ))}
              {(!userCompetences || userCompetences.length === 0) && (
                <p className="text-muted-foreground text-sm">Aucune compétence renseignée</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Langues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userLanguages?.map((language) => (
                <div key={language.id} className="flex items-center justify-between">
                  <span className="text-sm">{language.langue}</span>
                  <Badge variant="outline">{language.niveau}</Badge>
                </div>
              ))}
              {(!userLanguages || userLanguages.length === 0) && (
                <p className="text-muted-foreground text-sm">Aucune langue renseignée</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="clubs">Clubs</TabsTrigger>
          <TabsTrigger value="projects">Projets</TabsTrigger>
          <TabsTrigger value="calls">Appels</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Messages récents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {userMessages?.map((message) => (
                  <div key={message.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">
                        {message.club ? `Club: ${message.club.nom}` : `Privé: ${message.destinataire?.prenom} ${message.destinataire?.nom}`}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-sm">{message.contenu}</p>
                  </div>
                ))}
                {(!userMessages || userMessages.length === 0) && (
                  <p className="text-muted-foreground">Aucun message trouvé</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clubs">
          <Card>
            <CardHeader>
              <CardTitle>Clubs rejoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userClubs?.map((membership) => (
                  <div key={membership.club_id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{membership.club?.nom}</h4>
                        <p className="text-sm text-muted-foreground">{membership.club?.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={membership.is_admin ? 'default' : 'secondary'}>
                          {membership.role || 'membre'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Rejoint le {new Date(membership.date_adhesion).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Projets créés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userProjects?.map((project) => (
                  <div key={project.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{project.nom}</h4>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                        {project.langages_utilises && (
                          <div className="flex gap-1 mt-2">
                            {project.langages_utilises.map((lang: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Badge variant={project.statut === 'termine' ? 'default' : 'secondary'}>
                        {project.statut}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calls">
          <Card>
            <CardHeader>
              <CardTitle>Historique des appels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {userCalls?.map((call) => (
                  <div key={call.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant={call.status === 'ended' ? 'default' : 'secondary'}>
                          {call.call_type}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {call.caller_id === userId ? 'Appel sortant' : 'Appel entrant'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {call.duration_seconds ? `${Math.floor(call.duration_seconds / 60)}min ${call.duration_seconds % 60}s` : 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(call.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {notifications?.map((notification) => (
                  <div key={notification.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={notification.read ? 'outline' : 'default'}>
                        {notification.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-sm">{notification.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
