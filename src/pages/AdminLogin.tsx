import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, EyeOff, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);
    
    try {
      // تسجيل الدخول
      const { error } = await signIn(email, password);
      
      if (error) {
        throw error;
      }

      // التحقق من صلاحيات الأدمن
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('role', 'admin');

      if (roleError) {
        throw new Error('خطأ في التحقق من الصلاحيات');
      }

      if (!userRoles || userRoles.length === 0) {
        await supabase.auth.signOut();
        throw new Error('ليس لديك صلاحيات الوصول للوحة الإدارة');
      }

      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/admin-dashboard');
      
    } catch (error: any) {
      console.error('خطأ في تسجيل الدخول:', error);
      
      let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'بيانات الدخول غير صحيحة';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'يرجى تأكيد بريدك الإلكتروني أولاً';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'محاولات كثيرة، يرجى المحاولة لاحقاً';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-primary-glow rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold arabic-heading text-foreground mb-2">
            لوحة إدارة النظام
          </h1>
          <p className="text-muted-foreground arabic-body">
            تسجيل دخول المشرفين والمديرين
          </p>
          <Badge variant="outline" className="mt-3 arabic-body">
            <Lock className="w-3 h-3 ml-1" />
            منطقة محظورة - أدمن فقط
          </Badge>
        </div>

        {/* Login Card */}
        <Card className="p-8 rounded-2xl border-border shadow-xl bg-card/80 backdrop-blur-lg">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="arabic-body text-foreground">
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="arabic-body h-12 rounded-xl"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="arabic-body text-foreground">
                كلمة المرور
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="arabic-body h-12 rounded-xl pr-12"
                  disabled={loading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] arabic-body"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري تسجيل الدخول...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  تسجيل دخول الأدمن
                </div>
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-orange-800 arabic-body">تنبيه أمني</p>
                <p className="text-orange-700 arabic-body mt-1">
                  هذه المنطقة مخصصة للمشرفين فقط. جميع محاولات الدخول مسجلة ومراقبة.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground arabic-body">
          منصة الملفات الشخصية © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;