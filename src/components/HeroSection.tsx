import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Users, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-premium/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-super/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-1.5s' }}></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Main Heading */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 arabic-heading text-white drop-shadow-2xl">
            منصة الملفات الاحترافية
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed arabic-body drop-shadow-lg">
            إنشئ ملفك الشخصي الاحترافي، شاركه عبر رابط مميز، واربح من الإحالات مع أفضل نظام اشتراكات متعدد المستويات
          </p>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
          <div className="flex flex-col items-center p-6 rounded-2xl bg-white/50 backdrop-blur-lg border border-white/20 hover:transform hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center mb-4 animate-glow">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 arabic-heading">قوالب احترافية</h3>
            <p className="text-muted-foreground text-center arabic-body">
              أكثر من 10 قوالب مصممة خصيصاً للسوق العربي
            </p>
          </div>

          <div className="flex flex-col items-center p-6 rounded-2xl bg-white/50 backdrop-blur-lg border border-white/20 hover:transform hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-business to-blue-600 rounded-full flex items-center justify-center mb-4 animate-glow" style={{ animationDelay: '0.5s' }}>
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 arabic-heading">نظام الإحالات</h3>
            <p className="text-muted-foreground text-center arabic-body">
              اربح حتى 25% + 10% من إحالات المحالين
            </p>
          </div>

          <div className="flex flex-col items-center p-6 rounded-2xl bg-white/50 backdrop-blur-lg border border-white/20 hover:transform hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-super to-pink-600 rounded-full flex items-center justify-center mb-4 animate-glow" style={{ animationDelay: '1s' }}>
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 arabic-heading">تحليلات متقدمة</h3>
            <p className="text-muted-foreground text-center arabic-body">
              تتبع الزيارات والتفاعل مع ذكاء صناعي
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-glow" asChild>
            <Link to="/login">
              ابدأ مجاناً الآن
              <ArrowLeft className="mr-2 h-5 w-5 rtl:rotate-180" />
            </Link>
          </Button>
          
          <Button variant="outline" size="lg" className="text-lg px-8 py-6 rounded-xl border-2 border-white/40 hover:border-white/60 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white hover:text-white transition-all duration-300 hover:scale-105">
            شاهد العروض التوضيحية
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-white drop-shadow-lg">+1000</div>
            <div className="text-sm text-white/80 arabic-body">ملف احترافي</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white drop-shadow-lg">250+</div>
            <div className="text-sm text-white/80 arabic-body">مستخدم نشط</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white drop-shadow-lg">15K</div>
            <div className="text-sm text-white/80 arabic-body">زيارة شهرياً</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white drop-shadow-lg">95%</div>
            <div className="text-sm text-white/80 arabic-body">رضا العملاء</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;