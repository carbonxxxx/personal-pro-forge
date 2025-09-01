-- إضافة رقم الهاتف لجدول البروفايل
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- تحديث خطط الاشتراكات لتشمل فترات مختلفة
INSERT INTO public.subscription_plans (
  name, name_en, tier, price, currency, period, description, 
  features, max_profiles, max_templates, is_active
) VALUES 
-- الخطة المجانية
('مجاني', 'Free', 'free', 0, 'LYD', 'monthly', 'خطة مجانية أساسية',
 '["إنشاء ملف واحد", "قوالب أساسية", "دعم محدود"]'::jsonb, 1, 3, true),

-- الخطة المميزة - شهر
('مميز شهري', 'Premium Monthly', 'premium', 29, 'LYD', 'monthly', 'خطة مميزة شهرية',
 '["إنشاء 5 ملفات", "جميع القوالب", "إحصائيات متقدمة", "دعم أولوية"]'::jsonb, 5, 50, true),

-- الخطة المميزة - 3 أشهر
('مميز 3 أشهر', 'Premium 3 Months', 'premium', 87, 'LYD', '3_months', 'خطة مميزة 3 أشهر',
 '["إنشاء 5 ملفات", "جميع القوالب", "إحصائيات متقدمة", "دعم أولوية"]'::jsonb, 5, 50, true),

-- الخطة المميزة - 6 أشهر مع خصم 15%
('مميز 6 أشهر', 'Premium 6 Months', 'premium', 148.2, 'LYD', '6_months', 'خطة مميزة 6 أشهر - خصم 15%',
 '["إنشاء 5 ملفات", "جميع القوالب", "إحصائيات متقدمة", "دعم أولوية", "خصم 15%"]'::jsonb, 5, 50, true),

-- الخطة المميزة - سنة مع خصم 15%
('مميز سنوي', 'Premium Yearly', 'premium', 296.4, 'LYD', 'yearly', 'خطة مميزة سنوية - خصم 15%',
 '["إنشاء 5 ملفات", "جميع القوالب", "إحصائيات متقدمة", "دعم أولوية", "خصم 15%"]'::jsonb, 5, 50, true),

-- خطة الأعمال - شهر
('أعمال شهري', 'Business Monthly', 'business', 49, 'LYD', 'monthly', 'خطة أعمال شهرية',
 '["إنشاء 15 ملف", "جميع القوالب", "إحصائيات متقدمة", "دعم مخصص", "ربط النطاق"]'::jsonb, 15, 100, true),

-- خطة الأعمال - 3 أشهر
('أعمال 3 أشهر', 'Business 3 Months', 'business', 147, 'LYD', '3_months', 'خطة أعمال 3 أشهر',
 '["إنشاء 15 ملف", "جميع القوالب", "إحصائيات متقدمة", "دعم مخصص", "ربط النطاق"]'::jsonb, 15, 100, true),

-- خطة الأعمال - 6 أشهر مع خصم 15%
('أعمال 6 أشهر', 'Business 6 Months', 'business', 250.2, 'LYD', '6_months', 'خطة أعمال 6 أشهر - خصم 15%',
 '["إنشاء 15 ملف", "جميع القوالب", "إحصائيات متقدمة", "دعم مخصص", "ربط النطاق", "خصم 15%"]'::jsonb, 15, 100, true),

-- خطة الأعمال - سنة مع خصم 15%
('أعمال سنوي', 'Business Yearly', 'business', 500.4, 'LYD', 'yearly', 'خطة أعمال سنوية - خصم 15%',
 '["إنشاء 15 ملف", "جميع القوالب", "إحصائيات متقدمة", "دعم مخصص", "ربط النطاق", "خصم 15%"]'::jsonb, 15, 100, true);

-- إضافة عمود لحالة تأكيد البريد الإلكتروني ومكافأة الترحيب
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS welcome_bonus_claimed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_step_completed BOOLEAN DEFAULT false;