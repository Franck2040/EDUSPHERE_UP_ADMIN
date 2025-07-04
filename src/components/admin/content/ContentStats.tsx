
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, FileText, Star, Calendar } from 'lucide-react';

interface ContentStatsProps {
  books: any[];
  exams: any[];
}

export function ContentStats({ books, exams }: ContentStatsProps) {
  const totalBooks = books.length;
  const totalExams = exams.length;
  const popularBooks = books.filter(book => book.is_popular).length;
  const newExams = exams.filter(exam => exam.is_new).length;

  const stats = [
    {
      title: 'Livres',
      value: totalBooks,
      icon: Book,
      description: 'Livres dans la bibliothèque'
    },
    {
      title: 'Épreuves',
      value: totalExams,
      icon: FileText,
      description: 'Épreuves disponibles'
    },
    {
      title: 'Livres populaires',
      value: popularBooks,
      icon: Star,
      description: 'Livres marqués populaires'
    },
    {
      title: 'Nouvelles épreuves',
      value: newExams,
      icon: Calendar,
      description: 'Épreuves récemment ajoutées'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
