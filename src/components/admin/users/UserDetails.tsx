
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Mail, Calendar, MapPin, School, Languages, Activity } from 'lucide-react';

interface UserDetailsProps {
  userId: string;
  onBack: () => void;
}

export function UserDetails({ userId, onBack }: UserDetailsProps) {
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { data: userSchools } = useQuery({
    queryKey: ['user-schools', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_schools')
        .select(`
          *,
          schools (name, logo_url),
          academic_levels (name)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  const { data: userLanguages } = useQuery({
    queryKey: ['user-languages', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_languages')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  const { data: userActivity } = useQuery({
    queryKey: ['user-activity', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

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
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>
        <h2 className="text-2xl font-bold">
          Profil de {userProfile.first_name} {userProfile.last_name}
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations de base */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userProfile.avatar_url} />
                <AvatarFallback>
                  {userProfile.first_name?.[0]}{userProfile.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{userProfile.email}</span>
            </div>
            
            {userProfile.birth_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Né(e) le {new Date(userProfile.birth_date).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}

            {userProfile.matricule && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Matricule:</span>
                <Badge variant="outline">{userProfile.matricule}</Badge>
              </div>
            )}

            {userProfile.gender && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Genre:</span>
                <span>{userProfile.gender}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Rôle:</span>
              <Badge variant="secondary">{userProfile.role}</Badge>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Inscrit le {new Date(userProfile.created_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Établissements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-4 w-4" />
              Établissements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userSchools && userSchools.length > 0 ? (
              <div className="space-y-3">
                {userSchools.map((school) => (
                  <div key={school.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    {school.schools?.logo_url && (
                      <img 
                        src={school.schools.logo_url} 
                        alt={school.schools?.name}
                        className="h-8 w-8 rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{school.schools?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {school.academic_levels?.name}
                      </div>
                      {school.is_current && (
                        <Badge variant="outline" className="mt-1">Actuel</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Aucun établissement renseigné</p>
            )}
          </CardContent>
        </Card>

        {/* Langues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Langues
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userLanguages && userLanguages.length > 0 ? (
              <div className="space-y-2">
                {userLanguages.map((lang) => (
                  <div key={lang.id} className="flex items-center justify-between">
                    <span>{lang.language_name}</span>
                    <Badge variant="outline">{lang.proficiency_level}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Aucune langue renseignée</p>
            )}
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userActivity && userActivity.length > 0 ? (
              <div className="space-y-3">
                {userActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <span className="font-medium">{activity.activity_type}</span>
                      <span className="text-muted-foreground"> - {activity.resource_type}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Aucune activité récente</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
