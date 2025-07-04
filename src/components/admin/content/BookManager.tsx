
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { BookForm } from './BookForm';
import { PDFPreviewModal } from './PDFPreviewModal';
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

export function BookManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    fileUrl: string;
    fileName: string;
  }>({
    isOpen: false,
    fileUrl: '',
    fileName: ''
  });

  const { data: books, isLoading, refetch } = useQuery({
    queryKey: ['admin-books', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('books')
        .select('*, book_ratings(rating)');

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%,domain.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleDelete = async (bookId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) return;

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId);

      if (error) throw error;

      toast.success('Livre supprimé avec succès');
      refetch();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Error deleting book:', error);
    }
  };

  const handlePreview = (book: any) => {
    setPreviewModal({
      isOpen: true,
      fileUrl: book.file_url,
      fileName: `${book.title}.pdf`
    });
  };

  const handleDownload = async (book: any) => {
    try {
      const response = await fetch(book.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${book.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Téléchargement commencé');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const calculateAverageRating = (ratings: any[]) => {
    if (!ratings.length) return 0;
    const sum = ratings.reduce((acc, rating) => acc + (rating.rating || 0), 0);
    return (sum / ratings.length).toFixed(1);
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
            <Button onClick={() => setShowForm(true)}>
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
                <TableHead>Domaine</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books?.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {book.cover_url && (
                        <img 
                          src={book.cover_url} 
                          alt={book.title}
                          className="w-10 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium">{book.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {book.author}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{book.domain}</Badge>
                    {book.sub_domain && (
                      <Badge variant="secondary" className="ml-1">
                        {book.sub_domain}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {book.is_new && (
                        <Badge variant="default">Nouveau</Badge>
                      )}
                      {book.is_popular && (
                        <Badge variant="destructive">Populaire</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{calculateAverageRating(book.book_ratings)}</span>
                      <span className="text-muted-foreground">
                        ({book.book_ratings.length})
                      </span>
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
                        <DropdownMenuItem onClick={() => handlePreview(book)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Aperçu
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedBook(book);
                          setShowForm(true);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(book)}>
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
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

      {showForm && (
        <BookForm 
          book={selectedBook}
          onClose={() => {
            setShowForm(false);
            setSelectedBook(null);
          }}
          onSuccess={() => {
            refetch();
            setShowForm(false);
            setSelectedBook(null);
          }}
        />
      )}

      <PDFPreviewModal 
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ ...previewModal, isOpen: false })}
        fileUrl={previewModal.fileUrl}
        fileName={previewModal.fileName}
      />
    </div>
  );
}
