-- حذف جميع الخطط الموجودة لإعادة إنشائها
DELETE FROM subscription_plans;

-- إنشاء الخطط الجديدة المحدثة
-- خطة مجانية
INSERT INTO subscription_plans (
  name, name_en, price, currency, period, tier, description, 
  features, limitations, max_profiles, max_templates, 
  referral_percentage, secondary_referral_percentage, is_active
) VALUES 
('مجاني', 'Free', 0, 'LYD', 'monthly', 'free', 'الخطة المجانية للتجربة',
 '["ملف شخصي واحد", "قوالب أساسية", "رابط مخصص", "دعم عبر البريد"]'::jsonb,
 '["لا يوجد نظام ربح", "إعلانات المنصة", "تخصيص محدود"]'::jsonb,
 1, 3, 0, 0, true);

-- خطط مميز (55 د.ل أساسي)
INSERT INTO subscription_plans (
  name, name_en, price, currency, period, tier, description, 
  features, limitations, max_profiles, max_templates, 
  referral_percentage, secondary_referral_percentage, is_active
) VALUES 
('مميز - شهر', 'Premium Monthly', 55, 'LYD', 'monthly', 'premium', 'خطة مميزة شهرية',
 '["5 ملفات شخصية", "جميع القوالب", "إحصائيات متقدمة", "دعم أولوية", "نسبة ربح 20%"]'::jsonb,
 '[]'::jsonb, 5, 50, 20, 10, true),

('مميز - 3 أشهر', 'Premium 3 Months', 165, 'LYD', '3_months', 'premium', 'خطة مميزة لثلاثة أشهر',
 '["5 ملفات شخصية", "جميع القوالب", "إحصائيات متقدمة", "دعم أولوية", "نسبة ربح 20%"]'::jsonb,
 '[]'::jsonb, 5, 50, 20, 10, true),

('مميز - 6 أشهر', 'Premium 6 Months', 280.5, 'LYD', '6_months', 'premium', 'خطة مميزة لستة أشهر - خصم 15%',
 '["5 ملفات شخصية", "جميع القوالب", "إحصائيات متقدمة", "دعم أولوية", "نسبة ربح 20%", "خصم 15%"]'::jsonb,
 '[]'::jsonb, 5, 50, 20, 10, true),

('مميز - سنة', 'Premium Yearly', 561, 'LYD', 'yearly', 'premium', 'خطة مميزة سنوية - خصم 15%',
 '["5 ملفات شخصية", "جميع القوالب", "إحصائيات متقدمة", "دعم أولوية", "نسبة ربح 20%", "خصم 15%"]'::jsonb,
 '[]'::jsonb, 5, 50, 20, 10, true);

-- خطط أعمال (120 د.ل أساسي)
INSERT INTO subscription_plans (
  name, name_en, price, currency, period, tier, description, 
  features, limitations, max_profiles, max_templates, 
  referral_percentage, secondary_referral_percentage, is_active
) VALUES 
('أعمال - شهر', 'Business Monthly', 120, 'LYD', 'monthly', 'business', 'خطة أعمال شهرية',
 '["20 ملف شخصي", "جميع القوالب", "تحليلات متقدمة", "دعم مخصص", "ربط النطاق", "نسبة ربح 25%"]'::jsonb,
 '[]'::jsonb, 20, 100, 25, 15, true),

('أعمال - 3 أشهر', 'Business 3 Months', 360, 'LYD', '3_months', 'business', 'خطة أعمال لثلاثة أشهر',
 '["20 ملف شخصي", "جميع القوالب", "تحليلات متقدمة", "دعم مخصص", "ربط النطاق", "نسبة ربح 25%"]'::jsonb,
 '[]'::jsonb, 20, 100, 25, 15, true),

('أعمال - 6 أشهر', 'Business 6 Months', 612, 'LYD', '6_months', 'business', 'خطة أعمال لستة أشهر - خصم 15%',
 '["20 ملف شخصي", "جميع القوالب", "تحليلات متقدمة", "دعم مخصص", "ربط النطاق", "نسبة ربح 25%", "خصم 15%"]'::jsonb,
 '[]'::jsonb, 20, 100, 25, 15, true),

('أعمال - سنة', 'Business Yearly', 1224, 'LYD', 'yearly', 'business', 'خطة أعمال سنوية - خصم 15%',
 '["20 ملف شخصي", "جميع القوالب", "تحليلات متقدمة", "دعم مخصص", "ربط النطاق", "نسبة ربح 25%", "خصم 15%"]'::jsonb,
 '[]'::jsonb, 20, 100, 25, 15, true);

-- خطط خارقة (250 د.ل أساسي)
INSERT INTO subscription_plans (
  name, name_en, price, currency, period, tier, description, 
  features, limitations, max_profiles, max_templates, 
  referral_percentage, secondary_referral_percentage, is_active
) VALUES 
('خارق - شهر', 'Super Monthly', 250, 'LYD', 'monthly', 'super', 'خطة خارقة شهرية',
 '["ملفات غير محدودة", "جميع القوالب", "تحليلات متقدمة جداً", "دعم مخصص 24/7", "ربط النطاق", "نسبة ربح 30%", "ميزات حصرية"]'::jsonb,
 '[]'::jsonb, 999, 999, 30, 20, true),

('خارق - 3 أشهر', 'Super 3 Months', 750, 'LYD', '3_months', 'super', 'خطة خارقة لثلاثة أشهر',
 '["ملفات غير محدودة", "جميع القوالب", "تحليلات متقدمة جداً", "دعم مخصص 24/7", "ربط النطاق", "نسبة ربح 30%", "ميزات حصرية"]'::jsonb,
 '[]'::jsonb, 999, 999, 30, 20, true),

('خارق - 6 أشهر', 'Super 6 Months', 1275, 'LYD', '6_months', 'super', 'خطة خارقة لستة أشهر - خصم 15%',
 '["ملفات غير محدودة", "جميع القوالب", "تحليلات متقدمة جداً", "دعم مخصص 24/7", "ربط النطاق", "نسبة ربح 30%", "ميزات حصرية", "خصم 15%"]'::jsonb,
 '[]'::jsonb, 999, 999, 30, 20, true),

('خارق - سنة', 'Super Yearly', 2550, 'LYD', 'yearly', 'super', 'خطة خارقة سنوية - خصم 15%',
 '["ملفات غير محدودة", "جميع القوالب", "تحليلات متقدمة جداً", "دعم مخصص 24/7", "ربط النطاق", "نسبة ربح 30%", "ميزات حصرية", "خصم 15%"]'::jsonb,
 '[]'::jsonb, 999, 999, 30, 20, true);