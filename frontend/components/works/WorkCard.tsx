"use client";

import { useState, useEffect } from 'react';
import { Work } from '@/types/work';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Clock,
  Edit,
  MoreHorizontal,
  Trash2,
  User,
  X,
  Image as ImageIcon,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '../ui/separator';
import { useAuth } from '@/app/providers/AuthProvider';
import { format } from 'date-fns';

interface WorkCardProps {
  work: Work;
  onEdit: (work: Work) => void;
  onDelete: (id: string) => Promise<void>;
  isCreator: boolean; 
}

export default function WorkCard({ work, onEdit, onDelete }: WorkCardProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  const { user } = useAuth();

  const isCreator = user?._id === work.createdBy._id;
  const formatDate = (dateString: string) =>
    format(new Date(dateString), 'dd MMM yyyy, hh:mm aa');

  const openDeleteAlert = () => {
    setIsDeleteAlertOpen(true);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(work._id);
      setIsDeleteAlertOpen(false);
    } catch (error) {
      toast.error('Failed to delete work');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleteAlertOpen(false);
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageLoadError(false);
    setIsImageModalOpen(true);
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImageModalOpen) {
        setIsImageModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isImageModalOpen]);

  return (
    <>
      <div className="border bg-white dark:bg-[#101010] p-4 shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <Badge variant="outline" className="text-xs">
                {work.task.title}
              </Badge>
            </div>
          </div>

          {isCreator && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(work)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Work
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={openDeleteAlert}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? 'Deleting...' : 'Delete Work'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {work.title}
        </h3>

        {/* Description */}
        {work.description && (
          <div className="mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 border p-2">
              {work.description}
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className='flex gap-4'>
            <div className="flex items-start gap-2">
              {work.createdBy.display_image ? (
                <div className="relative h-8 w-8 rounded-full overflow-hidden">
                  <img 
                    src={work.createdBy.display_image} 
                    alt={work.createdBy.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              )}
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Worked By</p>
                <p className="text-sm font-medium truncate">{work.createdBy.name}</p>
              </div>
            </div>
            <Separator orientation="vertical" />
          </div>

          {work.timeRange && (
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Time Range</p>
                <p className="text-sm font-medium">{work.timeRange}</p>
              </div>
            </div>
          )}
        </div>

        {/* Share URL */}
        {work.shareUrl && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Share URL:</p>

            <div className="flex gap-2">
              <span className="text-sm break-all text-blue-600 dark:text-blue-400  p-2 border">
                {work.shareUrl}
              </span>

              <Button
                variant="outline"
                size="sm"
                className="p-2 rounded-none cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(work.shareUrl!);
                  toast.success("Copied!");
                }}
              >
                <Copy />
              </Button>
            </div>
          </div>
        )}



        {/* Images Preview */}
        {work.images && work.images.length > 0 && (
          <div className="mt-4 pt-4 border-t dark:border-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Attached Images ({work.images.length})
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {work.images.map((image, index) => (
                <button
                  key={image._id}
                  onClick={() => openImageModal(image.url)}
                  className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border dark:border-gray-700 hover:opacity-90 transition-opacity group"
                >
                  <img 
                    src={image.url}
                    alt={`Work image ${index + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const button = target.closest('button');
                      if (button) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800';
                        placeholder.innerHTML = '<ImageIcon class="h-6 w-6 text-gray-400" />';
                        button.appendChild(placeholder);
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span>Image Preview</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsImageModalOpen(false)}
                className="rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="relative h-[70vh] w-full flex items-center justify-center bg-gray-100 dark:bg-[#101010] p-4">
            {selectedImage && !imageLoadError ? (
              <img 
                src={selectedImage} 
                alt="Work image" 
                className="max-h-full max-w-full object-contain"
                onError={() => setImageLoadError(true)}
                onClick={() => {
                  // Optional: Add click to close or open in new tab
                  window.open(selectedImage, '_blank');
                }}
                style={{ cursor: 'pointer' }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <ImageIcon className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Failed to load image
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.open(selectedImage, '_blank')}
                >
                  Open in new tab
                </Button>
              </div>
            )}
          </div>
          <div className="px-6 pb-6 pt-4 border-t">
            <div className="text-sm text-gray-600 flex items-center justify-between">
              <span>Click image to open in new tab</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(selectedImage, '_blank')}
              >
                Open full size
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      {isDeleteAlertOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Alert variant="destructive" className="w-full max-w-md shadow-lg">
            <AlertTitle className="text-lg font-semibold">Delete Work</AlertTitle>
            <AlertDescription className="space-y-4">
              <p className='dark:text-white text-black'>
                Are you sure you want to delete this work? This action cannot be undone and the work will be permanently removed.
              </p>
              <div className="flex justify-end space-x-3 mt-4">
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  className="border-gray-300 hover:bg-gray-100"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </>
  );
}