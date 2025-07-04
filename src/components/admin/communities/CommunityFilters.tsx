
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CommunityFiltersProps {
  filters: {
    status: string;
    domain: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function CommunityFilters({ filters, onFiltersChange }: CommunityFiltersProps) {
  const domains = [
    'informatique',
    'sciences',
    'commerce',
    'medecine',
    'ingenierie',
    'arts',
    'langues',
    'sport'
  ];

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== 'all' && value !== ''
  ).length;

  const resetFilters = () => {
    onFiltersChange({
      status: 'all',
      domain: 'all',
      search: ''
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 bg-muted/30 rounded-lg border">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom ou description..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-10"
        />
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.status}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="inactive">Inactif</SelectItem>
            <SelectItem value="suspended">Suspendu</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.domain}
          onValueChange={(value) => onFiltersChange({ ...filters, domain: value })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Domaine" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous domaines</SelectItem>
            {domains.map((domain) => (
              <SelectItem key={domain} value={domain}>
                {domain.charAt(0).toUpperCase() + domain.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeFiltersCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetFilters}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Réinitialiser
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          </Button>
        )}
      </div>
    </div>
  );
}
