import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Settings, CreditCard, Calendar, CheckCircle } from "lucide-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";

const SubscriptionManagement = () => {
  const [loading, setLoading] = useState(false);
  const { plans, userSubscription, currentPlan, createSubscription } = useSubscriptions();
  const { profile } = useProfile();

  const handleUpgrade = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    setLoading(true);
    try {
      // التحقق من الرصيد
      if ((profile?.wallet_balance || 0) >= plan.price) {
        await createSubscription(planId, 'wallet');
        toast({
          title: "تم ترقية الاشتراك!",
          description: `تم الاشتراك في خطة ${plan.name} بنجاح`,
        });
      } else {
        toast({
          title: "رصيد غير كافي",
          description: `تحتاج إلى ${plan.price} د.ل والرصيد الحالي ${profile?.wallet_balance || 0} د.ل`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الترقية",
        description: "حدث خطأ أثناء ترقية الاشتراك",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'from-gray-400 to-gray-600';
      case 'premium': return 'from-primary to-premium';
      case 'business': return 'from-business to-blue-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const formatExpiryDate = (dateString: string | null) => {
    if (!dateString) return 'غير محدود';
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  const getDiscountBadge = (period: string, originalPrice: number, currentPrice: number) => {
    const monthlyEquivalent = period === '6_months' ? originalPrice / 6 : 
                             period === 'yearly' ? originalPrice / 12 : 
                             originalPrice;
    
    if (period === '6_months' || period === 'yearly') {
      return (
        <div className="text-center mb-2">
          <Badge className="bg-success text-white">خصم 15%</Badge>
          <div className="text-xs text-muted-foreground mt-1">
            بدلاً من {(monthlyEquivalent * (period === '6_months' ? 6 : 12)).toFixed(0)} د.ل
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      {currentPlan && (
        <Card className="p-6 rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 to-premium/5">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${getPlanColor(currentPlan.tier)} rounded-xl flex items-center justify-center text-white`}>
              <Crown className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold arabic-heading">{currentPlan.name}</h3>
                <Badge className="bg-success text-white">نشط</Badge>
              </div>
              <p className="text-muted-foreground arabic-body">{currentPlan.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold arabic-heading">
                {currentPlan.price === 0 ? 'مجاني' : `${currentPlan.price} د.ل`}
              </div>
              {userSubscription?.expires_at && (
                <div className="text-sm text-muted-foreground arabic-body">
                  ينتهي في: {formatExpiryDate(userSubscription.expires_at)}
                </div>
              )}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium arabic-heading">المزايا المتاحة:</h4>
              {currentPlan.features?.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm arabic-body">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium arabic-heading">الحدود:</h4>
              <div className="text-sm arabic-body space-y-1">
                <div>• عدد الملفات: {currentPlan.max_profiles}</div>
                <div>• عدد القوالب المتاحة: {currentPlan.max_templates}</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Available Upgrades */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold arabic-heading">الخطط المتاحة للترقية</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans
            .filter(plan => 
              !currentPlan || 
              plan.tier !== currentPlan.tier || 
              plan.id !== currentPlan.id
            )
            .map((plan) => {
              const isCurrentTier = currentPlan?.tier === plan.tier;
              const canUpgrade = !isCurrentTier || 
                               (isCurrentTier && plan.period !== currentPlan?.period);
              
              return (
                <Card
                  key={plan.id}
                  className={`p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    !canUpgrade ? 'opacity-60' : 'cursor-pointer border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${getPlanColor(plan.tier)} rounded-2xl flex items-center justify-center text-white`}>
                      <Crown className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold arabic-heading mb-2">{plan.name}</h4>
                    
                    {getDiscountBadge(plan.period, plan.tier === 'premium' ? 29 : 49, plan.price)}
                    
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
                    {plan.features?.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${getPlanColor(plan.tier)} flex items-center justify-center`}>
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm arabic-body">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full rounded-xl ${
                      canUpgrade
                        ? `bg-gradient-to-r ${getPlanColor(plan.tier)} hover:shadow-lg text-white`
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    } font-bold transition-all duration-300`}
                    disabled={loading || !canUpgrade}
                    onClick={() => canUpgrade && handleUpgrade(plan.id)}
                  >
                    {loading ? 'جاري المعالجة...' : 
                     !canUpgrade ? 'خطة حالية' : 
                     plan.price === 0 ? 'تفعيل' : 'ترقية'}
                  </Button>
                </Card>
              );
            })}
        </div>
      </div>

      {/* Payment Methods */}
      <Card className="p-6 rounded-2xl border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-bold arabic-heading">طرق الدفع</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium arabic-body">الرصيد الحالي في المحفظة:</h4>
            <div className="text-2xl font-bold text-success arabic-heading">
              {profile?.wallet_balance?.toFixed(2) || '0.00'} د.ل
            </div>
            <p className="text-sm text-muted-foreground arabic-body">
              يمكنك استخدام رصيد محفظتك لترقية اشتراكك
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium arabic-body">طرق الدفع المتاحة:</h4>
            <div className="text-sm arabic-body space-y-1">
              <div>• ليبيانا موبايل مني</div>
              <div>• مدار</div>
              <div>• حساب مصرفي</div>
              <div>• Binance Pay</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SubscriptionManagement;