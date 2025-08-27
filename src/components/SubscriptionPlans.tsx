
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown } from "lucide-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const SubscriptionPlans = () => {
  const { plans, currentPlan, createSubscription, loading } = useSubscriptions();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    console.log('محاولة الاشتراك في:', plan.name, 'السعر:', plan.price);

    if (plan.price === 0) {
      // For free plans, activate immediately
      try {
        setProcessingPlan(planId);
        console.log('تفعيل الباقة المجانية...');
        await createSubscription(planId, 'free');
        toast({
          title: "تم تفعيل الباقة المجانية!",
          description: "يمكنك الآن الاستفادة من ميزات الباقة المجانية",
          variant: "default"
        });
      } catch (error: any) {
        console.error('خطأ في الاشتراك المجاني:', error);
        toast({
          title: "خطأ في الاشتراك",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setProcessingPlan(null);
      }
    } else {
      // For paid plans, create subscription record and notify user to deposit
      try {
        setProcessingPlan(planId);
        console.log('إنشاء اشتراك مدفوع...');
        
        await createSubscription(planId, 'pending');
        
        toast({
          title: "تم إنشاء طلب الاشتراك!",
          description: `يرجى إيداع مبلغ ${plan.price} ${plan.currency} لتفعيل باقة ${plan.name}. ستتم مراجعة طلبك من قبل الإدارة.`,
          variant: "default"
        });
        
        console.log('تم إنشاء طلب الاشتراك بنجاح');
      } catch (error: any) {
        console.error('خطأ في الاشتراك المدفوع:', error);
        toast({
          title: "خطأ في الاشتراك",
          description: error.message || 'حدث خطأ غير متوقع',
          variant: "destructive"
        });
      } finally {
        setProcessingPlan(null);
      }
    }
  };

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'free': return <Zap className="w-6 h-6" />;
      case 'premium': return <Star className="w-6 h-6" />;
      case 'business': return <Crown className="w-6 h-6" />;
      case 'super': return <Crown className="w-6 h-6" />;
      default: return <Zap className="w-6 h-6" />;
    }
  };

  const getPlanColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gradient-to-br from-gray-100 to-gray-200';
      case 'premium': return 'bg-gradient-to-br from-blue-100 to-blue-200';
      case 'business': return 'bg-gradient-to-br from-purple-100 to-purple-200';
      case 'super': return 'bg-gradient-to-br from-yellow-100 to-yellow-200';
      default: return 'bg-gradient-to-br from-gray-100 to-gray-200';
    }
  };

  const isCurrentPlan = (planId: string) => {
    return currentPlan?.id === planId;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold arabic-heading text-foreground mb-4">
            اختر الباقة المناسبة لك
          </h2>
          <p className="text-xl text-muted-foreground arabic-body max-w-3xl mx-auto">
            باقات متنوعة تلبي جميع احتياجاتك لإنشاء وإدارة ملفاتك الشخصية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                isCurrentPlan(plan.id) ? 'ring-2 ring-primary shadow-lg' : ''
              }`}
            >
              <div className={`h-2 ${getPlanColor(plan.tier)}`} />
              
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-3">
                  <div className={`p-3 rounded-full ${getPlanColor(plan.tier)} text-foreground`}>
                    {getPlanIcon(plan.tier)}
                  </div>
                </div>
                
                <CardTitle className="text-2xl font-bold arabic-heading text-foreground">
                  {plan.name}
                </CardTitle>
                
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-3xl font-bold arabic-heading text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-lg text-muted-foreground arabic-body">
                    {plan.currency}
                  </span>
                  <span className="text-sm text-muted-foreground arabic-body">
                    /{plan.period === 'monthly' ? 'شهر' : 'سنة'}
                  </span>
                </div>

                {isCurrentPlan(plan.id) && (
                  <Badge className="bg-primary text-white mt-2">
                    الباقة الحالية
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="pb-6">
                <CardDescription className="text-center mb-6 arabic-body text-muted-foreground">
                  {plan.description}
                </CardDescription>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    <span className="text-sm arabic-body text-foreground">
                      {plan.max_profiles} ملف شخصي
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    <span className="text-sm arabic-body text-foreground">
                      {plan.max_templates} قالب متاح
                    </span>
                  </div>

                  {plan.features && Array.isArray(plan.features) && plan.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-sm arabic-body text-foreground">
                        {feature}
                      </span>
                    </div>
                  ))}

                  {plan.referral_percentage > 0 && (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-sm arabic-body text-foreground">
                        عمولة إحالة {plan.referral_percentage}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Button 
                  className="w-full rounded-lg"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan(plan.id) || processingPlan === plan.id || loading}
                  variant={isCurrentPlan(plan.id) ? "outline" : "default"}
                >
                  {processingPlan === plan.id ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري المعالجة...
                    </div>
                  ) : isCurrentPlan(plan.id) ? (
                    "الباقة الحالية"
                  ) : plan.price === 0 ? (
                    "تفعيل مجاني"
                  ) : (
                    `اشترك الآن - ${plan.price} ${plan.currency}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground arabic-body">
            جميع الباقات تشمل دعم فني على مدار الساعة • ضمان استرداد المال خلال 30 يوم
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
