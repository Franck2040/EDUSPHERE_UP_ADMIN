
-- Créer la table communautés
CREATE TABLE public.communautes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom text NOT NULL,
  description text,
  proprietaire_id uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  statut text DEFAULT 'active' -- active, suspended, inactive
);

-- Créer la table de liaison entre communautés et clubs
CREATE TABLE public.communaute_clubs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  communaute_id uuid REFERENCES public.communautes(id) ON DELETE CASCADE,
  club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE,
  date_ajout timestamp with time zone DEFAULT now(),
  UNIQUE(communaute_id, club_id)
);

-- Politiques RLS pour communautés
ALTER TABLE public.communautes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communaute_clubs ENABLE ROW LEVEL SECURITY;

-- Policies pour communautés
CREATE POLICY "Tous peuvent voir les communautés actives" ON public.communautes
FOR SELECT USING (statut = 'active' OR auth.uid() = proprietaire_id);

CREATE POLICY "Utilisateurs peuvent créer des communautés" ON public.communautes
FOR INSERT WITH CHECK (auth.uid() = proprietaire_id);

CREATE POLICY "Propriétaires peuvent modifier leurs communautés" ON public.communautes
FOR UPDATE USING (auth.uid() = proprietaire_id);

-- Policies pour liaison communauté-clubs
CREATE POLICY "Voir liaisons communauté-clubs" ON public.communaute_clubs
FOR SELECT USING (true);

CREATE POLICY "Gérer liaisons communauté-clubs" ON public.communaute_clubs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.communautes 
    WHERE id = communaute_clubs.communaute_id 
    AND proprietaire_id = auth.uid()
  )
);
