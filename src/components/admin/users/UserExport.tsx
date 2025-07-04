
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

type AdminRole = 'user' | 'super_admin' | 'moderator' | 'content_admin';

interface UserExportProps {
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
}

export function UserExport({ searchTerm, roleFilter, statusFilter }: UserExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportUsers = async (format: 'csv' | 'json') => {
    setIsExporting(true);
    try {
      let query = supabase.from('profiles').select('*');

      // Apply filters
      if (searchTerm) {
        query = query.or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
        );
      }

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter as AdminRole);
      }

      const { data: users, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      if (format === 'csv') {
        exportToCSV(users || []);
      } else {
        exportToJSON(users || []);
      }

      toast.success(`Export ${format.toUpperCase()} terminé avec succès`);
    } catch (error) {
      toast.error('Erreur lors de l\'export');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = (users: any[]) => {
    if (users.length === 0) {
      toast.warning('Aucune donnée à exporter');
      return;
    }

    const headers = ['ID', 'Prénom', 'Nom', 'Email', 'Rôle', 'Matricule', 'Date d\'inscription'];
    const csvContent = [
      headers.join(','),
      ...users.map(user => [
        user.id,
        user.first_name || '',
        user.last_name || '',
        user.email || '',
        user.role || '',
        user.matricule || '',
        new Date(user.created_at).toLocaleDateString('fr-FR')
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    downloadFile(csvContent, 'utilisateurs.csv', 'text/csv');
  };

  const exportToJSON = (users: any[]) => {
    if (users.length === 0) {
      toast.warning('Aucune donnée à exporter');
      return;
    }

    const jsonContent = JSON.stringify(users, null, 2);
    downloadFile(jsonContent, 'utilisateurs.json', 'application/json');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Export...' : 'Exporter'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => exportUsers('csv')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exporter en CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportUsers('json')}>
          <FileText className="h-4 w-4 mr-2" />
          Exporter en JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
