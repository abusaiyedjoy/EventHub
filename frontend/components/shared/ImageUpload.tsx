// components/shared/ImageUpload.tsx
'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { validateImageFile } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string | null;
  onChange: (file: File | null) => void;
  onRemove?: () => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: 'Invalid file',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onChange(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onRemove?.();
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="image-upload"
      />

      {preview ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label
          htmlFor="image-upload"
          className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50"
        >
          <ImageIcon className="mb-2 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            Click to upload banner
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, WebP or GIF (max. 5MB)
          </p>
        </label>
      )}
    </div>
  );
}