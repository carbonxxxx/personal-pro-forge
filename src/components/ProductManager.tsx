import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Package, Trash2, Edit3, ImageIcon } from "lucide-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import SubscriptionLimitModal from "./SubscriptionLimitModal";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category?: string;
}

interface ProductManagerProps {
  products: Product[];
  onChange: (products: Product[]) => void;
}

const ProductManager = ({ products, onChange }: ProductManagerProps) => {
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const { currentPlan } = useSubscriptions();

  const getProductLimits = () => {
    if (!currentPlan) return { maxProducts: 1, maxImages: 1 };
    
    const limits = {
      free: { maxProducts: 1, maxImages: 1 },
      premium: { maxProducts: 5, maxImages: 3 },
      business: { maxProducts: 15, maxImages: 5 },
      super: { maxProducts: 50, maxImages: 10 }
    };
    
    return limits[currentPlan.tier as keyof typeof limits] || limits.free;
  };

  const limits = getProductLimits();

  const addProduct = () => {
    if (products.length >= limits.maxProducts) {
      setShowLimitModal(true);
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: 0,
      currency: 'LYD',
      images: [],
      category: ''
    };
    onChange([...products, newProduct]);
    setEditingProduct(newProduct.id);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    onChange(products.map(product => 
      product.id === id ? { ...product, ...updates } : product
    ));
  };

  const removeProduct = (id: string) => {
    onChange(products.filter(product => product.id !== id));
    if (editingProduct === id) {
      setEditingProduct(null);
    }
  };

  const addImageToProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    if (product.images.length >= limits.maxImages) {
      setShowLimitModal(true);
      return;
    }

    const imageUrl = prompt('أدخل رابط صورة المنتج:');
    if (!imageUrl) return;

    updateProduct(productId, {
      images: [...product.images, imageUrl]
    });
  };

  const removeImageFromProduct = (productId: string, imageIndex: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    updateProduct(productId, {
      images: product.images.filter((_, index) => index !== imageIndex)
    });
  };

  const categories = [
    'إلكترونيات',
    'أزياء',
    'كتب',
    'رياضة',
    'صحة وجمال',
    'منزل وحديقة',
    'أطعمة',
    'خدمات',
    'فن وحرف',
    'أخرى'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold arabic-heading">المنتجات والخدمات</h3>
          <p className="text-sm text-muted-foreground arabic-body">
            يمكنك إضافة {limits.maxProducts} منتج{limits.maxProducts > 1 ? '' : ''} بحد أقصى {limits.maxImages} صورة لكل منتج
          </p>
        </div>
        <Button
          onClick={addProduct}
          variant="outline"
          className="arabic-body"
          disabled={products.length >= limits.maxProducts}
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة منتج
        </Button>
      </div>

      {products.map((product) => (
        <Card key={product.id} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h4 className="font-medium arabic-heading">
                {product.name || 'منتج جديد'}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingProduct(
                  editingProduct === product.id ? null : product.id
                )}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeProduct(product.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {editingProduct === product.id && (
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor={`product-name-${product.id}`} className="arabic-body">اسم المنتج</Label>
                <Input
                  id={`product-name-${product.id}`}
                  value={product.name}
                  onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                  placeholder="أدخل اسم المنتج"
                  className="arabic-body"
                />
              </div>
              
              <div>
                <Label htmlFor={`product-category-${product.id}`} className="arabic-body">الفئة</Label>
                <Select
                  value={product.category}
                  onValueChange={(value) => updateProduct(product.id, { category: value })}
                >
                  <SelectTrigger className="arabic-body">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} className="arabic-body">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor={`product-description-${product.id}`} className="arabic-body">وصف المنتج</Label>
                <Textarea
                  id={`product-description-${product.id}`}
                  value={product.description}
                  onChange={(e) => updateProduct(product.id, { description: e.target.value })}
                  placeholder="أدخل وصف المنتج"
                  className="arabic-body"
                />
              </div>

              <div>
                <Label htmlFor={`product-price-${product.id}`} className="arabic-body">السعر</Label>
                <Input
                  id={`product-price-${product.id}`}
                  type="number"
                  value={product.price}
                  onChange={(e) => updateProduct(product.id, { price: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className="arabic-body"
                />
              </div>

              <div>
                <Label htmlFor={`product-currency-${product.id}`} className="arabic-body">العملة</Label>
                <Select
                  value={product.currency}
                  onValueChange={(value) => updateProduct(product.id, { currency: value })}
                >
                  <SelectTrigger className="arabic-body">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LYD" className="arabic-body">دينار ليبي</SelectItem>
                    <SelectItem value="USD" className="arabic-body">دولار أمريكي</SelectItem>
                    <SelectItem value="EUR" className="arabic-body">يورو</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium arabic-body">
                صور المنتج ({product.images.length}/{limits.maxImages})
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addImageToProduct(product.id)}
                disabled={product.images.length >= limits.maxImages}
                className="arabic-body"
              >
                <ImageIcon className="w-4 h-4 ml-2" />
                إضافة صورة
              </Button>
            </div>

            {product.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {product.images.map((imageUrl, imageIndex) => (
                  <div key={imageIndex} className="relative group">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={`${product.name} - صورة ${imageIndex + 1}`}
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
                      onClick={() => removeImageFromProduct(product.id, imageIndex)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {editingProduct !== product.id && product.name && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium arabic-heading">{product.name}</h5>
                    <p className="text-sm text-muted-foreground arabic-body">
                      {product.category} • {product.price} {product.currency}
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}

      {products.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="arabic-body">لم يتم إضافة أي منتجات بعد</p>
          <Button
            onClick={addProduct}
            variant="outline"
            className="mt-4 arabic-body"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة أول منتج
          </Button>
        </div>
      )}

      <SubscriptionLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        limitType="products"
        currentLimit={limits.maxProducts}
        requiredTier="premium"
      />
    </div>
  );
};

export default ProductManager;