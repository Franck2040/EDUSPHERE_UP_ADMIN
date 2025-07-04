
# Diagramme d'État - Session Administrateur

## États de la Session Admin

```
                    ┌─────────────────┐
                    │   INITIAL       │
                    │                 │
                    │ - loading: true │
                    │ - user: null    │
                    │ - role: null    │
                    └─────────────────┘
                              │
                              │ checkSession()
                              ▼
                    ┌─────────────────┐
                    │  CHECKING       │
                    │                 │
                    │ - loading: true │
                    │ - validating    │
                    └─────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
        no session  ▼                   ▼  session exists
          ┌─────────────────┐    ┌─────────────────┐
          │ UNAUTHENTICATED │    │ VALIDATING_ROLE │
          │                 │    │                 │
          │ - loading: false│    │ - loading: true │
          │ - user: null    │    │ - checking RLS  │
          │ - redirect login│    └─────────────────┘
          └─────────────────┘              │
                    ▲                ┌─────┴─────┐
                    │                │           │
                    │      not admin ▼           ▼ is admin
                    │      ┌─────────────────┐  ┌─────────────────┐
                    │      │ ACCESS_DENIED   │  │  AUTHENTICATED  │
                    │      │                 │  │                 │
                    └──────┤ - force logout  │  │ - loading: false│
                           │ - show error    │  │ - user: User    │
                           └─────────────────┘  │ - role: admin   │
                                                │ - permissions   │
                                                └─────────────────┘
                                                          │
                                                          │
                    ┌─────────────────────────────────────┼─────────────────┐
                    │                                     │                 │
        logout() or │                          token      │                 │ session
        token       │                         refresh     │                 │ expires
        expires     ▼                          needed     ▼                 │
          ┌─────────────────┐                   ┌─────────────────┐         │
          │   LOGGING_OUT   │                   │   REFRESHING    │         │
          │                 │                   │                 │         │
          │ - clearing data │                   │ - refreshing    │         │
          │ - cleanup       │                   │ - maintaining   │         │
          └─────────────────┘                   │   access        │         │
                    │                           └─────────────────┘         │
                    │                                     │                 │
                    │                           ┌─────────┴──────────┐      │
                    │                           │                    │      │
                    │                 success   ▼                    ▼ fail │
                    │                 ┌─────────────────┐  ┌─────────────────┐
                    │                 │ AUTHENTICATED   │  │ REFRESH_FAILED  │
                    │                 │  (restored)     │  │                 │
                    │                 └─────────────────┘  │ - force logout  │
                    │                                      └─────────────────┘
                    │                                                │
                    │                                                │
                    └────────────────────────────────────────────────┘
                    │
                    ▼
          ┌─────────────────┐
          │ UNAUTHENTICATED │
          │   (final)       │
          └─────────────────┘
```

## Transitions et Triggers

### 1. INITIAL → CHECKING
- **Trigger** : Montage du composant App
- **Action** : `supabase.auth.getSession()`
- **Loading** : true

### 2. CHECKING → UNAUTHENTICATED
- **Trigger** : Aucune session trouvée
- **Action** : Redirection vers `/admin/login`
- **Loading** : false

### 3. CHECKING → VALIDATING_ROLE
- **Trigger** : Session valide trouvée
- **Action** : Requête RLS pour vérifier le rôle
- **Loading** : true

### 4. VALIDATING_ROLE → ACCESS_DENIED
- **Trigger** : Utilisateur non-admin
- **Action** : `supabase.auth.signOut()` + message d'erreur
- **Redirection** : `/admin/login`

### 5. VALIDATING_ROLE → AUTHENTICATED
- **Trigger** : Utilisateur confirmé admin
- **Action** : Chargement du dashboard
- **Loading** : false

### 6. AUTHENTICATED → REFRESHING
- **Trigger** : Token proche de l'expiration
- **Action** : `supabase.auth.refreshSession()`
- **Background** : true (maintient l'accès)

### 7. AUTHENTICATED → LOGGING_OUT
- **Trigger** : Action de déconnexion utilisateur
- **Action** : Nettoyage des données + `signOut()`

### 8. * → UNAUTHENTICATED
- **Triggers** : Échec refresh, logout, expiration
- **Action** : Redirection login

## États Composés et Actions

### État AUTHENTICATED - Sous-états
```
AUTHENTICATED
├── IDLE (état par défaut)
├── LOADING_DATA (chargement dashboard)
├── PERFORMING_ACTION (action admin en cours)
└── BACKGROUND_REFRESH (refresh silencieux)
```

### Gestion des Erreurs par État
- **CHECKING** : Retry automatique sur erreur réseau
- **VALIDATING_ROLE** : Fallback vers logout si erreur RLS
- **REFRESHING** : 3 tentatives avant logout forcé
- **PERFORMING_ACTION** : Rollback + message d'erreur

## Variables d'État Global

```typescript
interface AdminAuthState {
  loading: boolean;
  user: User | null;
  session: Session | null;
  role: 'super_admin' | 'moderator' | 'content_admin' | null;
  permissions: AdminPermissions | null;
  error: string | null;
  lastActivity: Date | null;
}
```

## Timeouts et Durées

- **Session Check** : Au montage + toutes les 5 minutes
- **Token Refresh** : 5 minutes avant expiration
- **Inactivity Logout** : 30 minutes
- **Error Retry** : 3 tentatives avec backoff exponentiel
