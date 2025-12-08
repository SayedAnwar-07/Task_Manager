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
import { Image as ImageIcon, Trash2, Upload } from 'lucide-react';
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
    timeRange: '',
  });
  const [images, setImages] = useState<File[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files);
      setImages([...images, ...newImages]);
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
    setFormData({
      title: '',
      description: '',
      timeRange: '',
    });
    setImages([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="
          sm:max-w-[600px]
          bg-white dark:bg-gray-900
          max-h-[90vh]
          h-full
          overflow-y-auto
          rounded-none
          sm:rounded-lg
        "
      >
        <DialogHeader>
          <DialogTitle>Add New Work</DialogTitle>
          <DialogDescription>
            Submit your work for this task. You can add images to showcase your progress.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className='mb-2' htmlFor="title">Work Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter work title"
                required
              />
            </div>

            <div>
              <Label className='mb-2' htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your work..."
                rows={4}
              />
            </div>

            <div>
              <Label className='mb-2' htmlFor="timeRange">Time Range</Label>
              <Input
                id="timeRange"
                value={formData.timeRange}
                onChange={(e) => setFormData({ ...formData, timeRange: e.target.value })}
                placeholder="e.g., 10am-2pm, 2-4pm"
              />
            </div>

            <div>
              <Label>Images (Optional)</Label>
              <div className="mt-2">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Click to upload images
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">
                      Selected Images ({images.length})
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square w-full rounded-lg border overflow-hidden bg-gray-100">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
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
              className="bg-[#2b564e] hover:bg-[#2b564e]/90 text-white"
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