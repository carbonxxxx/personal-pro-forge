import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Users, 
  CreditCard, 
  Package, 
  Settings, 
  Plus, 
  Edit, 
  Trash2,
  Check,
  X,
  DollarSign,
  TrendingUp,
  UserCheck,
  ShoppingBag,
  Eye,
  Lock,
  Unlock,
  Wallet,
  FileText,
  Star,
  Globe,
  Shield,
  Database,
  Activity,
  AlertTriangle,
  Search,
  Filter
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePayments } from "@/hooks/usePayments";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { useTemplates } from "@/hooks/useTemplates";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  profile?: {
    display_name?: string;
    wallet_balance?: number;
    total_earnings?: number;
    referral_count?: number;
    is_active?: boolean;
  };
  subscription?: {
    status: string;
    subscription_plan: {
      name: string;
      tier: string;
    };
  };
}

interface ProductData {
  id: string;
  name: string;
  price: number;
  currency: string;
  is_active: boolean;
  user_id: string;
  profile_id: string;
  category?: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { transactions, getTransactionStatusText, getTransactionTypeText, getPaymentMethodName } = usePayments();
  const { plans } = useSubscriptions();
  const { profiles } = useUserProfiles();
  const { templates } = useTemplates();
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [newPlan, setNewPlan] = useState({
    name: '',
    name_en: '',
    description: '',
    price: 0,
    currency: 'LYD',
    period: 'monthly',
    tier: 'free',
    max_profiles: 1,
    max_templates: 1,
    features: [],
    limitations: []
  });

