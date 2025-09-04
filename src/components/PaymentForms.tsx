import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, DollarSign, CreditCard, Building, Smartphone, Download } from "lucide-react";
import { usePayments } from "@/hooks/usePayments";
import { toast } from "@/hooks/use-toast";

interface PaymentFormProps {
  type: 'deposit' | 'withdrawal';
  onSuccess?: () => void;
}

export const PaymentForm = ({ type, onSuccess }: PaymentFormProps) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [accountDetails, setAccountDetails] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { 
    getAvailablePaymentMethods, 
    getPaymentMethodName,
    createDepositRequest,
    createWithdrawalRequest,
    getMinWithdrawalAmount,
    getMaxWithdrawalAmount
  } = usePayments();

  const availableMethods = getAvailablePaymentMethods();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !paymentMethod) {
      toast({
        title: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    const numericAmount = parseFloat(amount);
    if (numericAmount <= 0) {
      toast({
        title: "يرجى إدخال مبلغ صحيح",
        variant: "destructive"
      });
      return;
    }

    if (type === 'withdrawal') {
      const minAmount = getMinWithdrawalAmount(paymentMethod);
      const maxAmount = getMaxWithdrawalAmount(paymentMethod);
      
      if (numericAmount < minAmount) {
        toast({
          title: `الحد الأدنى للسحب هو ${minAmount} د.ل`,
          variant: "destructive"
        });
        return;
      }
      
      if (maxAmount && numericAmount > maxAmount) {
        toast({
          title: `الحد الأقصى للسحب هو ${maxAmount} د.ل`,
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);
    try {
      if (type === 'deposit') {
        await createDepositRequest(numericAmount, paymentMethod, referenceNumber);
        toast({
          title: "تم إرسال طلب الإيداع بنجاح!",
          description: "سيتم مراجعته خلال 24 ساعة."
        });
      } else {
        await createWithdrawalRequest(numericAmount, paymentMethod, accountDetails);
        toast({
          title: "تم إرسال طلب السحب بنجاح!",
          description: "سيتم معالجته خلال 48 ساعة."
        });
      }
      
      // Reset form
      setAmount('');
      setPaymentMethod('');
      setReferenceNumber('');
      setAccountDetails('');
      onSuccess?.();
    } catch (error) {
      toast({
        title: "حدث خطأ، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'libyana':
      case 'madar':
        return <Smartphone className="w-4 h-4" />;
      case 'bank':
        return <Building className="w-4 h-4" />;
      case 'binance':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <Card className="p-6 rounded-2xl border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-primary to-premium rounded-xl flex items-center justify-center">
          {type === 'deposit' ? <Upload className="w-5 h-5 text-white" /> : <Download className="w-5 h-5 text-white" />}
        </div>
        <div>
          <h3 className="text-xl font-bold arabic-heading">
            {type === 'deposit' ? 'إيداع الأموال' : 'سحب الأموال'}
          </h3>
          <p className="text-sm text-muted-foreground arabic-body">
            {type === 'deposit' ? 'أضف أموال إلى محفظتك' : 'اسحب أرباحك إلى حسابك'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label className="arabic-body font-medium">المبلغ (د.ل)</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="rounded-xl border-gray-200 focus:border-primary/40 focus:ring-primary/20 h-12 mt-2"
            min="1"
            step="0.01"
            required
          />
        </div>

        <div>
          <Label className="arabic-body font-medium">طريقة الدفع</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
            <SelectTrigger className="rounded-xl border-gray-200 focus:border-primary/40 h-12 mt-2">
              <SelectValue placeholder="اختر طريقة الدفع" />
            </SelectTrigger>
            <SelectContent>
              {availableMethods.map((method) => (
                <SelectItem key={method.id} value={method.payment_method}>
                  <div className="flex items-center gap-2">
                    {getMethodIcon(method.payment_method)}
                    <span className="arabic-body">{getPaymentMethodName(method.payment_method)}</span>
                    <Badge variant="outline" className="text-xs">
                      {method.min_amount} - {method.max_amount || '∞'} د.ل
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {type === 'deposit' && (
          <div>
            <Label className="arabic-body font-medium">رقم المرجع / رقم العملية</Label>
            <Input
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="أدخل رقم العملية من التطبيق"
              className="rounded-xl border-gray-200 focus:border-primary/40 focus:ring-primary/20 h-12 mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1 arabic-body">
              اختياري: يساعد في تسريع عملية المراجعة
            </p>
          </div>
        )}

        {type === 'withdrawal' && (
          <div>
            <Label className="arabic-body font-medium">تفاصيل الحساب</Label>
            <Textarea
              value={accountDetails}
              onChange={(e) => setAccountDetails(e.target.value)}
              placeholder="أدخل رقم الهاتف، رقم الحساب، أو تفاصيل الحساب حسب طريقة الدفع المختارة"
              className="rounded-xl border-gray-200 focus:border-primary/40 focus:ring-primary/20 mt-2"
              rows={3}
              required
            />
          </div>
        )}

        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-sm text-muted-foreground arabic-body">
            {type === 'deposit' ? (
              <>
                • سيتم مراجعة طلب الإيداع خلال 24 ساعة<br/>
                • تأكد من صحة المعلومات المدخلة<br/>
                • احتفظ بإيصال العملية للمراجعة
              </>
            ) : (
              <>
                • سيتم معالجة طلب السحب خلال 48 ساعة<br/>
                • تأكد من صحة تفاصيل الحساب<br/>
                • الحد الأدنى للسحب: {paymentMethod ? getMinWithdrawalAmount(paymentMethod) : 50} د.ل
              </>
            )}
          </p>
        </div>

        <Button 
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary rounded-xl h-12 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {loading ? "جاري المعالجة..." : type === 'deposit' ? "إرسال طلب الإيداع" : "إرسال طلب السحب"}
        </Button>
      </form>
    </Card>
  );
};

export const TransactionsList = () => {
  const { transactions, getTransactionStatusText, getTransactionTypeText, getPaymentMethodName } = usePayments();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-white';
      case 'approved':
        return 'bg-blue-500 text-white';
      case 'pending':
        return 'bg-orange-500 text-white';
      case 'rejected':
        return 'bg-destructive text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Upload className="w-4 h-4 text-success" />;
      case 'withdrawal':
        return <Download className="w-4 h-4 text-orange-500" />;
      case 'referral_bonus':
        return <DollarSign className="w-4 h-4 text-blue-500" />;
      case 'commission':
        return <CreditCard className="w-4 h-4 text-purple-500" />;
      case 'subscription':
        return <CreditCard className="w-4 h-4 text-indigo-500" />;
      default:
        return <DollarSign className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="p-6 rounded-2xl border-gray-200">
      <h3 className="text-xl font-bold mb-6 arabic-heading">سجل المعاملات</h3>
      
      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground arabic-body">لا توجد معاملات بعد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors duration-300">
              <div className="flex-shrink-0">
                {getTypeIcon(transaction.transaction_type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium arabic-body">
                    {getTransactionTypeText(transaction.transaction_type)}
                  </span>
                  <Badge className={getStatusColor(transaction.status)}>
                    {getTransactionStatusText(transaction.status)}
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground arabic-body">
                  {transaction.payment_method && (
                    <span>طريقة الدفع: {getPaymentMethodName(transaction.payment_method)} • </span>
                  )}
                  {new Date(transaction.created_at).toLocaleDateString('ar')}
                </div>
                
                {transaction.reference_number && (
                  <div className="text-xs text-muted-foreground arabic-body mt-1">
                    رقم المرجع: {transaction.reference_number}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className={`font-bold arabic-heading ${
                  transaction.transaction_type === 'deposit' || transaction.transaction_type === 'referral_bonus' || transaction.transaction_type === 'commission'
                    ? 'text-success' 
                    : 'text-orange-500'
                }`}>
                  {transaction.transaction_type === 'withdrawal' || transaction.transaction_type === 'subscription' ? '-' : '+'}
                  {transaction.amount} د.ل
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};