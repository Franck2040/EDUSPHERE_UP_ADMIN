
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { CreateExamDialog } from './CreateExamDialog';
import { EditExamDialog } from './EditExamDialog';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Eye,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface Exam {
  id: string;
  matiere: string;
  ecole: string;
  niveau: string;
  annee: number;
  difficulte: string;
  description: string;
  contenu_url: string;
  tags: string;
  is_new: boolean;
  created_at: string;
}

interface ExamManagementProps {
  exams: Exam[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function ExamManagement({ exams, isLoading, onRefresh }: ExamManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const filteredExams = exams.filter(exam =>
    exam.matiere.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.ecole.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.niveau.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (examId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette épreuve ?')) return;

    try {
      const { error } = await supabase
        .from('examens')
        .delete()
        .eq('id', examId);

      if (error) throw error;

      toast.success('Épreuve supprimée avec succès');
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Error deleting exam:', error);
    }
  };

  const handleToggleNew = async (examId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('examens')
        .update({ is_new: !currentStatus })
        .eq('id', examId);

      if (error) throw error;

      toast.success(currentStatus ? 'Épreuve marquée comme ancienne' : 'Épreuve marquée comme nouvelle');
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
      console.error('Error updating exam status:', error);
    }
  };

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestion des Épreuves</CardTitle>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une épreuve
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par matière, école ou niveau..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Épreuve</TableHead>
                <TableHead>École</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Année</TableHead>
                <TableHead>Difficulté</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{exam.matiere}</div>
                      <div className="text-sm text-muted-foreground">
                        {exam.description || 'Aucune description'}
                      </div>
                      {exam.tags && (
                        <div className="mt-1">
                          {exam.tags.split(',').map((tag, index) => (
                            <Badge key={index} variant="secondary" className="mr-1 text-xs">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{exam.ecole}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{exam.niveau}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {exam.annee}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        exam.difficulte === 'facile' ? 'default' :
                        exam.difficulte === 'moyen' ? 'secondary' : 'destructive'
                      }
                    >
                      {exam.difficulte || 'Non spécifié'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={exam.is_new ? 'default' : 'outline'}>
                      {exam.is_new ? 'Nouveau' : 'Ancien'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedExam(exam);
                          setEditDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(exam.contenu_url, '_blank')}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir l'épreuve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleNew(exam.id, exam.is_new)}>
                          <Calendar className="h-4 w-4 mr-2" />
                          {exam.is_new ? 'Marquer comme ancien' : 'Marquer comme nouveau'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(exam.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateExamDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={onRefresh}
      />

      {selectedExam && (
        <EditExamDialog
          exam={selectedExam}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
