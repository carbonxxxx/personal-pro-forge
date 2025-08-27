-- إصلاح مشاكل الأمان وتفعيل RLS على جميع الجداول

-- تفعيل RLS على الجداول الجديدة
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_code_uses ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للباقات (مرئية للجميع)
CREATE POLICY "Everyone can view subscription plans" ON public.subscription_plans
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans" ON public.subscription_plans
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- سياسات RLS للقوالب (مرئية للجميع)
CREATE POLICY "Everyone can view templates" ON public.templates
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage templates" ON public.templates
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- سياسات RLS لاشتراكات المستخدمين
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" ON public.user_subscriptions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON public.user_subscriptions
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage subscriptions" ON public.user_subscriptions
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- سياسات RLS للملفات الشخصية
CREATE POLICY "Users can view their own profiles" ON public.user_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own profiles" ON public.user_profiles
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view active profiles" ON public.user_profiles
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- سياسات RLS للمنتجات
CREATE POLICY "Users can manage their own products" ON public.user_products
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view active products" ON public.user_products
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all products" ON public.user_products
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- سياسات RLS لرموز الخصم
CREATE POLICY "Admins can manage discount codes" ON public.discount_codes
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view active discount codes" ON public.discount_codes
FOR SELECT USING (is_active = true AND valid_from <= now() AND (valid_until IS NULL OR valid_until >= now()));

-- سياسات RLS لاستخدام رموز الخصم
CREATE POLICY "Users can view their discount code usage" ON public.discount_code_uses
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create discount code usage" ON public.discount_code_uses
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all discount code usage" ON public.discount_code_uses
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- إنشاء مؤشرات للأداء
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_custom_url ON public.user_profiles(custom_url);
CREATE INDEX IF NOT EXISTS idx_user_products_user_id ON public.user_products(user_id);
CREATE INDEX IF NOT EXISTS idx_user_products_profile_id ON public.user_products(profile_id);
CREATE INDEX IF NOT EXISTS idx_templates_tier ON public.templates(tier);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON public.discount_codes(code);

-- إنشاء triggers للتحديث التلقائي
CREATE OR REPLACE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_templates_updated_at
BEFORE UPDATE ON public.templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_products_updated_at
BEFORE UPDATE ON public.user_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_discount_codes_updated_at
BEFORE UPDATE ON public.discount_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();