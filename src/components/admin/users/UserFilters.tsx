
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface UserFiltersProps {
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function UserFilters({
  searchTerm,
  roleFilter,
  statusFilter,
  onSearchChange,
  onRoleChange,
  onStatusChange
}: UserFiltersProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <Select value={roleFilter} onValueChange={onRoleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrer par rôle" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les rôles</SelectItem>
          <SelectItem value="user">Utilisateur</SelectItem>
          <SelectItem value="super_admin">Super Admin</SelectItem>
          <SelectItem value="moderator">Modérateur</SelectItem>
          <SelectItem value="content_admin">Admin Contenu</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrer par statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          <SelectItem value="active">Actif</SelectItem>
          <SelectItem value="blocked">Bloqué</SelectItem>
          <SelectItem value="pending">En attente</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
