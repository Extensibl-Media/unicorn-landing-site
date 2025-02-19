import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from '../../lib/supabase/browser';
import { Upload, X, FileIcon, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (url: string) => void;
  value?: string;
  label?: string;
  bucketName?: string;
  folderPath?: string;
  accept?: string;
  maxSize?: number;
  className?: string;
  isPublic?: boolean;
  expiresIn?: number; // seconds for signed URL expiration
}

export function FileUpload({
  onUpload,
  value,
  label = "Upload File",
  bucketName = 'uploads',
  folderPath = '',
  accept = '*',
  maxSize = 5,
  className,
  isPublic = true,
  expiresIn = 3600 // 1 hour default
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFileUrl = async (supabase: any, filePath: string) => {
    if (isPublic) {
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      return publicUrl;
    } else {
      const { data: { signedUrl }, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) throw error;
      return signedUrl;
    }
  };

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      setUploading(true);

      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`File size must be less than ${maxSize}MB`);
      }

      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: isPublic ? '3600' : '0',
          upsert: false
        });

      if (uploadError) {
        console.log(uploadError);
        throw uploadError
      };

      const url = await getFileUrl(supabase, filePath);
      onUpload(url);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const isImage = accept.includes('image');
  const FileTypeIcon = isImage ? ImageIcon : FileIcon;

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="file"
            accept={accept}
            onChange={uploadFile}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          <Label
            htmlFor="file-upload"
            className="flex items-center gap-2 border rounded-lg p-2 cursor-pointer hover:bg-accent"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Choose File'}
          </Label>
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
        </div>
        {value && (
          <div className="flex items-center gap-2 border rounded-lg p-2">
            <FileTypeIcon className="h-4 w-4" />
            <span className="text-sm truncate max-w-[200px]">
              {value.split('/').pop()}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onUpload('')}
              className="h-4 w-4 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {!isPublic && (
        <p className="text-sm text-muted-foreground">
          Signed URL will expire in {Math.floor(expiresIn / 60)} minutes
        </p>
      )}
    </div>
  );
}