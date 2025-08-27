import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Star, Sparkles } from "lucide-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const SubscriptionPlans = () => {
  const { plans, userSubscription, currentPlan, createSubscription, loading } = useSubscriptions();
  const { user } = useAuth();
  const { toast } = useToast();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: string, planTier: string) => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول أولاً",
        description: "يرجى تسجيل الدخول للاشتراك في الباقة",
        variant: "destructive"
      });
      return;
    }

    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    // For free plan, subscribe immediately
    if (plan.price === 0) {
      try {
        setProcessingPlan(planId);
        await createSubscription(planId, 'free');
        toast({
          title: "تم الاشتراك بنجاح!",
          description: "تم تفعيل الباقة المجانية"
        });
      } catch (error: any) {
        toast({
          title: "خطأ في الاشتراك",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setProcessingPlan(null);
      }
    } else {
      // For paid plans, create subscription and redirect to payment
      try {
        setProcessingPlan(planId);
        await createSubscription(planId, 'pending');
        toast({
          title: "تم إنشاء طلب الاشتراك!",
          description: "يرجى إيداع مبلغ الاشتراك لتفعيل الباقة",
          variant: "default"
        });
      } catch (error: any) {
        toast({
          title: "خطأ في الاشتراك",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setProcessingPlan(null);
      }
    }
  };

  const getIconComponent = (tier: string) => {
    const icons = {
      'free': Star,
      'premium': Crown,
      'business': Zap,
      'super': Sparkles
    };
    return icons[tier as keyof typeof icons] || Star;
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-muted/20" id="pricing">
        <div className="container mx-auto px-4 text-center">
          <div className="text-xl">جاري تحميل الباقات...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20" id="pricing">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 arabic-heading bg-gradient-to-r from-primary via-premium to-super bg-clip-text text-transparent">
            خطط الاشتراك
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto arabic-body">
            اختر الخطة المناسبة لك وابدأ رحلتك في عالم الملفات الاحترافية
          </p>
          {currentPlan && (
            <div className="mt-4 p-4 bg-primary/10 rounded-xl border border-primary/20 inline-block">
              <p className="text-primary font-medium">
                📍 باقتك الحالية: {currentPlan.name}
              </p>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = getIconComponent(plan.tier);
            const isCurrentPlan = currentPlan?.id === plan.id;
            const features = Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features || '[]');
            const limitations = Array.isArray(plan.limitations) ? plan.limitations : JSON.parse(plan.limitations || '[]');
            
            return (
              <Card 
                key={plan.id}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  plan.tier === 'premium'
                    ? 'border-premium shadow-xl bg-gradient-to-b from-white to-premium/5' 
                    : plan.tier === 'super'
                    ? 'border-super shadow-xl bg-gradient-to-b from-white to-super/5'
                    : isCurrentPlan
                    ? 'border-success shadow-xl bg-gradient-to-b from-white to-success/5'
                    : 'border-gray-200 hover:border-primary/30'
                } ${plan.tier === 'super' ? 'animate-glow' : ''}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Popular Badge */}
                {plan.tier === 'premium' && (
                  <Badge className="absolute -top-4 right-4 bg-gradient-to-r from-premium to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    الأكثر شعبية
                  </Badge>
                )}

                {/* Super Badge */}
                {plan.tier === 'super' && (
                  <Badge className="absolute -top-4 right-4 bg-gradient-to-r from-super to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                    💥 خارق
                  </Badge>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <Badge className="absolute -top-4 right-4 bg-gradient-to-r from-success to-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    ✓ باقتك الحالية
                  </Badge>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${
                    plan.tier === 'premium' ? 'from-premium to-purple-600' :
                    plan.tier === 'business' ? 'from-business to-blue-600' :
                    plan.tier === 'super' ? 'from-super to-pink-600' :
                    'from-gray-400 to-gray-600'
                  } flex items-center justify-center ${plan.tier === 'super' ? 'animate-glow' : ''}`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2 arabic-heading">{plan.name}</h3>
                  <p className="text-muted-foreground arabic-body text-sm mb-4">{plan.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold arabic-heading">{plan.price}</span>
                    <span className="text-lg text-muted-foreground mr-1">{plan.currency}</span>
                    <div className="text-sm text-muted-foreground arabic-body">{plan.period}</div>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  {features.map((feature: string) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${
                        plan.tier === 'premium' ? 'from-premium to-purple-600' :
                        plan.tier === 'business' ? 'from-business to-blue-600' :
                        plan.tier === 'super' ? 'from-super to-pink-600' :
                        'from-gray-400 to-gray-600'
                      } flex items-center justify-center flex-shrink-0`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm arabic-body">{feature}</span>
                    </div>
                  ))}
                  
                  {limitations.map((limitation: string) => (
                    <div key={limitation} className="flex items-center gap-3 opacity-60">
                      <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                        <span className="w-3 h-3 text-gray-500">×</span>
                      </div>
                      <span className="text-sm arabic-body text-muted-foreground">{limitation}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                {isCurrentPlan ? (
                  <Button 
                    disabled
                    className="w-full py-6 rounded-xl font-bold text-lg bg-success/20 text-success border border-success/30"
                  >
                    ✓ الباقة النشطة
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleSubscribe(plan.id, plan.tier)}
                    disabled={processingPlan === plan.id}
                    className={`w-full py-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                      plan.tier === 'premium'
                        ? 'bg-gradient-to-r from-premium to-purple-600 hover:from-purple-600 hover:to-premium text-white shadow-lg hover:shadow-xl hover:scale-105' 
                        : plan.tier === 'super'
                        ? 'bg-gradient-to-r from-super to-pink-600 hover:from-pink-600 hover:to-super text-white shadow-lg hover:shadow-xl hover:scale-105 animate-pulse'
                        : plan.tier === 'business'
                        ? 'bg-gradient-to-r from-business to-blue-600 hover:from-blue-600 hover:to-business text-white shadow-lg hover:shadow-xl hover:scale-105'
                        : 'border-2 border-primary/20 hover:border-primary/40 bg-white hover:bg-primary/5'
                    }`}
                  >
                    {processingPlan === plan.id 
                      ? 'جاري المعالجة...' 
                      : user 
                        ? (plan.price === 0 ? 'ابدأ مجاناً' : 'اشترك الآن')
                        : 'سجل دخول للاشتراك'
                    }
                  </Button>
                )}
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12 p-6 bg-gradient-to-r from-primary/5 to-premium/5 rounded-2xl border border-primary/10">
          <p className="text-muted-foreground arabic-body">
            🎯 جميع الخطط تشمل ضمان استرداد المال خلال 30 يوماً | 🔒 دفع آمن 100% | 🚀 تفعيل فوري
          </p>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionPlans;