
-- Add RLS policies for books table
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all books (using correct admin roles)
CREATE POLICY "Admins can view all books" ON public.books
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'moderator', 'content_admin')
  )
);

-- Allow admins to insert books
CREATE POLICY "Admins can create books" ON public.books
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'moderator', 'content_admin')
  )
);

-- Allow admins to update books
CREATE POLICY "Admins can update books" ON public.books
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'moderator', 'content_admin')
  )
);

-- Allow admins to delete books
CREATE POLICY "Admins can delete books" ON public.books
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'moderator', 'content_admin')
  )
);

-- Add RLS policies for exams table
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all exams
CREATE POLICY "Admins can view all exams" ON public.exams
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'moderator', 'content_admin')
  )
);

-- Allow admins to insert exams
CREATE POLICY "Admins can create exams" ON public.exams
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'moderator', 'content_admin')
  )
);

-- Allow admins to update exams
CREATE POLICY "Admins can update exams" ON public.exams
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'moderator', 'content_admin')
  )
);

-- Allow admins to delete exams
CREATE POLICY "Admins can delete exams" ON public.exams
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'moderator', 'content_admin')
  )
);

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('books', 'books', true),
  ('book-covers', 'book-covers', true),
  ('exams', 'exams', true),
  ('exam-covers', 'exam-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Add storage policies for books bucket
CREATE POLICY "Admins can upload books" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'books' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'moderator', 'content_admin')
  )
);

CREATE POLICY "Public can view books" ON storage.objects
FOR SELECT USING (bucket_id = 'books');

-- Add storage policies for book-covers bucket
CREATE POLICY "Admins can upload book covers" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'book-covers' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'moderator', 'content_admin')
  )
);

CREATE POLICY "Public can view book covers" ON storage.objects
FOR SELECT USING (bucket_id = 'book-covers');

-- Add storage policies for exams bucket
CREATE POLICY "Admins can upload exams" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'exams' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'moderator', 'content_admin')
  )
);

CREATE POLICY "Public can view exams" ON storage.objects
FOR SELECT USING (bucket_id = 'exams');

-- Add storage policies for exam-covers bucket
CREATE POLICY "Admins can upload exam covers" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'exam-covers' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'moderator', 'content_admin')
  )
);

CREATE POLICY "Public can view exam covers" ON storage.objects
FOR SELECT USING (bucket_id = 'exam-covers');
