import { useState, useRef } from 'react';
import { UploadCloud, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadService } from '@/services';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function ImageUpload({ value, onChange, className }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;
    
    // Check type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Check size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadService.uploadBookCover(file);
      const imageUrl = res.data.data.secureUrl;
      onChange(imageUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {value ? (
        <div className="relative group overflow-hidden rounded-xl border border-border bg-card/50">
          <img 
            src={value} 
            alt="Uploaded cover" 
            className="w-full h-48 object-contain bg-black/20"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button 
              type="button" 
              variant="destructive" 
              size="sm"
              onClick={handleRemove}
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed transition-colors cursor-pointer",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-card/50"
          )}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={onFileChange}
            accept="image/*"
            className="hidden"
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-muted-foreground p-6 text-center">
              <div className="p-3 bg-secondary/50 rounded-full mb-3">
                <UploadCloud className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium mb-1">
                Click or drag file to this area to upload
              </p>
              <p className="text-xs text-muted-foreground">
                Support for a single image upload (max 5MB)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
