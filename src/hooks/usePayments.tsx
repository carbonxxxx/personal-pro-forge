import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PaymentSettings {
  id: string;
  payment_method: string;
  min_amount: number;
  max_amount: number | null;
  account_number: string | null;
  account_name: string | null;
  instructions: string | null;
  is_active: boolean;
}

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
}

export const usePayments = () => {
  const { user } = useAuth();
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPaymentSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('is_active', true)
        .order('min_amount', { ascending: true });

      if (error) throw error;
      setPaymentSettings(data || []);
    } catch (error) {
      console.error('Error fetching payment settings:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const createDepositRequest = async (
    amount: number,
    paymentMethod: string,
    referenceNumber?: string,
    receiptImageUrl?: string
  ) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'deposit' as const,
        amount: amount,
        currency: 'LYD',
        payment_method: paymentMethod as any,
        status: 'pending' as const,
        reference_number: referenceNumber,
        receipt_image_url: receiptImageUrl
      })
      .select()
      .single();

    if (error) throw error;
    
    await fetchTransactions();
    return data;
  };

  const createWithdrawalRequest = async (
    amount: number,
    paymentMethod: string,
    accountDetails?: string
  ) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'withdrawal' as const,
        amount: amount,
        currency: 'LYD',
        payment_method: paymentMethod as any,
        status: 'pending' as const,
        reference_number: accountDetails
      })
      .select()
      .single();

    if (error) throw error;
    
    await fetchTransactions();
    return data;
  };

  const getPaymentMethodSettings = (method: string) => {
    return paymentSettings.find(setting => setting.payment_method === method);
  };

  const getAvailablePaymentMethods = () => {
    return paymentSettings.filter(setting => setting.is_active);
  };

  const getMinWithdrawalAmount = (method: string) => {
    const settings = getPaymentMethodSettings(method);
    return settings?.min_amount || 50;
  };

  const getMaxWithdrawalAmount = (method: string) => {
    const settings = getPaymentMethodSettings(method);
    return settings?.max_amount;
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPaymentSettings(),
        fetchTransactions()
      ]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    paymentSettings,
    transactions,
    loading,
    createDepositRequest,
    createWithdrawalRequest,
    getPaymentMethodSettings,
    getAvailablePaymentMethods,
    getMinWithdrawalAmount,
    getMaxWithdrawalAmount,
    getPaymentMethodName,
    getTransactionStatusText,
    getTransactionTypeText,
    refetch: () => Promise.all([fetchPaymentSettings(), fetchTransactions()])
  };
};