  // جلب بيانات المستخدمين
  const fetchUsers = async () => {
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      const usersWithProfiles = await Promise.all(
        authUsers.users.map(async (authUser) => {
          // جلب الملف الشخصي
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', authUser.id)
            .single();

          // جلب الاشتراك
          const { data: subscription } = await supabase
            .from('user_subscriptions')
            .select(`
              *,
              subscription_plan:subscription_plans(name, tier)
            `)
            .eq('user_id', authUser.id)
            .eq('status', 'active')
            .single();

          return {
            id: authUser.id,
            email: authUser.email || '',
            created_at: authUser.created_at,
            last_sign_in_at: authUser.last_sign_in_at,
            profile,
            subscription
          };
        })
      );

      setUsers(usersWithProfiles);
    } catch (error) {
      console.error('خطأ في جلب المستخدمين:', error);
    }
  };

  // جلب بيانات المنتجات
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('user_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('خطأ في جلب المنتجات:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchProducts();
    }
  }, [user]);

  // معالجة تحديث حالة المعاملة
  const handleTransactionUpdate = async (transactionId: string, status: 'approved' | 'rejected') => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('wallet_transactions')
        .update({
          status: status,
          processed_by: user.id,
          processed_at: new Date().toISOString(),
          admin_notes: adminNotes || null
        })
        .eq('id', transactionId);

      if (error) throw error;
      
      toast.success(`تم ${status === 'approved' ? 'الموافقة على' : 'رفض'} المعاملة`);
      setSelectedTransaction(null);
      setAdminNotes('');
      
      window.location.reload();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('حدث خطأ أثناء تحديث المعاملة');
    } finally {
      setLoading(false);
    }
  };

  // تفعيل/إلغاء تفعيل المستخدم (placeholder - profiles table doesn't have is_active)
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      // Note: profiles table doesn't have is_active field, 
      // so this is just a placeholder function
      toast.info('وظيفة تفعيل/إلغاء تفعيل المستخدم ستتم إضافتها قريباً');
    } catch (error) {
      console.error('خطأ في تحديث حالة المستخدم:', error);
      toast.error('حدث خطأ أثناء تحديث حالة المستخدم');
    }
  };

  // حذف المستخدم
  const deleteUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      
      toast.success('تم حذف المستخدم بنجاح');
      fetchUsers();
    } catch (error) {
      console.error('خطأ في حذف المستخدم:', error);
      toast.error('حدث خطأ أثناء حذف المستخدم');
    }
  };

  // تفعيل/إلغاء تفعيل المنتج
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
      console.error('خطأ في تحديث حالة المنتج:', error);
      toast.error('حدث خطأ أثناء تحديث حالة المنتج');
    }
  };

  // إنشاء/تحديث باقة الاشتراك
  const handlePlanSubmit = async () => {
    try {
      if (editingPlan) {
        const { error } = await supabase
          .from('subscription_plans')
          .update(newPlan)
          .eq('id', editingPlan.id);
        if (error) throw error;
        toast.success('تم تحديث الباقة بنجاح');
      } else {
        const { error } = await supabase
          .from('subscription_plans')
          .insert(newPlan);
        if (error) throw error;
        toast.success('تم إنشاء الباقة بنجاح');
      }
      
      setEditingPlan(null);
      setNewPlan({
        name: '', name_en: '', description: '', price: 0, currency: 'LYD',
        period: 'monthly', tier: 'free', max_profiles: 1, max_templates: 1,
        features: [], limitations: []
      });
      window.location.reload();
    } catch (error) {
      console.error('خطأ في معالجة الباقة:', error);
      toast.error('حدث خطأ أثناء معالجة الباقة');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-success text-white';
      case 'pending':
        return 'bg-orange-500 text-white';
      case 'rejected':
        return 'bg-destructive text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // إحصائيات شاملة
  const totalTransactions = transactions.length;
  const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
  const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const approvedAmount = transactions
    .filter(t => t.status === 'approved' || t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const totalUsers = users.length;
  const activeUsers = users.length; // All users are considered active since profiles table doesn't have is_active
  const totalProfiles = profiles.length;
  const activeProfiles = profiles.filter(p => p.is_active).length;

  // تصفية البيانات
  const filteredTransactions = transactions.filter(t => 
    (filterStatus === 'all' || t.status === filterStatus) &&
    (searchTerm === '' || 
     t.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
     getTransactionTypeText(t.transaction_type).includes(searchTerm)
    )
  );

  const filteredUsers = users.filter(u =>
    searchTerm === '' || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.profile?.display_name && u.profile.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold arabic-heading text-foreground">لوحة الإدارة الشاملة</h1>
              <p className="text-muted-foreground arabic-body mt-2">التحكم الكامل في منصة الملفات الشخصية</p>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="arabic-body">
                <Shield className="w-4 h-4 ml-2" />
                أدمن مفعل
              </Badge>
              <Badge variant="outline" className="arabic-body">
                <Activity className="w-4 h-4 ml-2" />
                متصل
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards الشاملة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 rounded-2xl border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-glow rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground arabic-body">إجمالي المعاملات</p>
                <p className="text-2xl font-bold arabic-heading text-foreground">{totalTransactions}</p>
                <p className="text-xs text-success arabic-body">معلقة: {pendingTransactions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-success to-green-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground arabic-body">المستخدمين</p>
                <p className="text-2xl font-bold arabic-heading text-foreground">{totalUsers}</p>
                <p className="text-xs text-success arabic-body">نشط: {activeUsers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-premium to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground arabic-body">الملفات الشخصية</p>
                <p className="text-2xl font-bold arabic-heading text-foreground">{totalProfiles}</p>
                <p className="text-xs text-success arabic-body">نشط: {activeProfiles}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-gold to-yellow-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground arabic-body">الأرباح</p>
                <p className="text-2xl font-bold arabic-heading text-foreground">{approvedAmount.toFixed(2)} د.ل</p>
                <p className="text-xs text-muted-foreground arabic-body">من {totalAmount.toFixed(2)} د.ل</p>
              </div>
            </div>
          </Card>
        </div>

        {/* البحث والتصفية */}
        <Card className="p-4 rounded-2xl border-border mb-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="البحث في كل شيء..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 arabic-body"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="approved">مُوافق</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 rounded-2xl p-1 h-12">
            <TabsTrigger value="transactions" className="rounded-xl arabic-body">المعاملات</TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl arabic-body">المستخدمين</TabsTrigger>
            <TabsTrigger value="profiles" className="rounded-xl arabic-body">الملفات</TabsTrigger>
            <TabsTrigger value="products" className="rounded-xl arabic-body">المنتجات</TabsTrigger>
            <TabsTrigger value="plans" className="rounded-xl arabic-body">الباقات</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl arabic-body">الإعدادات</TabsTrigger>
          </TabsList>

          {/* إدارة المعاملات المالية */}
          <TabsContent value="transactions">
            <Card className="p-6 rounded-2xl border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold arabic-heading text-foreground">إدارة المحافظ والمعاملات</h3>
                <div className="flex gap-2">
                  <Badge className="bg-orange-100 text-orange-800 arabic-body">
                    {pendingTransactions} معاملة معلقة
                  </Badge>
                  <Badge variant="outline" className="arabic-body">
                    <Wallet className="w-4 h-4 ml-1" />
                    محفظة ذكية
                  </Badge>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="arabic-body">المعاملة</TableHead>
                      <TableHead className="arabic-body">المستخدم</TableHead>
                      <TableHead className="arabic-body">المبلغ</TableHead>
                      <TableHead className="arabic-body">الحالة</TableHead>
                      <TableHead className="arabic-body">التاريخ</TableHead>
                      <TableHead className="arabic-body">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium arabic-body text-foreground">
                              {getTransactionTypeText(transaction.transaction_type)}
                            </div>
                            <div className="text-sm text-muted-foreground arabic-body">
                              {transaction.payment_method && getPaymentMethodName(transaction.payment_method)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="arabic-body text-foreground">
                            {transaction.user_id.slice(0, 8)}...
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold arabic-heading text-foreground">
                            {transaction.amount} د.ل
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>
                            {getTransactionStatusText(transaction.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="arabic-body text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString('ar')}
                        </TableCell>
                        <TableCell>
                          {transaction.status === 'pending' && (
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-success border-success hover:bg-success/10"
                                    onClick={() => setSelectedTransaction(transaction)}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="rtl">
                                  <DialogHeader>
                                    <DialogTitle className="arabic-heading">تأكيد الموافقة على المعاملة</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Label className="arabic-body">ملاحظات الإدارة (اختياري)</Label>
                                    <Textarea
                                      value={adminNotes}
                                      onChange={(e) => setAdminNotes(e.target.value)}
                                      placeholder="أضف ملاحظة..."
                                      className="arabic-body"
                                    />
                                    <div className="flex gap-2 justify-end">
                                      <Button
                                        onClick={() => handleTransactionUpdate(transaction.id, 'approved')}
                                        disabled={loading}
                                        className="bg-success hover:bg-success/90"
                                      >
                                        تأكيد الموافقة
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive hover:bg-destructive/10"
                                onClick={() => handleTransactionUpdate(transaction.id, 'rejected')}
                                disabled={loading}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          
                          {transaction.receipt_image_url && (
                            <Button size="sm" variant="outline" className="mr-2">
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* إدارة المستخدمين */}
          <TabsContent value="users">
            <Card className="p-6 rounded-2xl border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold arabic-heading text-foreground">إدارة المستخدمين</h3>
                <Badge variant="outline" className="arabic-body">
                  <Database className="w-4 h-4 ml-1" />
                  {totalUsers} مستخدم
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="arabic-body">البريد الإلكتروني</TableHead>
                      <TableHead className="arabic-body">الاسم</TableHead>
                      <TableHead className="arabic-body">رصيد المحفظة</TableHead>
                      <TableHead className="arabic-body">الإحالات</TableHead>
                      <TableHead className="arabic-body">الحالة</TableHead>
                      <TableHead className="arabic-body">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="arabic-body text-foreground">{user.email}</div>
                          <div className="text-xs text-muted-foreground">
                            انضم: {new Date(user.created_at).toLocaleDateString('ar')}
                          </div>
                        </TableCell>
                        <TableCell className="arabic-body text-foreground">
                          {user.profile?.display_name || 'غير محدد'}
                        </TableCell>
                        <TableCell>
                          <div className="font-bold arabic-heading text-success">
                            {user.profile?.wallet_balance?.toFixed(2) || '0.00'} د.ل
                          </div>
                          <div className="text-xs text-muted-foreground">
                            أرباح: {user.profile?.total_earnings?.toFixed(2) || '0.00'} د.ل
                          </div>
                        </TableCell>
                        <TableCell className="arabic-heading font-bold text-premium">
                          {user.profile?.referral_count || 0}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-success text-white">
                            نشط
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleUserStatus(user.id, true)}
                            >
                              <Lock className="w-4 h-4" />
                            </Button>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="rtl max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="arabic-heading">تفاصيل المستخدم</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="arabic-body text-sm">البريد الإلكتروني</Label>
                                      <p className="text-foreground">{user.email}</p>
                                    </div>
                                    <div>
                                      <Label className="arabic-body text-sm">الاسم</Label>
                                      <p className="text-foreground">{user.profile?.display_name || 'غير محدد'}</p>
                                    </div>
                                    <div>
                                      <Label className="arabic-body text-sm">رصيد المحفظة</Label>
                                      <p className="text-success font-bold">{user.profile?.wallet_balance?.toFixed(2) || '0.00'} د.ل</p>
                                    </div>
                                    <div>
                                      <Label className="arabic-body text-sm">إجمالي الأرباح</Label>
                                      <p className="text-gold font-bold">{user.profile?.total_earnings?.toFixed(2) || '0.00'} د.ل</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2 pt-4">
                                    <Button
                                      variant="outline"
                                      onClick={() => toggleUserStatus(user.id, true)}
                                      className="text-orange-600"
                                    >
                                      إدارة المستخدم
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => deleteUser(user.id)}
                                    >
                                      حذف المستخدم
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* إدارة الملفات الشخصية */}
          <TabsContent value="profiles">
            <Card className="p-6 rounded-2xl border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold arabic-heading text-foreground">إدارة الملفات الشخصية</h3>
                <Badge variant="outline" className="arabic-body">
                  <Globe className="w-4 h-4 ml-1" />
                  {profiles.length} ملف شخصي
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profiles.map((profile) => (
                  <Card key={profile.id} className="p-4 rounded-xl border-border">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={profile.is_active ? 'bg-success text-white' : 'bg-destructive text-white'}>
                        {profile.is_active ? 'نشط' : 'معطل'}
                      </Badge>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        <span className="text-xs">{profile.view_count}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="font-medium arabic-body text-foreground">
                        {profile.profile_data?.name || 'اسم غير محدد'}
                      </div>
                      <div className="text-sm text-muted-foreground arabic-body">
                        {profile.profile_data?.title || 'لا يوجد مسمى وظيفي'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        الرابط: {profile.custom_url || 'غير محدد'}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(`/profile/${profile.custom_url}`, '_blank')}
                        disabled={!profile.custom_url}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          // تفعيل/إلغاء تفعيل الملف الشخصي
                          supabase
                            .from('user_profiles')
                            .update({ is_active: !profile.is_active })
                            .eq('id', profile.id)
                            .then(() => {
                              toast.success(`تم ${!profile.is_active ? 'تفعيل' : 'إلغاء تفعيل'} الملف الشخصي`);
                              window.location.reload();
                            });
                        }}
                      >
                        {profile.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* إدارة المنتجات */}
          <TabsContent value="products">
            <Card className="p-6 rounded-2xl border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold arabic-heading text-foreground">إدارة المنتجات</h3>
                <Badge variant="outline" className="arabic-body">
                  <ShoppingBag className="w-4 h-4 ml-1" />
                  {products.length} منتج
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="arabic-body">اسم المنتج</TableHead>
                      <TableHead className="arabic-body">السعر</TableHead>
                      <TableHead className="arabic-body">الفئة</TableHead>
                      <TableHead className="arabic-body">الحالة</TableHead>
                      <TableHead className="arabic-body">التاريخ</TableHead>
                      <TableHead className="arabic-body">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="arabic-body font-medium text-foreground">
                          {product.name}
                        </TableCell>
                        <TableCell className="arabic-heading font-bold text-success">
                          {product.price} {product.currency}
                        </TableCell>
                        <TableCell className="arabic-body text-muted-foreground">
                          {product.category || 'غير محدد'}
                        </TableCell>
                        <TableCell>
                          <Badge className={product.is_active ? 'bg-success text-white' : 'bg-destructive text-white'}>
                            {product.is_active ? 'نشط' : 'معطل'}
                          </Badge>
                        </TableCell>
                        <TableCell className="arabic-body text-muted-foreground">
                          {new Date(product.created_at).toLocaleDateString('ar')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleProductStatus(product.id, product.is_active)}
                            >
                              {product.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* إدارة الباقات */}
          <TabsContent value="plans">
            <Card className="p-6 rounded-2xl border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold arabic-heading text-foreground">إدارة باقات الاشتراك</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-primary to-primary-glow rounded-xl">
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة باقة جديدة
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rtl max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="arabic-heading">
                        {editingPlan ? 'تحديث الباقة' : 'إضافة باقة جديدة'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="arabic-body">الاسم بالعربية</Label>
                        <Input
                          value={newPlan.name}
                          onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                          className="arabic-body"
                        />
                      </div>
                      <div>
                        <Label className="arabic-body">الاسم بالإنجليزية</Label>
                        <Input
                          value={newPlan.name_en}
                          onChange={(e) => setNewPlan({ ...newPlan, name_en: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="arabic-body">السعر</Label>
                        <Input
                          type="number"
                          value={newPlan.price}
                          onChange={(e) => setNewPlan({ ...newPlan, price: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label className="arabic-body">نوع الباقة</Label>
                        <Select value={newPlan.tier} onValueChange={(value) => setNewPlan({ ...newPlan, tier: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">مجاني</SelectItem>
                            <SelectItem value="premium">بريميوم</SelectItem>
                            <SelectItem value="business">أعمال</SelectItem>
                            <SelectItem value="super">سوبر</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label className="arabic-body">الوصف</Label>
                        <Textarea
                          value={newPlan.description}
                          onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                          className="arabic-body"
                        />
                      </div>
                      <div>
                        <Label className="arabic-body">عدد الملفات الشخصية</Label>
                        <Input
                          type="number"
                          value={newPlan.max_profiles}
                          onChange={(e) => setNewPlan({ ...newPlan, max_profiles: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label className="arabic-body">عدد القوالب</Label>
                        <Input
                          type="number"
                          value={newPlan.max_templates}
                          onChange={(e) => setNewPlan({ ...newPlan, max_templates: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-4">
                      <Button onClick={handlePlanSubmit}>
                        {editingPlan ? 'تحديث' : 'إضافة'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card key={plan.id} className="p-6 rounded-xl border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold arabic-heading text-foreground">{plan.name}</h4>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="rounded-lg"
                          onClick={() => {
                            setEditingPlan(plan);
                            setNewPlan(plan);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-muted-foreground arabic-body mb-4">{plan.description}</p>
                    <div className="text-2xl font-bold arabic-heading text-success mb-4">
                      {plan.price} {plan.currency} / {plan.period}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`${plan.tier === 'free' ? 'bg-muted' : 'bg-primary'} text-white`}>
                          {plan.tier}
                        </Badge>
                        <Badge variant="outline" className="arabic-body">
                          {plan.max_profiles} ملف
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* إعدادات النظام */}
          <TabsContent value="settings">
            <Card className="p-6 rounded-2xl border-border">
              <h3 className="text-xl font-bold mb-6 arabic-heading text-foreground">إعدادات النظام الشاملة</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-4 rounded-xl border-border">
                  <h4 className="font-semibold mb-3 arabic-heading text-foreground">إعدادات الأمان</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="arabic-body text-foreground">المصادقة الثنائية</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="arabic-body text-foreground">تسجيل العمليات</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="arabic-body text-foreground">النسخ الاحتياطي التلقائي</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </Card>

                <Card className="p-4 rounded-xl border-border">
                  <h4 className="font-semibold mb-3 arabic-heading text-foreground">إعدادات المنصة</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="arabic-body text-foreground">التسجيل المفتوح</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="arabic-body text-foreground">الموافقة على الملفات</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="arabic-body text-foreground">نظام الإحالات</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </Card>

                <Card className="p-4 rounded-xl border-border">
                  <h4 className="font-semibold mb-3 arabic-heading text-foreground">إحصائيات المنصة</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="arabic-body text-muted-foreground">إجمالي المستخدمين</span>
                      <span className="font-bold text-foreground">{totalUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="arabic-body text-muted-foreground">الملفات النشطة</span>
                      <span className="font-bold text-success">{activeProfiles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="arabic-body text-muted-foreground">القوالب المتاحة</span>
                      <span className="font-bold text-premium">{templates.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="arabic-body text-muted-foreground">الأرباح الإجمالية</span>
                      <span className="font-bold text-gold">{approvedAmount.toFixed(2)} د.ل</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 rounded-xl border-border">
                  <h4 className="font-semibold mb-3 arabic-heading text-foreground">أدوات الإدارة</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Database className="w-4 h-4 ml-2" />
                      نسخ احتياطي للبيانات
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <AlertTriangle className="w-4 h-4 ml-2" />
                      تنظيف البيانات
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="w-4 h-4 ml-2" />
                      تقرير الأداء
                    </Button>
                  </div>
                </Card>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;