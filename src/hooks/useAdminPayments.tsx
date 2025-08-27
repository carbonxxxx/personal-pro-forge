import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface WalletTransaction {
  id: string;
  user_id: string;
  transaction_type: 'deposit' | 'withdrawal' | 'referral_bonus' | 'commission';
  amount: number;
  currency: string;
  payment_method: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reference_number: string | null;
  receipt_image_url: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  processed_at?: string | null;
  processed_by?: string | null;
  profiles?: {
    display_name?: string;
  };
}

export const useAdminPayments = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllTransactions = async () => {
    if (!user) return;

    try {
      console.log('جاري جلب جميع المعاملات...');
      
      // جلب كل المعاملات
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (transactionsError) {
        console.error('خطأ في جلب المعاملات:', transactionsError);
        throw transactionsError;
      }

      // جلب بيانات المستخدمين
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name');

      if (profilesError) {
        console.error('خطأ في جلب بيانات المستخدمين:', profilesError);
        throw profilesError;
      }

      // ربط البيانات
      const enrichedTransactions = transactionsData?.map(transaction => {
        const profile = profilesData?.find(p => p.user_id === transaction.user_id);
        return {
          ...transaction,
          profiles: {
            display_name: profile?.display_name || 'مستخدم غير معروف'
          }
        };
      }) || [];

      console.log('تم جلب المعاملات بنجاح:', enrichedTransactions.length);
      setTransactions(enrichedTransactions);
    } catch (error) {
      console.error('Error fetching admin transactions:', error);
      setTransactions([]);
    }
  };

  const updateTransactionStatus = async (
    transactionId: string, 
    status: 'approved' | 'rejected',
    adminNotes?: string
  ) => {
    if (!user) throw new Error('User not authenticated');

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
    
    // إعادة تحميل المعاملات
    await fetchAllTransactions();
  };

  const getTransactionStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      'pending': 'قيد المراجعة',
      'approved': 'موافق عليه',
      'rejected': 'مرفوض',
      'completed': 'مكتمل'
    };
    return statusTexts[status] || status;
  };

  const getTransactionTypeText = (type: string) => {
    const typeTexts: Record<string, string> = {
      'deposit': 'إيداع',
      'withdrawal': 'سحب',
      'referral_bonus': 'مكافأة إحالة',
      'commission': 'عمولة'
    };
    return typeTexts[type] || type;
  };

  const getPaymentMethodName = (method: string) => {
    const names: Record<string, string> = {
      'libyana': 'ليبيانا',
      'madar': 'مدار',
      'bank': 'حساب مصرفي',
      'binance': 'Binance Pay',
      'cash': 'استلام نقدي'
    };
    return names[method] || method;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchAllTransactions();
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  return {
    transactions,
    loading,
    updateTransactionStatus,
    getTransactionStatusText,
    getTransactionTypeText,
    getPaymentMethodName,
    refetch: fetchAllTransactions
  };
};