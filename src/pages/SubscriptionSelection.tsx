import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Star, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { usePayments } from "@/hooks/usePayments";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";

const SubscriptionSelection = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'other'>('wallet');
  
  const { user } = useAuth();
  const { plans, createSubscription } = useSubscriptions();
  const { getAvailablePaymentMethods } = usePayments();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const freePlans = plans.filter(plan => plan.tier === 'free');
  const premiumPlans = plans.filter(plan => plan.tier === 'premium');
  const businessPlans = plans.filter(plan => plan.tier === 'business');
  const superPlans = plans.filter(plan => plan.tier === 'super');

  const handlePlanSelect = async (planId: string, planPrice: number) => {
    if (!user) return;

    setLoading(true);
    try {
      if (planPrice === 0) {
        // اشتراك مجاني
        await createSubscription(planId, 'free');
        toast({
          title: "تم تفعيل الاشتراك!",
          description: "تم تفعيل الخطة المجانية بنجاح",
        });
        navigate('/dashboard');
      } else {
        setSelectedPlan(planId);
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في تفعيل الاشتراك",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirm = async () => {
    if (!selectedPlan || !user) return;

    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    setLoading(true);
    try {
      if (paymentMethod === 'wallet') {
        // التحقق من الرصيد
        if ((profile?.wallet_balance || 0) < plan.price) {
          toast({
            title: "رصيد غير كافي",
            description: `تحتاج إلى ${plan.price} د.ل والرصيد الحالي ${profile?.wallet_balance || 0} د.ل`,
            variant: "destructive",
          });
          return;
        }
        
        await createSubscription(selectedPlan, 'wallet');
        toast({
          title: "تم الاشتراك!",
          description: "تم خصم المبلغ من محفظتك وتفعيل الاشتراك",
        });
        navigate('/dashboard');
      } else {
        // توجيه لطرق الدفع الأخرى
        navigate('/dashboard?payment=true&plan=' + selectedPlan);
      }
    } catch (error) {
      toast({
        title: "خطأ في الدفع",
        description: "حدث خطأ أثناء معالجة الدفع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'free': return <Crown className="w-6 h-6" />;
      case 'premium': return <Star className="w-6 h-6" />;
      case 'business': return <Zap className="w-6 h-6" />;
      case 'super': return <Sparkles className="w-6 h-6" />;
      default: return <Crown className="w-6 h-6" />;
    }
  };

  const getPlanGradient = (tier: string) => {
    switch (tier) {
      case 'free': return 'from-gray-400 to-gray-600';
      case 'premium': return 'from-primary to-premium';
      case 'business': return 'from-business to-blue-600';
      case 'super': return 'from-purple-500 to-pink-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getDiscountBadge = (period: string) => {
    if (period === '6_months' || period === 'yearly') {
      return (
        <Badge className="absolute -top-2 -right-2 bg-success text-white">
          خصم 15%
        </Badge>
      );
    }
    return null;
  };

  const renderPlanGroup = (planGroup: any[], title: string, tier: string) => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold arabic-heading text-center">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {planGroup.map((plan) => (
          <Card
            key={plan.id}
            className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              selectedPlan === plan.id 
                ? `ring-2 ring-${tier === 'free' ? 'gray' : tier === 'premium' ? 'primary' : 'business'}-500 shadow-xl` 
                : 'border-gray-200 hover:border-primary/50'
            }`}
            onClick={() => plan.price > 0 ? setSelectedPlan(plan.id) : handlePlanSelect(plan.id, plan.price)}
          >
            {getDiscountBadge(plan.period)}
            
            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${getPlanGradient(tier)} rounded-2xl flex items-center justify-center text-white`}>
                {getPlanIcon(tier)}
              </div>
              <h4 className="text-lg font-bold arabic-heading mb-2">{plan.name}</h4>
              <div className="text-3xl font-bold arabic-heading mb-1">
                {plan.price === 0 ? 'مجاني' : `${plan.price} د.ل`}
              </div>
              <div className="text-sm text-muted-foreground arabic-body">
                {plan.period === 'monthly' ? 'شهرياً' :
                 plan.period === '3_months' ? '3 أشهر' :
                 plan.period === '6_months' ? '6 أشهر' :
                 plan.period === 'yearly' ? 'سنوياً' : plan.period}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {plan.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${getPlanGradient(tier)} flex items-center justify-center`}>
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm arabic-body">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              className={`w-full rounded-xl ${
                plan.price === 0 
                  ? 'bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700'
                  : `bg-gradient-to-r ${getPlanGradient(tier)} hover:shadow-lg`
              } text-white font-bold transition-all duration-300`}
              disabled={loading}
              onClick={(e) => {
                e.stopPropagation();
                handlePlanSelect(plan.id, plan.price);
              }}
            >
              {plan.price === 0 ? 'اختيار' : 'اختيار الخطة'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );

  if (selectedPlan) {
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-premium/5 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold arabic-heading mb-2">تأكيد الاشتراك</h2>
            <p className="text-muted-foreground arabic-body">اختر طريقة الدفع لخطة {plan.name}</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold arabic-heading">{plan.price} د.ل</div>
                <div className="text-sm text-muted-foreground arabic-body">{plan.name}</div>
              </div>
            </div>

            {(profile?.wallet_balance || 0) >= plan.price && (
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'wallet')}
                    className="text-primary focus:ring-primary/20"
                  />
                  <div className="flex-1">
                    <div className="font-medium arabic-body">الدفع من المحفظة</div>
                    <div className="text-sm text-muted-foreground arabic-body">
                      الرصيد الحالي: {profile?.wallet_balance?.toFixed(2)} د.ل
                    </div>
                  </div>
                </label>
              </div>
            )}

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="other"
                  checked={paymentMethod === 'other'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'other')}
                  className="text-primary focus:ring-primary/20"
                />
                <div className="flex-1">
                  <div className="font-medium arabic-body">طرق دفع أخرى</div>
                  <div className="text-sm text-muted-foreground arabic-body">
                    ليبيانا، مدار، حساب مصرفي، Binance
                  </div>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setSelectedPlan(null)}
                disabled={loading}
              >
                إلغاء
              </Button>
                   <Button
                     className="flex-1 bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary rounded-xl text-white"
                     onClick={handlePaymentConfirm}
                     disabled={loading || (paymentMethod === 'wallet' && (profile?.wallet_balance || 0) < plan.price)}
                   >
                     {loading ? "جاري المعالجة..." : "تأكيد الدفع"}
                   </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-premium/5 p-4">
      <div className="container mx-auto py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-premium rounded-xl flex items-center justify-center">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold arabic-heading bg-gradient-to-r from-primary to-premium bg-clip-text text-transparent">
              اختر خطة الاشتراك
            </h1>
          </div>
          <p className="text-lg text-muted-foreground arabic-body max-w-2xl mx-auto">
            اختر الخطة التي تناسب احتياجاتك وابدأ في إنشاء ملفات شخصية احترافية
          </p>
        </div>

        <div className="space-y-12">
          {freePlans.length > 0 && renderPlanGroup(freePlans, "الخطة المجانية", "free")}
          {premiumPlans.length > 0 && renderPlanGroup(premiumPlans, "الخطط المميزة", "premium")}
          {businessPlans.length > 0 && renderPlanGroup(businessPlans, "خطط الأعمال", "business")}
          {superPlans.length > 0 && renderPlanGroup(superPlans, "الخطط الخارقة", "super")}
        </div>

        <div className="text-center mt-8">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-primary"
            onClick={async () => {
              // تفعيل الخطة المجانية تلقائياً عند التخطي
              const freePlan = plans.find(p => p.tier === 'free' && p.period === 'monthly');
              if (freePlan) {
                try {
                  await createSubscription(freePlan.id, 'free');
                  navigate('/dashboard');
                } catch (error) {
                  console.error('Error activating free plan:', error);
                  navigate('/dashboard');
                }
              } else {
                navigate('/dashboard');
              }
            }}
          >
            تخطي والمتابعة بالخطة المجانية
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSelection;