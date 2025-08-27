import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  ShoppingBag
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePayments } from "@/hooks/usePayments";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { transactions, getTransactionStatusText, getTransactionTypeText, getPaymentMethodName } = usePayments();
  const { plans } = useSubscriptions();
  
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);

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
      
      // Refresh transactions
      window.location.reload();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('حدث خطأ أثناء تحديث المعاملة');
    } finally {
      setLoading(false);
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

  // Stats calculations
  const totalTransactions = transactions.length;
  const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
  const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const approvedAmount = transactions
    .filter(t => t.status === 'approved' || t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold arabic-heading">لوحة إدارة النظام</h1>
          <p className="text-muted-foreground arabic-body mt-2">إدارة المعاملات والمستخدمين والإعدادات</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 rounded-2xl border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-premium rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground arabic-body">إجمالي المعاملات</p>
                <p className="text-2xl font-bold arabic-heading">{totalTransactions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground arabic-body">معاملات معلقة</p>
                <p className="text-2xl font-bold arabic-heading">{pendingTransactions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-success to-green-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground arabic-body">إجمالي المبلغ</p>
                <p className="text-2xl font-bold arabic-heading">{totalAmount.toFixed(2)} د.ل</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground arabic-body">المبلغ المعتمد</p>
                <p className="text-2xl font-bold arabic-heading">{approvedAmount.toFixed(2)} د.ل</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 rounded-2xl p-1 h-12">
            <TabsTrigger value="transactions" className="rounded-xl arabic-body">المعاملات</TabsTrigger>
            <TabsTrigger value="plans" className="rounded-xl arabic-body">الباقات</TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl arabic-body">المستخدمين</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl arabic-body">الإعدادات</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="p-6 rounded-2xl border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold arabic-heading">إدارة المعاملات</h3>
                <Badge className="bg-orange-100 text-orange-800">
                  {pendingTransactions} معاملة معلقة
                </Badge>
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
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium arabic-body">
                              {getTransactionTypeText(transaction.transaction_type)}
                            </div>
                            <div className="text-sm text-muted-foreground arabic-body">
                              {transaction.payment_method && getPaymentMethodName(transaction.payment_method)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="arabic-body">{transaction.user_id}</TableCell>
                        <TableCell className="font-bold arabic-heading">
                          {transaction.amount} د.ل
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>
                            {getTransactionStatusText(transaction.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="arabic-body">
                          {new Date(transaction.created_at).toLocaleDateString('ar')}
                        </TableCell>
                        <TableCell>
                          {transaction.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-success border-success hover:bg-success/10"
                                onClick={() => handleTransactionUpdate(transaction.id, 'approved')}
                                disabled={loading}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans">
            <Card className="p-6 rounded-2xl border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold arabic-heading">إدارة الباقات</h3>
                <Button className="bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary rounded-xl">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة باقة جديدة
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card key={plan.id} className="p-6 rounded-xl border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold arabic-heading">{plan.name}</h4>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="rounded-lg">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-muted-foreground arabic-body mb-4">{plan.description}</p>
                    <div className="text-2xl font-bold arabic-heading mb-4">
                      {plan.price} {plan.currency} / {plan.period}
                    </div>
                    <Badge className={`${plan.tier === 'free' ? 'bg-muted' : 'bg-primary'} text-white`}>
                      {plan.tier}
                    </Badge>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="p-6 rounded-2xl border-gray-200">
              <h3 className="text-xl font-bold mb-6 arabic-heading">إدارة المستخدمين</h3>
              <p className="text-muted-foreground arabic-body">قريباً...</p>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="p-6 rounded-2xl border-gray-200">
              <h3 className="text-xl font-bold mb-6 arabic-heading">إعدادات النظام</h3>
              <p className="text-muted-foreground arabic-body">قريباً...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;