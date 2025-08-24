import { Button } from "@/components/ui/button";
import { Crown, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { name: "الرئيسية", href: "#home" },
    { name: "القوالب", href: "#templates" },
    { name: "الأسعار", href: "#pricing" },
    { name: "المميزات", href: "#features" }
  ];

  const supportLinks = [
    { name: "مركز المساعدة", href: "#help" },
    { name: "الدعم الفني", href: "#support" },
    { name: "الأسئلة الشائعة", href: "#faq" },
    { name: "تواصل معنا", href: "#contact" }
  ];

  const legalLinks = [
    { name: "شروط الاستخدام", href: "#terms" },
    { name: "سياسة الخصوصية", href: "#privacy" },
    { name: "سياسة الاسترداد", href: "#refund" },
    { name: "اتفاقية المستخدم", href: "#agreement" }
  ];

  return (
    <footer className="bg-gradient-to-b from-background to-muted/20 border-t border-gray-200/50">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-16 grid lg:grid-cols-5 md:grid-cols-2 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-premium rounded-xl flex items-center justify-center">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div className="text-2xl font-bold arabic-heading bg-gradient-to-r from-primary to-premium bg-clip-text text-transparent">
                برو فورج
              </div>
            </div>
            
            <p className="text-muted-foreground mb-6 arabic-body leading-relaxed max-w-md">
              المنصة الرائدة في إنشاء الملفات الشخصية الاحترافية القابلة للمشاركة مع نظام إحالات ذكي وقوالب متميزة للسوق العربي.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-primary" />
                <span className="arabic-body">info@proforge.ly</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 text-primary" />
                <span className="arabic-body">+218 91 234 5678</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="arabic-body">طرابلس، ليبيا</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex gap-4">
              {[
                { icon: Facebook, color: "from-blue-600 to-blue-700" },
                { icon: Twitter, color: "from-sky-500 to-sky-600" },
                { icon: Instagram, color: "from-pink-500 to-purple-600" },
                { icon: Youtube, color: "from-red-500 to-red-600" }
              ].map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <Button
                    key={index}
                    size="sm"
                    className={`w-10 h-10 rounded-full bg-gradient-to-r ${social.color} hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl`}
                  >
                    <IconComponent className="w-5 h-5 text-white" />
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 arabic-heading">روابط سريعة</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 arabic-body"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 arabic-heading">الدعم</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 arabic-body"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 arabic-heading">الشروط والأحكام</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 arabic-body"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-8 border-t border-gray-200/50">
          <div className="bg-gradient-to-r from-primary/5 to-premium/5 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4 arabic-heading">اشترك في النشرة الإخبارية</h3>
            <p className="text-muted-foreground mb-6 arabic-body max-w-2xl mx-auto">
              احصل على آخر التحديثات والنصائح والعروض الحصرية مباشرة في بريدك الإلكتروني
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 arabic-body"
              />
              <Button className="bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                اشتراك
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-gray-200/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-muted-foreground arabic-body text-sm">
            © 2024 برو فورج. جميع الحقوق محفوظة.
          </div>
          <div className="flex items-center gap-6 text-sm">
            <span className="text-muted-foreground arabic-body">مصنوع بـ ❤️ في ليبيا</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-success arabic-body">جميع الأنظمة تعمل</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;