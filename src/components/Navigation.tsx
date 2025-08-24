import { Button } from "@/components/ui/button";
import { Menu, X, User, Crown, Zap } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "الرئيسية", href: "#home" },
    { name: "القوالب", href: "#templates" },
    { name: "الأسعار", href: "#pricing" },
    { name: "المميزات", href: "#features" },
    { name: "الدعم", href: "#support" }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-premium rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="text-xl font-bold arabic-heading bg-gradient-to-r from-primary to-premium bg-clip-text text-transparent">
              برو فورج
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-colors duration-300 arabic-body font-medium"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="outline" className="rounded-full border-primary/20 hover:border-primary/40">
              <User className="w-4 h-4 ml-2" />
              تسجيل الدخول
            </Button>
            <Button className="bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Zap className="w-4 h-4 ml-2" />
              ابدأ مجاناً
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block text-muted-foreground hover:text-primary transition-colors duration-300 arabic-body font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <Button variant="outline" className="w-full rounded-full border-primary/20 hover:border-primary/40">
                  <User className="w-4 h-4 ml-2" />
                  تسجيل الدخول
                </Button>
                <Button className="w-full bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary rounded-full shadow-lg">
                  <Zap className="w-4 h-4 ml-2" />
                  ابدأ مجاناً
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;