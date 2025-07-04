
# Diagramme de Séquence - Authentification Administrateur

## Séquence 1: Connexion Administrateur Réussie

```
Administrateur    AdminLoginForm    useAuth Hook    Supabase Auth    Database RLS    AdminDashboard
     │                  │               │               │              │                 │
     │   1. Submit       │               │               │              │                 │
     │   credentials     │               │               │              │                 │
     ├──────────────────>│               │               │              │                 │
     │                  │               │               │              │                 │
     │                  │ 2. login()    │               │              │                 │
     │                  ├──────────────>│               │              │                 │
     │                  │               │               │              │                 │
     │                  │               │ 3. signInWith │              │                 │
     │                  │               │   Password    │              │                 │
     │                  │               ├──────────────>│              │                 │
     │                  │               │               │              │                 │
     │                  │               │ 4. JWT token  │              │                 │
     │                  │               │   + user data │              │                 │
     │                  │               │<──────────────┤              │                 │
     │                  │               │               │              │                 │
     │                  │               │ 5. checkAdminRole()          │                 │
     │                  │               │               │              │                 │
     │                  │               │ 6. SELECT role FROM profiles │                 │
     │                  │               │               │   WHERE...   │                 │
     │                  │               ├─────────────────────────────>│                 │
     │                  │               │               │              │                 │
     │                  │               │ 7. role = 'admin'            │                 │
     │                  │               │<─────────────────────────────┤                 │
     │                  │               │               │              │                 │
     │                  │ 8. success    │               │              │                 │
     │                  │   + userRole  │               │              │                 │
     │                  │<──────────────┤               │              │                 │
     │                  │               │               │              │                 │
     │                  │ 9. navigate('/admin')         │              │                 │
     │                  ├───────────────────────────────────────────────────────────────>│
     │                  │               │               │              │                 │
     │ 10. Display      │               │               │              │                 │
     │     Dashboard    │               │               │              │                 │
     │<─────────────────────────────────────────────────────────────────────────────────┤
```

## Séquence 2: Connexion Rejetée (Non-Administrateur)

```
Utilisateur      AdminLoginForm    useAuth Hook    Supabase Auth    Database RLS    
     │                 │               │               │              │             
     │  1. Submit      │               │               │              │             
     │   credentials   │               │               │              │             
     ├─────────────────>│               │               │              │             
     │                 │               │               │              │             
     │                 │ 2. login()    │               │              │             
     │                 ├──────────────>│               │              │             
     │                 │               │               │              │             
     │                 │               │ 3. signInWith │              │             
     │                 │               │   Password    │              │             
     │                 │               ├──────────────>│              │             
     │                 │               │               │              │             
     │                 │               │ 4. JWT token  │              │             
     │                 │               │<──────────────┤              │             
     │                 │               │               │              │             
     │                 │               │ 5. checkAdminRole()          │             
     │                 │               │               │              │             
     │                 │               │ 6. SELECT role FROM profiles │             
     │                 │               ├─────────────────────────────>│             
     │                 │               │               │              │             
     │                 │               │ 7. role = 'user'             │             
     │                 │               │<─────────────────────────────┤             
     │                 │               │               │              │             
     │                 │ 8. logout()   │               │              │             
     │                 │   + error     │               │              │             
     │                 │<──────────────┤               │              │             
     │                 │               │               │              │             
     │                 │ 9. signOut()  │               │              │             
     │                 │               ├──────────────>│              │             
     │                 │               │               │              │             
     │ 10. Display     │               │               │              │             
     │     Error       │               │               │              │             
     │<─────────────────┤               │               │              │             
```

## Séquence 3: Vérification de Session au Chargement

```
AdminDashboard    useAuth Hook    Supabase Auth    Database RLS    
     │                │               │              │             
     │ 1. useEffect   │               │              │             
     │   (mount)      │               │              │             
     ├───────────────>│               │              │             
     │                │               │              │             
     │                │ 2. getSession │              │             
     │                ├──────────────>│              │             
     │                │               │              │             
     │                │ 3. session    │              │             
     │                │   or null     │              │             
     │                │<──────────────┤              │             
     │                │               │              │             
     │                │ 4. if session exists         │             
     │                │    checkAdminRole()          │             
     │                │               │              │             
     │                │ 5. SELECT role FROM profiles │             
     │                ├─────────────────────────────>│             
     │                │               │              │             
     │                │ 6. role validation result    │             
     │                │<─────────────────────────────┤             
     │                │               │              │             
     │ 7. setState    │               │              │             
     │   (loading:    │               │              │             
     │    false)      │               │              │             
     │<───────────────┤               │              │             
```

## Gestion des Erreurs

### Erreurs d'Authentification
- Credentials invalides → Message d'erreur + retry
- Compte bloqué → Message spécifique + contact admin
- Problème réseau → Retry automatique + fallback

### Erreurs de Rôles
- Utilisateur non-admin → Déconnexion forcée + message
- Session expirée → Redirect login + message
- Permissions insuffisantes → Access denied + log

## Sécurité

### Tokens JWT
- Durée de vie limitée (1h)
- Refresh automatique
- Stockage sécurisé (httpOnly si possible)

### Vérifications
- Double vérification des rôles (client + serveur)
- Logs des tentatives de connexion
- Rate limiting sur les tentatives
