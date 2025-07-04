export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      atelier_participants: {
        Row: {
          atelier_id: string
          date_rejoint: string | null
          participant_id: string
        }
        Insert: {
          atelier_id: string
          date_rejoint?: string | null
          participant_id: string
        }
        Update: {
          atelier_id?: string
          date_rejoint?: string | null
          participant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "atelier_participants_atelier_id_fkey"
            columns: ["atelier_id"]
            isOneToOne: false
            referencedRelation: "ateliers_travail"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atelier_participants_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
        ]
      }
      ateliers_travail: {
        Row: {
          club_id: string | null
          created_at: string | null
          description: string | null
          id: string
          nom: string
          proprietaire_id: string | null
          updated_at: string | null
          visibilite: string | null
        }
        Insert: {
          club_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          nom: string
          proprietaire_id?: string | null
          updated_at?: string | null
          visibilite?: string | null
        }
        Update: {
          club_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          nom?: string
          proprietaire_id?: string | null
          updated_at?: string | null
          visibilite?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ateliers_travail_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ateliers_travail_proprietaire_id_fkey"
            columns: ["proprietaire_id"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          call_type: string
          caller_id: string
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          metadata: Json | null
          receiver_id: string
          started_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          call_type: string
          caller_id: string
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          receiver_id: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          call_type?: string
          caller_id?: string
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          receiver_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          created_at: string | null
          id: string
          isuser: boolean
          text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          isuser: boolean
          text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          isuser?: boolean
          text?: string
          user_id?: string | null
        }
        Relationships: []
      }
      club_membres: {
        Row: {
          admin_id: string | null
          club_id: string
          date_adhesion: string | null
          is_admin: boolean | null
          membre_id: string
          role: string | null
        }
        Insert: {
          admin_id?: string | null
          club_id: string
          date_adhesion?: string | null
          is_admin?: boolean | null
          membre_id: string
          role?: string | null
        }
        Update: {
          admin_id?: string | null
          club_id?: string
          date_adhesion?: string | null
          is_admin?: boolean | null
          membre_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_membres_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_membres_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          description: string | null
          domaine: string
          id: string
          nom: string
          proprietaire_id: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          domaine: string
          id?: string
          nom: string
          proprietaire_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          domaine?: string
          id?: string
          nom?: string
          proprietaire_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clubs_proprietaire_id_fkey"
            columns: ["proprietaire_id"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
        ]
      }
      commentaires: {
        Row: {
          auteur_id: string | null
          contenu: string
          created_at: string | null
          id: string
          publication_id: string | null
        }
        Insert: {
          auteur_id?: string | null
          contenu: string
          created_at?: string | null
          id?: string
          publication_id?: string | null
        }
        Update: {
          auteur_id?: string | null
          contenu?: string
          created_at?: string | null
          id?: string
          publication_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commentaires_auteur_id_fkey"
            columns: ["auteur_id"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commentaires_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      communaute_clubs: {
        Row: {
          club_id: string | null
          communaute_id: string | null
          date_ajout: string | null
          id: string
        }
        Insert: {
          club_id?: string | null
          communaute_id?: string | null
          date_ajout?: string | null
          id?: string
        }
        Update: {
          club_id?: string | null
          communaute_id?: string | null
          date_ajout?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communaute_clubs_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communaute_clubs_communaute_id_fkey"
            columns: ["communaute_id"]
            isOneToOne: false
            referencedRelation: "communautes"
            referencedColumns: ["id"]
          },
        ]
      }
      communautes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          nom: string
          proprietaire_id: string | null
          statut: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          nom: string
          proprietaire_id?: string | null
          statut?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          nom?: string
          proprietaire_id?: string | null
          statut?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      competences: {
        Row: {
          certifications: string | null
          created_at: string | null
          description: string | null
          experience: string | null
          id: string
          niveau: string | null
          nom: string
          type: string
          utilisateur_id: string | null
          visibilite: string | null
        }
        Insert: {
          certifications?: string | null
          created_at?: string | null
          description?: string | null
          experience?: string | null
          id?: string
          niveau?: string | null
          nom: string
          type: string
          utilisateur_id?: string | null
          visibilite?: string | null
        }
        Update: {
          certifications?: string | null
          created_at?: string | null
          description?: string | null
          experience?: string | null
          id?: string
          niveau?: string | null
          nom?: string
          type?: string
          utilisateur_id?: string | null
          visibilite?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competences_utilisateur_id_fkey"
            columns: ["utilisateur_id"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
        ]
      }
      cvs: {
        Row: {
          contenu_pdf_url: string
          generated_at: string | null
          id: string
          type_entreprise_cible: string | null
          utilisateur_id: string | null
        }
        Insert: {
          contenu_pdf_url: string
          generated_at?: string | null
          id?: string
          type_entreprise_cible?: string | null
          utilisateur_id?: string | null
        }
        Update: {
          contenu_pdf_url?: string
          generated_at?: string | null
          id?: string
          type_entreprise_cible?: string | null
          utilisateur_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cvs_utilisateur_id_fkey"
            columns: ["utilisateur_id"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
        ]
      }
      demandes_adhesion: {
        Row: {
          club_id: string | null
          created_at: string | null
          demandeur_id: string | null
          id: string
          message: string | null
          statut: string | null
          updated_at: string | null
        }
        Insert: {
          club_id?: string | null
          created_at?: string | null
          demandeur_id?: string | null
          id?: string
          message?: string | null
          statut?: string | null
          updated_at?: string | null
        }
        Update: {
          club_id?: string | null
          created_at?: string | null
          demandeur_id?: string | null
          id?: string
          message?: string | null
          statut?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demandes_adhesion_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demandes_adhesion_demandeur_id_fkey"
            columns: ["demandeur_id"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
        ]
      }
      examens: {
        Row: {
          annee: number
          contenu_url: string
          created_at: string | null
          description: string | null
          difficulte: string | null
          ecole: string
          id: string
          is_new: boolean | null
          matiere: string
          niveau: string
          tags: string | null
          updated_at: string | null
        }
        Insert: {
          annee: number
          contenu_url: string
          created_at?: string | null
          description?: string | null
          difficulte?: string | null
          ecole: string
          id?: string
          is_new?: boolean | null
          matiere: string
          niveau: string
          tags?: string | null
          updated_at?: string | null
        }
        Update: {
          annee?: number
          contenu_url?: string
          created_at?: string | null
          description?: string | null
          difficulte?: string | null
          ecole?: string
          id?: string
          is_new?: boolean | null
          matiere?: string
          niveau?: string
          tags?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      langues_parlees: {
        Row: {
          certification: string | null
          created_at: string | null
          id: string
          langue: string
          niveau: string
          updated_at: string | null
          utilisateur_id: string
          visibilite: string | null
        }
        Insert: {
          certification?: string | null
          created_at?: string | null
          id?: string
          langue: string
          niveau: string
          updated_at?: string | null
          utilisateur_id: string
          visibilite?: string | null
        }
        Update: {
          certification?: string | null
          created_at?: string | null
          id?: string
          langue?: string
          niveau?: string
          updated_at?: string | null
          utilisateur_id?: string
          visibilite?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "langues_parlees_utilisateur_id_fkey"
            columns: ["utilisateur_id"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
        ]
      }
      livres: {
        Row: {
          auteur: string | null
          couverture_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          document_url: string
          domaine: string
          id: string
          is_new: boolean | null
          is_popular: boolean | null
          niveau: string | null
          particularite: string | null
          popularite: number | null
          sous_domaine: string | null
          titre: string
          updated_at: string | null
        }
        Insert: {
          auteur?: string | null
          couverture_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_url: string
          domaine: string
          id?: string
          is_new?: boolean | null
          is_popular?: boolean | null
          niveau?: string | null
          particularite?: string | null
          popularite?: number | null
          sous_domaine?: string | null
          titre: string
          updated_at?: string | null
        }
        Update: {
          auteur?: string | null
          couverture_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_url?: string
          domaine?: string
          id?: string
          is_new?: boolean | null
          is_popular?: boolean | null
          niveau?: string | null
          particularite?: string | null
          popularite?: number | null
          sous_domaine?: string | null
          titre?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      loisirs: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          niveau: string | null
          nom: string
          updated_at: string | null
          utilisateur_id: string
          visibilite: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          niveau?: string | null
          nom: string
          updated_at?: string | null
          utilisateur_id: string
          visibilite?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          niveau?: string | null
          nom?: string
          updated_at?: string | null
          utilisateur_id?: string
          visibilite?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loisirs_utilisateur_id_fkey"
            columns: ["utilisateur_id"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          club_id: string | null
          contenu: string | null
          created_at: string | null
          destinataire_id: string | null
          expediteur_id: string | null
          id: string
          media_url: string | null
          read_at: string | null
          type: string | null
        }
        Insert: {
          club_id?: string | null
          contenu?: string | null
          created_at?: string | null
          destinataire_id?: string | null
          expediteur_id?: string | null
          id?: string
          media_url?: string | null
          read_at?: string | null
          type?: string | null
        }
        Update: {
          club_id?: string | null
          contenu?: string | null
          created_at?: string | null
          destinataire_id?: string | null
          expediteur_id?: string | null
          id?: string
          media_url?: string | null
          read_at?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_destinataire_id_fkey"
            columns: ["destinataire_id"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_expediteur_id_fkey"
            columns: ["expediteur_id"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          source: string | null
          type: string
          url_cible: string | null
          utilisateur_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          source?: string | null
          type: string
          url_cible?: string | null
          utilisateur_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          source?: string | null
          type?: string
          url_cible?: string | null
          utilisateur_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_utilisateur_id_fkey"
            columns: ["utilisateur_id"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          matricule: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          matricule?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          matricule?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projet_collaborateurs: {
        Row: {
          collaborateur_id: string
          date_ajout: string | null
          projet_id: string
          role: string | null
        }
        Insert: {
          collaborateur_id: string
          date_ajout?: string | null
          projet_id: string
          role?: string | null
        }
        Update: {
          collaborateur_id?: string
          date_ajout?: string | null
          projet_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projet_collaborateurs_collaborateur_id_fkey"
            columns: ["collaborateur_id"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projet_collaborateurs_projet_id_fkey"
            columns: ["projet_id"]
            isOneToOne: false
            referencedRelation: "projets"
            referencedColumns: ["id"]
          },
        ]
      }
      projet_fichiers: {
        Row: {
          created_at: string | null
          id: string
          nom_fichier: string
          projet_id: string | null
          type_fichier: string | null
          url_fichier: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nom_fichier: string
          projet_id?: string | null
          type_fichier?: string | null
          url_fichier: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nom_fichier?: string
          projet_id?: string | null
          type_fichier?: string | null
          url_fichier?: string
        }
        Relationships: [
          {
            foreignKeyName: "projet_fichiers_projet_id_fkey"
            columns: ["projet_id"]
            isOneToOne: false
            referencedRelation: "projets"
            referencedColumns: ["id"]
          },
        ]
      }
      projets: {
        Row: {
          code_source: string | null
          created_at: string | null
          description: string | null
          github_url: string | null
          id: string
          interface_principale: string | null
          langages_utilises: string[] | null
          nom: string
          outils_utilises: string | null
          proprietaire_id: string | null
          statut: string | null
          updated_at: string | null
          visibilite: string | null
        }
        Insert: {
          code_source?: string | null
          created_at?: string | null
          description?: string | null
          github_url?: string | null
          id?: string
          interface_principale?: string | null
          langages_utilises?: string[] | null
          nom: string
          outils_utilises?: string | null
          proprietaire_id?: string | null
          statut?: string | null
          updated_at?: string | null
          visibilite?: string | null
        }
        Update: {
          code_source?: string | null
          created_at?: string | null
          description?: string | null
          github_url?: string | null
          id?: string
          interface_principale?: string | null
          langages_utilises?: string[] | null
          nom?: string
          outils_utilises?: string | null
          proprietaire_id?: string | null
          statut?: string | null
          updated_at?: string | null
          visibilite?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projets_proprietaire_id_fkey"
            columns: ["proprietaire_id"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
        ]
      }
      publications: {
        Row: {
          auteur_id: string | null
          club_id: string | null
          contenu: string
          created_at: string | null
          id: string
          titre: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          auteur_id?: string | null
          club_id?: string | null
          contenu: string
          created_at?: string | null
          id?: string
          titre: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          auteur_id?: string | null
          club_id?: string | null
          contenu?: string
          created_at?: string | null
          id?: string
          titre?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publications_auteur_id_fkey"
            columns: ["auteur_id"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publications_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          book_id: string
          created_at: string | null
          id: string
          rating: number
        }
        Insert: {
          book_id: string
          created_at?: string | null
          id?: string
          rating: number
        }
        Update: {
          book_id?: string
          created_at?: string | null
          id?: string
          rating?: number
        }
        Relationships: []
      }
      reviews: {
        Row: {
          book_id: string
          book_title: string
          created_at: string | null
          id: string
          review: string
          updated_at: string | null
        }
        Insert: {
          book_id: string
          book_title: string
          created_at?: string | null
          id?: string
          review: string
          updated_at?: string | null
        }
        Update: {
          book_id?: string
          book_title?: string
          created_at?: string | null
          id?: string
          review?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shares: {
        Row: {
          book_id: string
          book_title: string
          id: string
          shared_at: string | null
        }
        Insert: {
          book_id: string
          book_title: string
          id?: string
          shared_at?: string | null
        }
        Update: {
          book_id?: string
          book_title?: string
          id?: string
          shared_at?: string | null
        }
        Relationships: []
      }
      sondages: {
        Row: {
          date_cloture: string | null
          options: string[]
          publication_id: string
          question: string
        }
        Insert: {
          date_cloture?: string | null
          options: string[]
          publication_id: string
          question: string
        }
        Update: {
          date_cloture?: string | null
          options?: string[]
          publication_id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "sondages_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: true
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_envs: {
        Row: {
          created_at: string | null
          studio_url: string
          updated_at: string | null
          user_id: string
          vscode_url: string
        }
        Insert: {
          created_at?: string | null
          studio_url: string
          updated_at?: string | null
          user_id: string
          vscode_url: string
        }
        Update: {
          created_at?: string | null
          studio_url?: string
          updated_at?: string | null
          user_id?: string
          vscode_url?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          created_at: string | null
          id: string
          is_online: boolean | null
          last_seen: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
        ]
      }
      utilisateurs: {
        Row: {
          adresse: string | null
          bio: string | null
          created_at: string | null
          date_de_naissance: string | null
          email: string
          id: string
          matricule: string | null
          nom: string | null
          photo_profil_url: string | null
          prenom: string | null
          sexe: string | null
          telephone: string | null
          updated_at: string | null
        }
        Insert: {
          adresse?: string | null
          bio?: string | null
          created_at?: string | null
          date_de_naissance?: string | null
          email: string
          id: string
          matricule?: string | null
          nom?: string | null
          photo_profil_url?: string | null
          prenom?: string | null
          sexe?: string | null
          telephone?: string | null
          updated_at?: string | null
        }
        Update: {
          adresse?: string | null
          bio?: string | null
          created_at?: string | null
          date_de_naissance?: string | null
          email?: string
          id?: string
          matricule?: string | null
          nom?: string | null
          photo_profil_url?: string | null
          prenom?: string | null
          sexe?: string | null
          telephone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      votes_sondage: {
        Row: {
          electeur_id: string
          option_votee: string
          sondage_id: string
          voted_at: string | null
        }
        Insert: {
          electeur_id: string
          option_votee: string
          sondage_id: string
          voted_at?: string | null
        }
        Update: {
          electeur_id?: string
          option_votee?: string
          sondage_id?: string
          voted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_sondage_electeur_id_fkey"
            columns: ["electeur_id"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_sondage_sondage_id_fkey"
            columns: ["sondage_id"]
            isOneToOne: false
            referencedRelation: "sondages"
            referencedColumns: ["publication_id"]
          },
        ]
      }
    }
    Views: {
      admin_stats: {
        Row: {
          messages_month: number | null
          new_users_month: number | null
          total_books: number | null
          total_clubs: number | null
          total_exams: number | null
          total_messages: number | null
          total_users: number | null
          total_workshops: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_offline_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_calls: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_notification: {
        Args: {
          p_utilisateur_id: string
          p_type: string
          p_message: string
          p_source?: string
          p_url_cible?: string
        }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_clubs: {
        Args: { _membre_id: string }
        Returns: {
          club_id: string
        }[]
      }
      set_user_offline: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      set_user_online: {
        Args: { target_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
