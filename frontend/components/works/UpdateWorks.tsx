'use client';

import { useState, useEffect, useRef } from 'react';
import { Work, WorkImage } from '@/types/work';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Image as ImageIcon, Trash2, Upload, X } from 'lucide-react';
import { workApi } from '@/lib/work-api';
import { toast } from 'sonner';
import Image from 'next/image';

interface UpdateWorkProps {
  work: Work;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function UpdateWork({ work, open, onOpenChange, onSuccess }: UpdateWorkProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeRange: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (work) {
      setFormData({
        title: work.title,
        description: work.description || '',
        timeRange: work.timeRange || '',
      });
      setImages([]);
      setImagesToRemove([]);
      setImagePreviews([]);
    }
  }, [work]);

  useEffect(() => {
    // Create object URLs for previews
    const previews = images.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);

    // Clean up object URLs when component unmounts or images change
    return () => {
      previews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [images]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files);
      setImages([...images, ...newImages]);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeExistingImage = (publicId: string) => {
    setImagesToRemove([...imagesToRemove, publicId]);
  };

  const undoRemoveImage = (publicId: string) => {
    setImagesToRemove(imagesToRemove.filter(id => id !== publicId));
  };

  const removeNewImage = (index: number) => {
    // Revoke the object URL before removing
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      setLoading(true);
      await workApi.update(work._id, {
        ...formData,
        images,
        removeImagePublicIds: imagesToRemove,
      });
      
      toast.success('Work updated successfully');
      onSuccess();
      
      // Clean up object URLs after successful submission
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
      setImagePreviews([]);
    } catch (error) {
      toast.error('Failed to update work');
    } finally {
      setLoading(false);
    }
  };

  const getRemainingImages = () => {
    return work.images.filter(img => !imagesToRemove.includes(img.publicId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Work</DialogTitle>
          <DialogDescription>
            Update your work submission. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Work Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter work title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your work..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="timeRange">Time Range</Label>
              <Input
                id="timeRange"
                value={formData.timeRange}
                onChange={(e) => setFormData({ ...formData, timeRange: e.target.value })}
                placeholder="e.g., 10am-2pm, 2-4pm"
              />
            </div>

            <div>
              <Label>Images</Label>
              <div className="mt-2 space-y-4">
                {/* Existing Images */}
                {work.images.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Current Images</p>
                    <div className="grid grid-cols-4 gap-2">
                      {work.images.map((img) => {
                        const isRemoved = imagesToRemove.includes(img.publicId);
                        return (
                          <div key={img.publicId} className="relative group">
                            <div className={`aspect-square w-full rounded-lg border overflow-hidden ${
                              isRemoved ? 'opacity-50' : ''
                            }`}>
                              <Image
                                src={img.url}
                                alt="Work image"
                                width={100}
                                height={100}
                                className="w-full h-full object-cover"
                                unoptimized // Add this if images are from external domains
                              />
                            </div>
                            {isRemoved ? (
                              <button
                                type="button"
                                onClick={() => undoRemoveImage(img.publicId)}
                                className="absolute top-1 right-1 bg-green-500 text-white p-1 rounded-full"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => removeExistingImage(img.publicId)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {imagesToRemove.length > 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        {imagesToRemove.length} image(s) marked for removal
                      </p>
                    )}
                  </div>
                )}

                {/* New Images Upload */}
                <div>
                  <p className="text-sm font-medium mb-2">Add More Images</p>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Click to add more images
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">
                        New Images to Add ({imagePreviews.length})
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square w-full rounded-lg border overflow-hidden bg-gray-100">
                              {/* Use img instead of Image for blob URLs */}
                              <img
                                src={preview}
                                alt={`New image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#2b564e] hover:bg-[#2b564e]/90"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Work'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}