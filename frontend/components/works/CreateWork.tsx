'use client';

import { useState } from 'react';
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
import { Trash2, Upload } from 'lucide-react';
import { workApi } from '@/lib/work-api';
import { toast } from 'sonner';

interface CreateWorkProps {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateWork({ taskId, open, onOpenChange, onSuccess }: CreateWorkProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shareUrl: '',
    timeRange: '',
  });
  const [images, setImages] = useState<File[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setImages([...images, ...Array.from(files)]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      setLoading(true);
      await workApi.create(taskId, {
        ...formData,
        images,
      });

      toast.success('Work created successfully');
      onSuccess();
      resetForm();
    } catch (error) {
      toast.error('Failed to create work');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', timeRange: '', shareUrl: '' });
    setImages([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          sm:max-w-[600px]
          bg-white dark:bg-[#101010]
          max-h-[90vh]
          overflow-y-auto
          border border-[#e5e5e5] dark:border-[#3c3c3c]
          rounded-none
        "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#101010] dark:text-white">
            Add New Work
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
            Submit your work for this task. You can add images to showcase your progress.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="mb-2 text-[#101010] dark:text-gray-200 font-medium">
              Work Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter work title"
              className="bg-[#f5f5f5] dark:bg-[#3c3c3c] text-[#101010] dark:text-white border-none rounded-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="mb-2 text-[#101010] dark:text-gray-200 font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your work..."
              rows={4}
              className="bg-[#f5f5f5] dark:bg-[#3c3c3c] text-[#101010] dark:text-white border-none rounded-none"
            />
          </div>

          {/* share url */}
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

          {/* Time Range */}
          <div className="space-y-2">
            <Label htmlFor="timeRange" className="mb-2 text-[#101010] dark:text-gray-200 font-medium">
              Time Range
            </Label>
            <Input
              id="timeRange"
              value={formData.timeRange}
              onChange={(e) => setFormData({ ...formData, timeRange: e.target.value })}
              placeholder="e.g., 10am–2pm"
              className="bg-[#f5f5f5] dark:bg-[#3c3c3c] text-[#101010] dark:text-white border-none rounded-none"
            />
          </div>

          {/* Images */}
          <div className="space-y-3">
            <Label className="mb-2 text-[#101010] dark:text-gray-200 font-medium">Images (Optional)</Label>

            <label
              className="
                flex flex-col items-center justify-center
                w-full h-32 rounded-none border-2 border-dashed
                border-[#cfcfcf] dark:border-[#3c3c3c]
                bg-[#f5f5f5] dark:bg-[#3c3c3c]
                cursor-pointer hover:bg-[#e5e5e5] dark:hover:bg-[#2c2c2c]
              "
            >
              <Upload className="w-8 h-8 mb-2 text-gray-600 dark:text-gray-300" />
              <p className="text-sm text-gray-600 dark:text-gray-300">Click to upload images</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>

            {images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2 text-[#101010] dark:text-gray-200">
                  Selected Images ({images.length})
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square w-full rounded-none border overflow-hidden bg-gray-100 border-[#e5e5e5] dark:border-[#3c3c3c]">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="space-x-2">
            <Button
              type="button"
              variant="outline"
              className="border border-[#cfcfcf] dark:border-[#3c3c3c] rounded-none"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#2b564e] hover:bg-[#244742] text-white rounded-none"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Work'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
