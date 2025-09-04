import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Profile {
  id: string;
  user_id: string;
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
  wallet_balance: number;
  total_earnings: number;
  referral_code: string;
  referred_by?: string;
  referral_count: number;
  created_at: string;
  updated_at: string;
}

interface WalletTransaction {
  id: string;
  transaction_type: 'deposit' | 'withdrawal' | 'referral_bonus' | 'commission' | 'subscription';
  amount: number;
  currency: string;
  payment_method?: 'libyana' | 'madar' | 'bank' | 'binance' | 'cash';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reference_number?: string;
  receipt_image_url?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

interface ReferralEarning {
  id: string;
  referrer_id: string;
  referred_id: string;
  level: number;
  percentage: number;
  amount: number;
  created_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [referralEarnings, setReferralEarnings] = useState<ReferralEarning[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      setProfile(profileData);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
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

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('Error in fetchTransactions:', error);
    }
  };

  const fetchReferralEarnings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('referral_earnings')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching referral earnings:', error);
        return;
      }

      setReferralEarnings(data || []);
    } catch (error) {
      console.error('Error in fetchReferralEarnings:', error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchProfile(),
      fetchTransactions(),
      fetchReferralEarnings()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  // Calculate stats from real data
  const stats = {
    totalProfiles: 1, // For now, each user has one profile
    totalViews: 0, // TODO: Implement view tracking
    totalEarnings: profile?.total_earnings || 0,
    totalReferrals: profile?.referral_count || 0,
    thisMonth: {
      views: 0,
      earnings: referralEarnings
        .filter(earning => {
          const earningDate = new Date(earning.created_at);
          const now = new Date();
          return earningDate.getMonth() === now.getMonth() && 
                 earningDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, earning) => sum + earning.amount, 0),
      referrals: referralEarnings
        .filter(earning => {
          const earningDate = new Date(earning.created_at);
          const now = new Date();
          return earningDate.getMonth() === now.getMonth() && 
                 earningDate.getFullYear() === now.getFullYear();
        }).length
    }
  };

  return {
    profile,
    transactions,
    referralEarnings,
    stats,
    loading,
    refetch: fetchAllData
  };
};