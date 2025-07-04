
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BookManagement } from '@/components/admin/content/BookManagement';
import { ExamManagement } from '@/components/admin/content/ExamManagement';
import { ContentStats } from '@/components/admin/content/ContentStats';
import { Button } from '@/components/ui/button';
import { Activity, Book, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminContent() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data: books, isLoading: booksLoading } = useQuery({
    queryKey: ['admin-books', refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('livres')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ['admin-exams', refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('examens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion du Contenu
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les livres, épreuves et tout le contenu éducatif
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <Activity className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>

      <ContentStats books={books || []} exams={exams || []} />

      <Tabs defaultValue="books" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="books" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Livres
          </TabsTrigger>
          <TabsTrigger value="exams" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Épreuves
          </TabsTrigger>
        </TabsList>

        <TabsContent value="books">
          <BookManagement 
            books={books || []} 
            isLoading={booksLoading}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="exams">
          <ExamManagement 
            exams={exams || []} 
            isLoading={examsLoading}
            onRefresh={handleRefresh}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
