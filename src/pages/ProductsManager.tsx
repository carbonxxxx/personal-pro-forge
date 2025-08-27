import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  DollarSign,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Link as LinkIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  category: string | null;
  images: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ProductsManager = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<UserProduct | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'LYD',
    category: '',
    images: [] as string[]
  });

  const categories = [
    'خدمات تقنية',
    'تصميم',
    'برمجة',
    'استشارات',
    'تسويق',
    'تدريب',
    'منتجات رقمية',
    'أخرى'
  ];

  const fetchProducts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data || []).map(product => ({
        ...product,
        images: Array.isArray(product.images) ? product.images : []
      })));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('خطأ في جلب المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name.trim() || !formData.price) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }

    try {
      setLoading(true);
      
      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        currency: formData.currency,
        category: formData.category || null,
        images: formData.images,
        user_id: user.id,
        profile_id: user.id // Assuming profile_id matches user_id for now
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('user_products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        const { error } = await supabase
          .from('user_products')
          .insert([productData]);

        if (error) throw error;
        toast.success('تم إضافة المنتج بنجاح');
      }

      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('خطأ في حفظ المنتج');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: UserProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      currency: product.currency,
      category: product.category || '',
      images: product.images || []
    });
    setDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      const { error } = await supabase
        .from('user_products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      
      toast.success('تم حذف المنتج بنجاح');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('خطأ في حذف المنتج');
    }
  };

  const toggleProductStatus = async (productId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('user_products')
        .update({ is_active: !isActive })
        .eq('id', productId);

      if (error) throw error;
      
      toast.success(`تم ${!isActive ? 'تفعيل' : 'إلغاء تفعيل'} المنتج`);
      fetchProducts();
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error('خطأ في تغيير حالة المنتج');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: 'LYD',
      category: '',
      images: []
    });
    setEditingProduct(null);
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground arabic-body">جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold arabic-heading">إدارة المنتجات</h1>
              <p className="text-muted-foreground arabic-body mt-2">أضف وأدِر منتجاتك وخدماتك</p>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary rounded-xl"
                  onClick={resetForm}
                >
                  <Plus className="w-5 h-5 ml-2" />
                  إضافة منتج جديد
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="arabic-heading">
                    {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label className="arabic-body font-medium">اسم المنتج *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="أدخل اسم المنتج أو الخدمة"
                      className="rounded-xl border-gray-200 focus:border-primary/40 focus:ring-primary/20 h-12 mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label className="arabic-body font-medium">الوصف</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="وصف تفصيلي للمنتج أو الخدمة"
                      className="rounded-xl border-gray-200 focus:border-primary/40 focus:ring-primary/20 mt-2"
                      rows={4}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="arabic-body font-medium">السعر *</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        placeholder="0.00"
                        className="rounded-xl border-gray-200 focus:border-primary/40 focus:ring-primary/20 h-12 mt-2"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label className="arabic-body font-medium">العملة</Label>
                      <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                        <SelectTrigger className="rounded-xl border-gray-200 focus:border-primary/40 h-12 mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LYD">دينار ليبي (LYD)</SelectItem>
                          <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                          <SelectItem value="EUR">يورو (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="arabic-body font-medium">الفئة</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger className="rounded-xl border-gray-200 focus:border-primary/40 h-12 mt-2">
                        <SelectValue placeholder="اختر فئة المنتج" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary rounded-xl h-12">
                      {loading ? "جاري الحفظ..." : editingProduct ? "تحديث المنتج" : "إضافة المنتج"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 rounded-xl h-12">
                      إلغاء
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {products.length === 0 ? (
          <Card className="p-12 rounded-2xl border-gray-200 text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-xl font-bold mb-4 arabic-heading">لا توجد منتجات بعد</h3>
            <p className="text-muted-foreground arabic-body mb-6">ابدأ بإضافة منتجاتك أو خدماتك للعرض في ملفك الشخصي</p>
            <Button 
              className="bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary rounded-xl"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="w-5 h-5 ml-2" />
              إضافة أول منتج
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="p-6 rounded-2xl border-gray-200 hover:shadow-lg transition-shadow duration-300">
                {/* Product Image */}
                <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-premium/10 rounded-xl mb-4 flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold arabic-heading">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleProductStatus(product.id, product.is_active)}
                        className="p-2"
                      >
                        {product.is_active ? (
                          <Eye className="w-4 h-4 text-success" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {product.description && (
                    <p className="text-sm text-muted-foreground arabic-body line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold arabic-heading text-primary">
                      {product.price} {product.currency}
                    </div>
                    {product.category && (
                      <Badge className="bg-muted text-muted-foreground">
                        {product.category}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Badge className={`${product.is_active ? 'bg-success' : 'bg-muted'} text-white`}>
                      {product.is_active ? 'نشط' : 'غير نشط'}
                    </Badge>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                        className="rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(product.id)}
                        className="text-destructive hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsManager;