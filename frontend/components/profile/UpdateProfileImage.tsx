"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload, X, Check } from "lucide-react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { toast } from "sonner";

interface UpdateProfileImageProps {
  userId: string;
  token: string | null;
  currentImage: string | null;
  onUpdate: () => void;
}

export default function UpdateProfileImage({ 
  userId, 
  token, 
  currentImage,
  onUpdate 
}: UpdateProfileImageProps) {
  const [isCropping, setIsCropping] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCropImage(reader.result as string);
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", (err) => reject(err));
      img.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<File> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas context is null");
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], "profile.jpg", {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(file);
          }
        },
        "image/jpeg",
        0.95
      );
    });
  };

  const handleCropDone = async () => {
    if (!cropImage || !croppedAreaPixels || !token || !userId) {
      toast.error("Something went wrong");
      return;
    }

    setIsUploading(true);

    try {
      const croppedFile = await getCroppedImg(cropImage, croppedAreaPixels);
      
      const formData = new FormData();
      formData.append("display_image", croppedFile);

      const response = await fetch(
        `http://localhost:5000/api/users/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update image");
      }

      const updatedData = await response.json();
      
      toast.success("Profile picture updated successfully!");
      setIsCropping(false);
      setCropImage(null);
      
      // Refresh parent component
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to update image");
    } finally {
      setIsUploading(false);
    }
  };

  const removeProfileImage = async () => {
    if (!token || !userId) {
      toast.error("Authentication required");
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            display_image: null
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove image");
      }

      toast.success("Profile picture removed successfully!");
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove image");
    } finally {
      setIsUploading(false);
    }
  };

  const avatarUrl = currentImage || 
    `https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff&bold=true`;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      {/* Crop Modal */}
      {isCropping && cropImage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#101010] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Crop Profile Picture
                </h3>
                <button
                  onClick={() => {
                    setIsCropping(false);
                    setCropImage(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  disabled={isUploading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="relative w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <Cropper
                  image={cropImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  cropShape="round"
                  showGrid={false}
                  classes={{
                    containerClassName: "rounded-lg",
                    mediaClassName: "rounded-lg",
                  }}
                />
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Zoom</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {zoom.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  disabled={isUploading}
                />
                
                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCropping(false);
                      setCropImage(null);
                    }}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCropDone}
                    disabled={isUploading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Save Picture
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Update Interface */}
      <div className="space-y-6">
        <div className="flex flex-col items-center">
          <Avatar className="h-32 w-32 border-4 border-gray-200 dark:border-gray-700 mb-4">
            <AvatarImage src={avatarUrl} alt="Profile" />
            <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {getInitials("User")}
            </AvatarFallback>
          </Avatar>
          
          
        </div>

        <div className="space-y-3">
          <div>
            <input
              id="profile-image-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            <Button
              onClick={() => document.getElementById('profile-image-input')?.click()}
              className="w-full"
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload New Photo"}
            </Button>
          </div>
          
          {currentImage && (
            <Button
              variant="outline"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={removeProfileImage}
              disabled={isUploading}
            >
              <X className="w-4 h-4 mr-2" />
              Remove Current Photo
            </Button>
          )}
        </div>
      </div>
    </>
  );
}