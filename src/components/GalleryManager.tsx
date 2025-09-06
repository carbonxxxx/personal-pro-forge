import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, X, ImagePlus, Trash2, Edit3 } from "lucide-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import SubscriptionLimitModal from "./SubscriptionLimitModal";

interface Gallery {
  id: string;
  title: string;
  description?: string;
  images: Array<{
    url: string;
    title?: string;
    description?: string;
  }>;
}

interface GalleryManagerProps {
  galleries: Gallery[];
  onChange: (galleries: Gallery[]) => void;
  maxGalleries?: number;
  maxImagesPerGallery?: number;
}

const GalleryManager = ({ 
  galleries, 
  onChange, 
  maxGalleries = 1, 
  maxImagesPerGallery = 5 
}: GalleryManagerProps) => {
  const [editingGallery, setEditingGallery] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const { currentPlan } = useSubscriptions();

  const getGalleryLimits = () => {
    if (!currentPlan) return { maxGalleries: 1, maxImages: 3 };
    
    const limits = {
      free: { maxGalleries: 1, maxImages: 3 },
      premium: { maxGalleries: 3, maxImages: 10 },
      business: { maxGalleries: 5, maxImages: 20 },
      super: { maxGalleries: 10, maxImages: 50 }
    };
    
    return limits[currentPlan.tier as keyof typeof limits] || limits.free;
  };

  const limits = getGalleryLimits();

  const addGallery = () => {
    if (galleries.length >= limits.maxGalleries) {
      setShowLimitModal(true);
      return;
    }

    const newGallery: Gallery = {
      id: Date.now().toString(),
      title: '',
      description: '',
      images: []
    };
    onChange([...galleries, newGallery]);
    setEditingGallery(newGallery.id);
  };

  const updateGallery = (id: string, updates: Partial<Gallery>) => {
    onChange(galleries.map(gallery => 
      gallery.id === id ? { ...gallery, ...updates } : gallery
    ));
  };

  const removeGallery = (id: string) => {
    onChange(galleries.filter(gallery => gallery.id !== id));
    if (editingGallery === id) {
      setEditingGallery(null);
    }
  };

  const addImageToGallery = (galleryId: string) => {
    const gallery = galleries.find(g => g.id === galleryId);
    if (!gallery) return;
    
    if (gallery.images.length >= limits.maxImages) {
      setShowLimitModal(true);
      return;
    }

    const imageUrl = prompt('أدخل رابط الصورة:');
    if (!imageUrl) return;

    const newImage = {
      url: imageUrl,
      title: '',
      description: ''
    };

    updateGallery(galleryId, {
      images: [...gallery.images, newImage]
    });
  };

  const removeImageFromGallery = (galleryId: string, imageIndex: number) => {
    const gallery = galleries.find(g => g.id === galleryId);
    if (!gallery) return;

    updateGallery(galleryId, {
      images: gallery.images.filter((_, index) => index !== imageIndex)
    });
  };

  const updateImage = (galleryId: string, imageIndex: number, updates: Partial<{ url: string; title: string; description: string }>) => {
    const gallery = galleries.find(g => g.id === galleryId);
    if (!gallery) return;

    const updatedImages = gallery.images.map((img, index) =>
      index === imageIndex ? { ...img, ...updates } : img
    );

    updateGallery(galleryId, { images: updatedImages });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold arabic-heading">معارض الصور</h3>
          <p className="text-sm text-muted-foreground arabic-body">
            يمكنك إنشاء {limits.maxGalleries} معرض{limits.maxGalleries > 1 ? '' : ''} بحد أقصى {limits.maxImages} صورة لكل معرض
          </p>
        </div>
        <Button
          onClick={addGallery}
          variant="outline"
          className="arabic-body"
          disabled={galleries.length >= limits.maxGalleries}
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة معرض
        </Button>
      </div>

      {galleries.map((gallery) => (
        <Card key={gallery.id} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h4 className="font-medium arabic-heading">
                {gallery.title || 'معرض جديد'}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingGallery(
                  editingGallery === gallery.id ? null : gallery.id
                )}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeGallery(gallery.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {editingGallery === gallery.id && (
            <div className="space-y-4 mb-4">
              <div>
                <Label htmlFor={`gallery-title-${gallery.id}`} className="arabic-body">عنوان المعرض</Label>
                <Input
                  id={`gallery-title-${gallery.id}`}
                  value={gallery.title}
                  onChange={(e) => updateGallery(gallery.id, { title: e.target.value })}
                  placeholder="أدخل عنوان المعرض"
                  className="arabic-body"
                />
              </div>
              <div>
                <Label htmlFor={`gallery-description-${gallery.id}`} className="arabic-body">وصف المعرض</Label>
                <Textarea
                  id={`gallery-description-${gallery.id}`}
                  value={gallery.description || ''}
                  onChange={(e) => updateGallery(gallery.id, { description: e.target.value })}
                  placeholder="أدخل وصف المعرض"
                  className="arabic-body"
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium arabic-body">
                الصور ({gallery.images.length}/{limits.maxImages})
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addImageToGallery(gallery.id)}
                disabled={gallery.images.length >= limits.maxImages}
                className="arabic-body"
              >
                <ImagePlus className="w-4 h-4 ml-2" />
                إضافة صورة
              </Button>
            </div>

            {gallery.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gallery.images.map((image, imageIndex) => (
                  <div key={imageIndex} className="relative group">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.title || `صورة ${imageIndex + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f3f4f6"/><text x="100" y="100" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="14" fill="%236b7280">صورة غير متاحة</text></svg>';
                        }}
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImageFromGallery(gallery.id, imageIndex)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    {editingGallery === gallery.id && (
                      <div className="mt-2 space-y-1">
                        <Input
                          placeholder="عنوان الصورة"
                          value={image.title || ''}
                          onChange={(e) => updateImage(gallery.id, imageIndex, { title: e.target.value })}
                          className="text-xs arabic-body"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      ))}

      {galleries.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ImagePlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="arabic-body">لم يتم إضافة أي معارض بعد</p>
          <Button
            onClick={addGallery}
            variant="outline"
            className="mt-4 arabic-body"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة أول معرض
          </Button>
        </div>
      )}

      <SubscriptionLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        limitType="galleries"
        currentLimit={limits.maxGalleries}
        requiredTier="premium"
      />
    </div>
  );
};

export default GalleryManager;