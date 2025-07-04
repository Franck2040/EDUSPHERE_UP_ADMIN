
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, FileText, Image, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileUploadProps {
  accept: string;
  bucket: string;
  onFileSelect: (file: File | null, url?: string) => void;
  selectedFile?: File | null;
  placeholder?: string;
  className?: string;
  allowUrl?: boolean;
}

export function FileUpload({
  accept,
  bucket,
  onFileSelect,
  selectedFile,
  placeholder = "Sélectionner un fichier",
  className,
  allowUrl = true
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = async (file: File) => {
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onFileSelect(file, data.publicUrl);
      toast.success('Fichier uploadé avec succès');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erreur lors de l\'upload du fichier');
    } finally {
      setUploading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1 || item.type.indexOf('application') !== -1) {
        const file = item.getAsFile();
        if (file) {
          handleFileSelection(file);
          break;
        }
      }
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onFileSelect(null, urlInput.trim());
      toast.success('URL ajoutée avec succès');
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload depuis l'appareil</TabsTrigger>
          {allowUrl && <TabsTrigger value="url">URL du fichier</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
              isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400",
              uploading && "opacity-50 pointer-events-none"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPaste={handlePaste}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileInput}
              className="hidden"
            />
            
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <p className="text-sm text-gray-600">Upload en cours...</p>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  {placeholder}
                </p>
                <p className="text-xs text-gray-400">
                  Glissez-déposez, collez (Ctrl+V) ou cliquez pour sélectionner
                </p>
              </>
            )}
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getFileIcon(selectedFile)}
                <div>
                  <p className="text-sm font-medium truncate max-w-48">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFileSelect(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>

        {allowUrl && (
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-url">URL du fichier</Label>
              <div className="flex gap-2">
                <Input
                  id="file-url"
                  placeholder="https://exemple.com/fichier.pdf"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim()}
                  variant="outline"
                >
                  <Link className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
