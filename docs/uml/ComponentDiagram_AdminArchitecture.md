
# Diagramme de Composants - Architecture Admin Dashboard

## Vue d'Ensemble de l'Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Vite)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Auth Component │  │ Dashboard Comp  │  │ Layout Comp  │ │
│  │                 │  │                 │  │              │ │
│  │ - LoginForm     │  │ - StatsCards    │  │ - Sidebar    │ │
│  │ - RoleGuard     │  │ - ChartsView    │  │ - Header     │ │
│  │ - SessionMgmt   │  │ - Notifications │  │ - Breadcrumb │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Users Mgmt     │  │ Content Mgmt    │  │ Security Mgmt│ │
│  │                 │  │                 │  │              │ │
│  │ - UsersList     │  │ - BooksList     │  │ - ReportsList│ │
│  │ - UserProfile   │  │ - ExamsList     │  │ - BlockUser  │ │
│  │ - RoleEditor    │  │ - FileUpload    │  │ - AuditLogs  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                     HOOKS LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   useAuth       │  │  useAdminData   │  │ useRealtime  │ │
│  │                 │  │                 │  │              │ │
│  │ - login()       │  │ - getUsers()    │  │ - subscribe  │ │
│  │ - logout()      │  │ - getStats()    │  │ - unsubscribe│ │
│  │ - checkRole()   │  │ - getContent()  │  │ - onUpdate   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Auth Service  │  │  Database       │  │ Storage      │ │
│  │                 │  │                 │  │              │ │
│  │ - JWT tokens    │  │ - profiles      │  │ - book_files │ │
│  │ - RLS policies  │  │ - books/exams   │  │ - exam_files │ │
│  │ - Role check    │  │ - reports       │  │ - user_media │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  Edge Functions │  │   Realtime      │                  │
│  │                 │  │                 │                  │
│  │ - admin-actions │  │ - notifications │                  │
│  │ - user-management│ │ - live-stats    │                  │
│  │ - content-ops   │  │ - activity-feed │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## Détail des Composants Frontend

### 1. Auth Components
- **LoginForm** : Interface de connexion admin
- **RoleGuard** : HOC de protection des routes par rôle
- **SessionManager** : Gestion des tokens et refresh

### 2. Layout Components  
- **AdminSidebar** : Navigation principale avec icônes
- **AdminHeader** : Barre supérieure + profil admin
- **Breadcrumbs** : Navigation contextuelle

### 3. Dashboard Components
- **StatsCards** : Cartes de statistiques en temps réel
- **ChartsView** : Graphiques avec Recharts
- **NotificationCenter** : Centre de notifications admin

### 4. Users Management
- **UsersTable** : Table paginée avec filtres
- **UserDetailModal** : Popup de détails utilisateur
- **BulkActions** : Actions en lot sur utilisateurs

### 5. Content Management
- **ContentTable** : Table livres/épreuves unifiée
- **FileUploadForm** : Upload avec preview et métadonnées
- **ContentEditor** : Édition inline des métadonnées

## Flux de Données

### Authentification
```
LoginForm → useAuth → Supabase Auth → RLS Check → Dashboard
```

### Gestion Utilisateurs
```
UsersTable → useAdminData → Supabase DB → RLS Filter → Display
```

### Actions Admin
```
Action Button → Edge Function → Database Update → Realtime → UI Update
```

## Sécurité des Composants

### Niveau Component
- Tous les composants admin wrappés dans `<RoleGuard>`
- Validation des permissions avant chaque action
- Sanitization des inputs utilisateur

### Niveau Data
- RLS policies sur toutes les tables
- Edge Functions pour actions sensibles
- Audit trail automatique

## Performance

### Optimisations
- React.memo sur les composants de table
- Pagination server-side obligatoire
- Cache des statistiques (5 min TTL)
- Lazy loading des composants lourds

### Gestion d'État
- React Query pour cache/sync
- Zustand pour état global admin
- Local state pour UI temporaire
