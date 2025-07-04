
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
import { CreateBookDialog } from './CreateBookDialog';
import { EditBookDialog } from './EditBookDialog';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Eye,
  Download,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface Book {
  id: string;
  titre: string;
  auteur: string;
  domaine: string;
  sous_domaine: string;
  niveau: string;
  description: string;
  document_url: string;
  couverture_url: string;
  is_popular: boolean;
  popularite: number;
  created_at: string;
}

interface BookManagementProps {
  books: Book[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function BookManagement({ books, isLoading, onRefresh }: BookManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const filteredBooks = books.filter(book =>
    book.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.auteur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.domaine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (bookId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) return;

    try {
      const { error } = await supabase
        .from('livres')
        .delete()
        .eq('id', bookId);

      if (error) throw error;

      toast.success('Livre supprimé avec succès');
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Error deleting book:', error);
    }
  };

  const handleTogglePopular = async (bookId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('livres')
        .update({ 
          is_popular: !currentStatus,
          popularite: !currentStatus ? 100 : 0
        })
        .eq('id', bookId);

      if (error) throw error;

      toast.success(currentStatus ? 'Livre retiré des populaires' : 'Livre ajouté aux populaires');
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
      console.error('Error updating book popularity:', error);
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
            <CardTitle>Gestion des Livres</CardTitle>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un livre
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre, auteur ou domaine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Livre</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Domaine</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Popularité</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {book.couverture_url && (
                        <img 
                          src={book.couverture_url} 
                          alt={book.titre}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium">{book.titre}</div>
                        <div className="text-sm text-muted-foreground">
                          {book.description || 'Aucune description'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{book.auteur || 'Inconnu'}</TableCell>
                  <TableCell>
                    <div>
                      <Badge variant="outline">{book.domaine}</Badge>
                      {book.sous_domaine && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {book.sous_domaine}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{book.niveau || 'Non spécifié'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {book.is_popular && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                      <span className="text-sm">{book.popularite || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(book.created_at).toLocaleDateString('fr-FR')}
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
                          setSelectedBook(book);
                          setEditDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(book.document_url, '_blank')}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir le document
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTogglePopular(book.id, book.is_popular)}>
                          <Star className="h-4 w-4 mr-2" />
                          {book.is_popular ? 'Retirer des populaires' : 'Marquer populaire'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(book.id)}
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

      <CreateBookDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={onRefresh}
      />

      {selectedBook && (
        <EditBookDialog
          book={selectedBook}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
