
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
  subscription_plan?: SubscriptionPlan;
}

export const useSubscriptions = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      console.log('جاري جلب باقات الاشتراك...');
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('خطأ في جلب الباقات:', error);
        throw error;
      }
      
      console.log('تم جلب الباقات بنجاح:', data?.length);
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    }
  };

  const fetchUserSubscription = async () => {
    if (!user) {
      console.log('المستخدم غير مسجل الدخول');
      return;
    }

    try {
      console.log('جاري جلب اشتراك المستخدم...');
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('خطأ في جلب الاشتراك:', error);
        throw error;
      }

      console.log('بيانات الاشتراك:', data);
      setUserSubscription(data);
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    }
  };

  const createSubscription = async (planId: string, paymentMethod: string, transactionId?: string) => {
    if (!user) {
      console.error('المستخدم غير مسجل الدخول');
      throw new Error('يرجى تسجيل الدخول أولاً');
    }

    console.log('إنشاء اشتراك جديد:', { planId, paymentMethod, userId: user.id });

    const plan = plans.find(p => p.id === planId);
    if (!plan) {
      console.error('الباقة غير موجودة:', planId);
      throw new Error('الباقة غير موجودة');
    }

    console.log('بيانات الباقة:', plan);

    try {
      // إنهاء أي اشتراك نشط حالي
      if (userSubscription) {
        console.log('إنهاء الاشتراك الحالي...');
        await supabase
          .from('user_subscriptions')
          .update({ status: 'inactive' })
          .eq('user_id', user.id)
          .eq('status', 'active');
      }

      // إنشاء الاشتراك الجديد
      const subscriptionData: any = {
        user_id: user.id,
        subscription_plan_id: planId,
        status: plan.price === 0 ? 'active' : 'pending',
        payment_method: paymentMethod,
        started_at: new Date().toISOString()
      };

      // إضافة تاريخ انتهاء للباقات المدفوعة
      if (plan.price > 0) {
        const expiresAt = new Date();
        if (plan.period === 'monthly') {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else if (plan.period === 'yearly') {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        }
        subscriptionData.expires_at = expiresAt.toISOString();
      }

      if (transactionId) {
        subscriptionData.transaction_id = transactionId;
      }

      console.log('بيانات الاشتراك الجديد:', subscriptionData);

      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (error) {
        console.error('خطأ في إنشاء الاشتراك:', error);
        throw error;
      }

      console.log('تم إنشاء الاشتراك بنجاح:', data);
      
      // تحديث البيانات المحلية
      await fetchUserSubscription();
      return data;
    } catch (error: any) {
      console.error('خطأ في createSubscription:', error);
      throw new Error(error.message || 'حدث خطأ أثناء إنشاء الاشتراك');
    }
  };

  const getCurrentPlan = () => {
    if (!userSubscription?.subscription_plan) {
      // إرجاع الباقة المجانية كافتراضية
      return plans.find(p => p.tier === 'free') || null;
    }
    
    // التأكد من أن subscription_plan هو كائن وليس string
    if (typeof userSubscription.subscription_plan === 'object') {
      return userSubscription.subscription_plan as SubscriptionPlan;
    }
    
    // إذا كان subscription_plan هو ID، البحث عن الباقة في القائمة
    const planId = userSubscription.subscription_plan as unknown as string;
    return plans.find(p => p.id === planId) || plans.find(p => p.tier === 'free') || null;
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
      console.log('تحميل بيانات الاشتراكات...');
      
      try {
        await fetchPlans();
        if (user) {
          await fetchUserSubscription();
        }
      } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
      } finally {
        setLoading(false);
        console.log('انتهى تحميل البيانات');
      }
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
