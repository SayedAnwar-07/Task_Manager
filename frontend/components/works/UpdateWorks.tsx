'use client';

import { useState, useEffect, useRef } from 'react';
import { Work } from '@/types/work';
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
import { Trash2, Upload, X } from 'lucide-react';
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
    shareUrl: '',
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
        shareUrl: work.shareUrl || '',
        timeRange: work.timeRange || '',
      });
      setImages([]);
      setImagesToRemove([]);
      setImagePreviews([]);
    }
  }, [work]);

  useEffect(() => {
    const previews = images.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);

    return () => previews.forEach((p) => URL.revokeObjectURL(p));
  }, [images]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setImages((prev) => [...prev, ...Array.from(files)]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeExistingImage = (publicId: string) => {
    setImagesToRemove((prev) => [...prev, publicId]);
  };

  const undoRemoveImage = (publicId: string) => {
    setImagesToRemove((prev) => prev.filter((id) => id !== publicId));
  };

  const removeNewImage = (index: number) => {
    if (imagePreviews[index]) URL.revokeObjectURL(imagePreviews[index]);

    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('Title is required');

    try {
      setLoading(true);
      await workApi.update(work._id, {
        ...formData,
        images,
        removeImagePublicIds: imagesToRemove,
      });

      toast.success('Work updated successfully');
      onSuccess();

      imagePreviews.forEach((p) => URL.revokeObjectURL(p));
      setImagePreviews([]);
    } catch {
      toast.error('Failed to update work');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          sm:max-w-[650px]
          bg-white dark:bg-[#101010]
          max-h-[90vh]
          overflow-y-auto
          border border-[#e5e5e5] dark:border-[#3c3c3c]
          rounded-none
        "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#101010] dark:text-white">
            Edit Work
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
            Update your work submission. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 mt-4">
          {/* TITLE */}
          <div className="space-y-2">
            <Label htmlFor="title" className="font-medium mb-2 text-[#101010] dark:text-gray-200">
              Work Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-[#f5f5f5] dark:bg-[#3c3c3c] border-none text-[#101010] dark:text-white rounded-none"
              placeholder="Enter work title"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium mb-2 text-[#101010] dark:text-gray-200">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-[#f5f5f5] dark:bg-[#3c3c3c] border-none text-[#101010] dark:text-white rounded-none"
              rows={4}
              placeholder="Describe your work..."
            />
          </div>

          <div className="space-y-2">
              <Label htmlFor="shareUrl" className="mb-2 text-[#101010] dark:text-gray-200 font-medium">
                Share URL
              </Label>
              <Input
                id="shareUrl"
                value={formData.shareUrl}
                onChange={(e) => setFormData({ ...formData, shareUrl: e.target.value })}
                placeholder="Enter optional shareable URL"
                className="bg-[#f5f5f5] dark:bg-[#3c3c3c] text-[#101010] dark:text-white border-none rounded-none"
              />
          </div>


          {/* TIME RANGE */}
          <div className="space-y-2">
            <Label htmlFor="timeRange" className="font-medium mb-2 text-[#101010] dark:text-gray-200">
              Time Range
            </Label>
            <Input
              id="timeRange"
              value={formData.timeRange}
              onChange={(e) => setFormData({ ...formData, timeRange: e.target.value })}
              className="bg-[#f5f5f5] dark:bg-[#3c3c3c] border-none text-[#101010] dark:text-white rounded-none"
              placeholder="e.g., 10am–2pm"
            />
          </div>

          {/* IMAGES */}
          <div className="space-y-3">
            <Label className="font-medium mb-2 text-[#101010] dark:text-gray-200">Images</Label>

            {/* EXISTING IMAGES */}
            {work.images.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Images</p>

                <div className="grid grid-cols-4 gap-3">
                  {work.images.map((img) => {
                    const removed = imagesToRemove.includes(img.publicId);
                    return (
                      <div key={img.publicId} className="relative group">
                        <div
                          className={`
                            aspect-square rounded-md overflow-hidden border 
                            ${removed ? 'opacity-40' : ''}
                            border-[#e5e5e5] dark:border-[#3c3c3c]
                          `}
                        >
                          <Image
                            src={img.url}
                            alt="Work"
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>

                        {/* REMOVE / UNDO BUTTON */}
                        {removed ? (
                          <button
                            type="button"
                            onClick={() => undoRemoveImage(img.publicId)}
                            className="absolute top-1 right-1 bg-green-600 text-white p-1 rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeExistingImage(img.publicId)}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* NEW IMAGE UPLOAD */}
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Add More Images</p>

              <label
                className="
                  flex flex-col items-center justify-center
                  w-full h-32 rounded-none border-2 border-dashed
                  border-[#cfcfcf] dark:border-[#3c3c3c]
                  bg-[#f5f5f5] dark:bg-[#3c3c3c]
                  cursor-pointer hover:bg-[#e5e5e5] dark:hover:bg-[#2c2c2c]
                "
              >
                <Upload className="w-7 h-7 mb-1 text-gray-600 dark:text-gray-300" />
                <p className="text-sm text-gray-600 dark:text-gray-300">Click to add images</p>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-md overflow-hidden border bg-gray-100 border-[#e5e5e5] dark:border-[#3c3c3c]">
                        <img src={preview} className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border border-[#cfcfcf] dark:border-[#3c3c3c] rounded-none"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="bg-[#2b564e] hover:bg-[#244742] text-white rounded-none"
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
