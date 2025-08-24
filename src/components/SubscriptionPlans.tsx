import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Star, Sparkles } from "lucide-react";

const SubscriptionPlans = () => {
  const plans = [
    {
      name: "مجاني",
      price: "0",
      currency: "د.ل",
      period: "مجاناً",
      description: "للمبتدئين وتجربة المنصة",
      features: [
        "1 ملف شخصي",
        "لوحة تحكم بسيطة", 
        "رابط مميز",
        "1 قالب أساسي",
        "دعم عبر البريد الإلكتروني"
      ],
      limitations: [
        "لا يوجد نظام ربح",
        "إعلانات المنصة",
        "تخصيص محدود"
      ],
      buttonText: "ابدأ مجاناً",
      popular: false,
      gradient: "from-gray-400 to-gray-600",
      icon: Star,
      tier: "free"
    },
    {
      name: "مميز",
      price: "55",
      currency: "د.ل",
      period: "شهرياً",
      description: "للمحترفين والفرق الصغيرة",
      features: [
        "3 ملفات شخصية",
        "نسبة ربح 20%",
        "لوحة تحكم متقدمة",
        "تتبع الإحالات",
        "تخصيص القالب",
        "5 قوالب احترافية",
        "إحصائيات مبسطة",
        "دعم فني متقدم"
      ],
      limitations: [],
      buttonText: "اشترك الآن",
      popular: true,
      gradient: "from-premium to-purple-600",
      icon: Crown,
      tier: "premium"
    },
    {
      name: "أعمال",
      price: "120",
      currency: "د.ل", 
      period: "شهرياً",
      description: "للشركات والفرق الكبيرة",
      features: [
        "15 ملف شخصي",
        "نسبة ربح 20% + 10% من الإحالات",
        "تحليلات متقدمة",
        "إدارة الفرق",
        "دعم فني مباشر",
        "10 قوالب متميزة",
        "تقارير تفصيلية",
        "تكامل مع الأدوات الخارجية",
        "نطاق فرعي مخصص"
      ],
      limitations: [],
      buttonText: "اشترك في الأعمال",
      popular: false,
      gradient: "from-business to-blue-600",
      icon: Zap,
      tier: "business"
    },
    {
      name: "خارق 💥",
      price: "250", 
      currency: "د.ل",
      period: "شهرياً",
      description: "لرواد الأعمال والشركات الكبرى",
      features: [
        "ملفات غير محدودة",
        "نسبة ربح 25% + 10% من إحالات المحالين",
        "ذكاء صناعي لتحسين الملف",
        "أدوات تسويق متقدمة",
        "تكامل API كامل",
        "جميع القوالب + حصرية",
        "مصمم تفاعلي بالسحب والإفلات",
        "محرر CSS/JS مخصص",
        "إدارة فرق متقدمة",
        "تحليلات AI متقدمة",
        "دعم فني مخصص 24/7",
        "تدريب شخصي"
      ],
      limitations: [],
      buttonText: "اشترك في الخارق",
      popular: false,
      gradient: "from-super to-pink-600",
      icon: Sparkles,
      tier: "super"
    }
  ];

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
        </div>

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <Card 
                key={plan.tier}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  plan.popular 
                    ? 'border-premium shadow-xl bg-gradient-to-b from-white to-premium/5' 
                    : plan.tier === 'super'
                    ? 'border-super shadow-xl bg-gradient-to-b from-white to-super/5'
                    : 'border-gray-200 hover:border-primary/30'
                } ${plan.tier === 'super' ? 'animate-glow' : ''}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Popular Badge */}
                {plan.popular && (
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

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center ${plan.tier === 'super' ? 'animate-glow' : ''}`}>
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
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center flex-shrink-0`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm arabic-body">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.map((limitation) => (
                    <div key={limitation} className="flex items-center gap-3 opacity-60">
                      <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                        <span className="w-3 h-3 text-gray-500">×</span>
                      </div>
                      <span className="text-sm arabic-body text-muted-foreground">{limitation}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button 
                  className={`w-full py-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-premium to-purple-600 hover:from-purple-600 hover:to-premium text-white shadow-lg hover:shadow-xl hover:scale-105' 
                      : plan.tier === 'super'
                      ? 'bg-gradient-to-r from-super to-pink-600 hover:from-pink-600 hover:to-super text-white shadow-lg hover:shadow-xl hover:scale-105 animate-pulse'
                      : plan.tier === 'business'
                      ? 'bg-gradient-to-r from-business to-blue-600 hover:from-blue-600 hover:to-business text-white shadow-lg hover:shadow-xl hover:scale-105'
                      : 'border-2 border-primary/20 hover:border-primary/40 bg-white hover:bg-primary/5'
                  }`}
                >
                  {plan.buttonText}
                </Button>
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