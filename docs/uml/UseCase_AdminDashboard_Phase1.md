
# Diagramme de Cas d'Utilisation - Foundation Admin Dashboard (Phase 1)

## Acteurs

### Super-Administrateur
- Accès complet à toutes les fonctionnalités
- Gestion des autres administrateurs
- Accès aux logs de sécurité

### Modérateur-Administrateur  
- Gestion des utilisateurs (bloquer/débloquer)
- Modération du contenu
- Gestion des signalements

### Administrateur-Contenu
- Gestion de la bibliothèque (livres/épreuves)
- Upload et organisation du contenu
- Modération des commentaires

## Cas d'Utilisation Phase 1

### Authentification et Accès
1. **Se connecter au tableau de bord**
   - Acteurs: Tous les administrateurs
   - Prérequis: Avoir un rôle administrateur valide
   - Flux: Email/mot de passe → Vérification rôle → Accès dashboard

2. **Gérer sa session**
   - Acteurs: Tous les administrateurs
   - Actions: Se déconnecter, changer mot de passe

### Tableau de Bord Central
3. **Consulter les statistiques générales**
   - Acteurs: Tous les administrateurs
   - Données: Utilisateurs actifs, nouveau contenu, signalements

4. **Visualiser les graphiques de tendances**
   - Acteurs: Tous les administrateurs
   - Graphiques: Croissance utilisateurs, activité contenu

### Gestion des Utilisateurs
5. **Lister et filtrer les utilisateurs**
   - Acteurs: Super-Admin, Modérateur-Admin
   - Filtres: Rôle, statut, date inscription, activité

6. **Consulter le profil détaillé d'un utilisateur**
   - Acteurs: Super-Admin, Modérateur-Admin
   - Informations: Données personnelles, historique, projets

7. **Bloquer/Débloquer un utilisateur**
   - Acteurs: Super-Admin, Modérateur-Admin
   - Actions: Suspension temporaire ou permanente

8. **Modifier les rôles utilisateur**
   - Acteurs: Super-Admin uniquement
   - Actions: Assigner/retirer rôles administratifs

9. **Traiter les signalements**
   - Acteurs: Super-Admin, Modérateur-Admin
   - Actions: Examiner, approuver/rejeter, prendre mesures

### Gestion du Contenu
10. **Lister et rechercher livres/épreuves**
    - Acteurs: Tous les administrateurs
    - Filtres: Catégorie, auteur, date, popularité

11. **Ajouter nouveau contenu**
    - Acteurs: Super-Admin, Admin-Contenu
    - Actions: Upload PDF, remplir métadonnées, publier

12. **Modifier le contenu existant**
    - Acteurs: Super-Admin, Admin-Contenu
    - Actions: Mettre à jour infos, remplacer fichier

13. **Supprimer du contenu**
    - Acteurs: Super-Admin uniquement
    - Actions: Suppression avec confirmation

14. **Modérer les commentaires**
    - Acteurs: Super-Admin, Modérateur-Admin, Admin-Contenu
    - Actions: Approuver, supprimer, masquer commentaires

## Relations et Extensions

### Héritages
- Modérateur-Admin hérite des permissions de base
- Super-Admin hérite de toutes les permissions

### Inclusions
- "Se connecter" inclus dans tous les autres cas d'utilisation
- "Consulter profil utilisateur" inclus dans "Bloquer utilisateur"
- "Lister contenu" inclus dans "Modifier contenu"

### Extensions
- "Consulter logs sécurité" étend "Bloquer utilisateur" (Super-Admin)
- "Envoyer notification" étend "Traiter signalement"
- "Générer rapport" étend "Consulter statistiques"

## Contraintes Phase 1

### Sécurité
- Toutes les actions nécessitent une authentification valide
- Vérification RLS sur chaque opération Supabase
- Logs automatiques des actions sensibles

### Performance
- Pagination obligatoire pour les listes > 50 éléments
- Cache des statistiques (refresh toutes les 5 minutes)
- Chargement progressif des données utilisateur

### Business Rules
- Un utilisateur ne peut pas se bloquer lui-même
- Seul le Super-Admin peut créer d'autres administrateurs
- Les signalements doivent être traités dans les 48h
- Backup automatique avant suppression de contenu
