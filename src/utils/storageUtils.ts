
export const STORAGE_BUCKETS = {
  BOOKS: 'books',
  BOOK_COVERS: 'book-covers',
  EXAMS: 'exams',
  AVATARS: 'avatars',
  WORKSHOPS: 'workshops'
} as const;

export const STORAGE_FOLDERS = {
  BOOKS: 'pdfs',
  BOOK_COVERS: 'images',
  EXAMS: 'pdfs',
  AVATARS: 'images',
  WORKSHOPS: 'files'
} as const;

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];
export type StorageFolder = typeof STORAGE_FOLDERS[keyof typeof STORAGE_FOLDERS];
