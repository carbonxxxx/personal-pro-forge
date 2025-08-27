import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionPlan {
  id: string;
  name: string;
  name_en: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: any;
  limitations: any;
  max_profiles: number;
  max_templates: number;
  referral_percentage: number;
  secondary_referral_percentage: number;
  tier: string;
  is_active: boolean;
}

interface UserSubscription {
  id: string;
  user_id: string;
  subscription_plan_id: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  payment_method: string | null;
  subscription_plan?: any;
}

export const useSubscriptions = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    }
  };

  const fetchUserSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserSubscription(data);
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    }
  };

  const createSubscription = async (planId: string, paymentMethod: string, transactionId?: string) => {
    if (!user) throw new Error('User not authenticated');

    const plan = plans.find(p => p.id === planId);
    if (!plan) throw new Error('Plan not found');

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        subscription_plan_id: planId,
        status: plan.price === 0 ? 'active' : 'pending',
        expires_at: plan.price === 0 ? null : expiresAt.toISOString(),
        payment_method: paymentMethod,
        transaction_id: transactionId
      })
      .select()
      .single();

    if (error) throw error;
    
    await fetchUserSubscription();
    return data;
  };

  const getCurrentPlan = () => {
    if (!userSubscription?.subscription_plan) {
      return plans.find(p => p.tier === 'free') || null;
    }
    return userSubscription.subscription_plan as SubscriptionPlan;
  };

  const canAccessTemplate = (templateTier: string) => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return templateTier === 'free';

    const tierHierarchy = { free: 0, premium: 1, business: 2, super: 3 };
    const currentTierLevel = tierHierarchy[currentPlan.tier as keyof typeof tierHierarchy] || 0;
    const templateTierLevel = tierHierarchy[templateTier as keyof typeof tierHierarchy] || 0;

    return currentTierLevel >= templateTierLevel;
  };

  const getAvailableTemplateCount = () => {
    const currentPlan = getCurrentPlan();
    return currentPlan?.max_templates || 1;
  };

  const getMaxProfilesCount = () => {
    const currentPlan = getCurrentPlan();
    return currentPlan?.max_profiles || 1;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPlans(),
        fetchUserSubscription()
      ]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    plans,
    userSubscription,
    currentPlan: getCurrentPlan(),
    loading,
    createSubscription,
    canAccessTemplate,
    getAvailableTemplateCount,
    getMaxProfilesCount,
    refetch: () => Promise.all([fetchPlans(), fetchUserSubscription()])
  };
};