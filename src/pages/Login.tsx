import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login/register logic here
    console.log("Form submitted:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-premium/5 p-4">
      {/* Back to Home */}
      <Link 
        to="/" 
        className="absolute top-6 right-6 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-300"
      >
        <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
        <span className="arabic-body">العودة للرئيسية</span>
      </Link>

      <Card className="w-full max-w-md p-8 rounded-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-premium rounded-xl flex items-center justify-center">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <div className="text-2xl font-bold arabic-heading bg-gradient-to-r from-primary to-premium bg-clip-text text-transparent">
            برو فورج
          </div>
        </div>

        {/* Toggle Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-8 p-1 bg-muted rounded-xl">
          <Button
            variant={isLogin ? "default" : "ghost"}
            className={`rounded-lg transition-all duration-300 ${
              isLogin 
                ? "bg-gradient-to-r from-primary to-premium text-white shadow-lg" 
                : "text-muted-foreground hover:text-primary"
            }`}
            onClick={() => setIsLogin(true)}
          >
            تسجيل الدخول
          </Button>
          <Button
            variant={!isLogin ? "default" : "ghost"}
            className={`rounded-lg transition-all duration-300 ${
              !isLogin 
                ? "bg-gradient-to-r from-primary to-premium text-white shadow-lg" 
                : "text-muted-foreground hover:text-primary"
            }`}
            onClick={() => setIsLogin(false)}
          >
            إنشاء حساب
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name" className="arabic-body font-medium">الاسم الكامل</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="أدخل اسمك الكامل"
                value={formData.name}
                onChange={handleChange}
                className="rounded-xl border-gray-200 focus:border-primary/40 focus:ring-primary/20 h-12"
                required={!isLogin}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="arabic-body font-medium">البريد الإلكتروني</Label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                value={formData.email}
                onChange={handleChange}
                className="rounded-xl border-gray-200 focus:border-primary/40 focus:ring-primary/20 h-12 pr-12"
                required
              />
              <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="arabic-body font-medium">كلمة المرور</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="أدخل كلمة المرور"
                value={formData.password}
                onChange={handleChange}
                className="rounded-xl border-gray-200 focus:border-primary/40 focus:ring-primary/20 h-12 pr-12 pl-12"
                required
              />
              <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="arabic-body font-medium">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="أعد إدخال كلمة المرور"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="rounded-xl border-gray-200 focus:border-primary/40 focus:ring-primary/20 h-12 pr-12"
                  required={!isLogin}
                />
                <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          )}

          {isLogin && (
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 rtl:space-x-reverse">
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary/20" />
                <span className="text-sm text-muted-foreground arabic-body">تذكرني</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80 arabic-body">
                نسيت كلمة المرور؟
              </Link>
            </div>
          )}

          <Button 
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            {isLogin ? "تسجيل الدخول" : "إنشاء الحساب"}
          </Button>
        </form>

        {/* Social Login */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-muted-foreground arabic-body">أو</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-12 rounded-xl border-gray-200 hover:border-primary/40 hover:bg-primary/5"
            >
              <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button 
              variant="outline" 
              className="h-12 rounded-xl border-gray-200 hover:border-primary/40 hover:bg-primary/5"
            >
              <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground arabic-body">
            بالمتابعة، أنت توافق على 
            <Link to="/terms" className="text-primary hover:text-primary/80 mr-1 ml-1">
              شروط الاستخدام
            </Link>
            و
            <Link to="/privacy" className="text-primary hover:text-primary/80 mr-1">
              سياسة الخصوصية
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;