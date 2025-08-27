-- إنشاء الجداول المطلوبة بدون تكرار البيانات الموجودة

-- جدول الاشتراكات والباقات
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'LYD',
  period TEXT DEFAULT 'monthly',
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  limitations JSONB DEFAULT '[]'::jsonb,
  max_profiles INTEGER DEFAULT 1,
  max_templates INTEGER DEFAULT 1,
  referral_percentage NUMERIC DEFAULT 0,
  secondary_referral_percentage NUMERIC DEFAULT 0,
  tier TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول القوالب
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  category TEXT,
  tier TEXT NOT NULL DEFAULT 'free',
  preview_image_url TEXT,
  template_data JSONB DEFAULT '{}'::jsonb,
  gradient_colors TEXT,
  rating NUMERIC DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول اشتراكات المستخدمين
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  transaction_id UUID REFERENCES public.wallet_transactions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول الملفات الشخصية للمستخدمين
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.templates(id),
  profile_data JSONB DEFAULT '{}'::jsonb,
  custom_url TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول المنتجات (للحسابات التجارية)
CREATE TABLE public.user_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'LYD',
  images JSONB DEFAULT '[]'::jsonb,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول رموز الخصم
CREATE TABLE public.discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول استخدام رموز الخصم
CREATE TABLE public.discount_code_uses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discount_code_id UUID NOT NULL REFERENCES public.discount_codes(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  transaction_id UUID REFERENCES public.wallet_transactions(id),
  discount_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(discount_code_id, user_id)
);

-- إدراج الباقات الأساسية
INSERT INTO public.subscription_plans (name, name_en, price, description, features, limitations, max_profiles, max_templates, referral_percentage, secondary_referral_percentage, tier) VALUES
('مجاني', 'Free', 0, 'للمبتدئين وتجربة المنصة', 
 '["1 ملف شخصي", "لوحة تحكم بسيطة", "رابط مميز", "1 قالب أساسي", "دعم عبر البريد الإلكتروني"]'::jsonb,
 '["لا يوجد نظام ربح", "إعلانات المنصة", "تخصيص محدود"]'::jsonb,
 1, 1, 0, 0, 'free'),

('مميز', 'Premium', 55, 'للمحترفين والفرق الصغيرة',
 '["3 ملفات شخصية", "نسبة ربح 20%", "لوحة تحكم متقدمة", "تتبع الإحالات", "تخصيص القالب", "5 قوالب احترافية", "إحصائيات مبسطة", "دعم فني متقدم"]'::jsonb,
 '[]'::jsonb,
 3, 5, 20, 0, 'premium'),

('أعمال', 'Business', 120, 'للشركات والفرق الكبيرة',
 '["15 ملف شخصي", "نسبة ربح 20% + 10% من الإحالات", "تحليلات متقدمة", "إدارة الفرق", "دعم فني مباشر", "10 قوالب متميزة", "تقارير تفصيلية", "تكامل مع الأدوات الخارجية", "نطاق فرعي مخصص"]'::jsonb,
 '[]'::jsonb,
 15, 10, 20, 10, 'business'),

('خارق 💥', 'Super', 250, 'لرواد الأعمال والشركات الكبرى',
 '["ملفات غير محدودة", "نسبة ربح 25% + 10% من إحالات المحالين", "ذكاء صناعي لتحسين الملف", "أدوات تسويق متقدمة", "تكامل API كامل", "جميع القوالب + حصرية", "مصمم تفاعلي بالسحب والإفلات", "محرر CSS/JS مخصص", "إدارة فرق متقدمة", "تحليلات AI متقدمة", "دعم فني مخصص 24/7", "تدريب شخصي"]'::jsonb,
 '[]'::jsonb,
 -1, -1, 25, 10, 'super');

-- إدراج القوالب الأساسية
INSERT INTO public.templates (name, name_en, description, category, tier, gradient_colors, rating) VALUES
('Minimalist Pro', 'Minimalist Pro', 'تصميم بسيط وأنيق للمحترفين', 'احترافي', 'free', 'from-gray-400 to-gray-600', 4.8),
('Creative Grid', 'Creative Grid', 'عرض أعمال بنمط شبكي إبداعي', 'إبداعي', 'premium', 'from-premium to-purple-600', 4.9),
('Dark Mode Hero', 'Dark Mode Hero', 'تصميم ليلي جذاب ومميز', 'مبدع', 'premium', 'from-gray-800 to-purple-900', 4.7),
('Startup Pitch', 'Startup Pitch', 'مناسب للمؤسسين ورواد الأعمال', 'أعمال', 'business', 'from-business to-blue-600', 4.9),
('Freelancer Hub', 'Freelancer Hub', 'عرض خدمات ومهارات المستقلين', 'خدمات', 'premium', 'from-green-500 to-teal-600', 4.6),
('Corporate Card', 'Corporate Card', 'تصميم رسمي احترافي للشركات', 'شركات', 'business', 'from-blue-700 to-indigo-800', 4.8),
('Visual Portfolio', 'Visual Portfolio', 'تركيز على الصور والفيديوهات', 'بورتفوليو', 'premium', 'from-pink-500 to-rose-600', 4.7),
('Interactive Resume', 'Interactive Resume', 'سيرة ذاتية تفاعلية مبتكرة', 'سيرة ذاتية', 'business', 'from-indigo-500 to-purple-600', 4.9),
('Influencer Style', 'Influencer Style', 'مناسب للمؤثرين وصناع المحتوى', 'تأثير', 'super', 'from-super to-pink-600', 5.0),
('Arabic Modern', 'Arabic Modern', 'تصميم عربي عصري بطابع مميز', 'عربي', 'super', 'from-gold to-orange-500', 4.9);

-- تحديث جدول إعدادات الدفع مع البيانات الجديدة (إذا لم تكن موجودة)
INSERT INTO public.payment_settings (payment_method, min_amount, max_amount, account_number, account_name, instructions, is_active) 
VALUES 
('libyana', 50, NULL, '0921774738', 'Libyana Mobile Money', 'قم بتحويل المبلغ إلى رقم ليبيانا وأرفق لقطة الشاشة', true),
('madar', 50, NULL, '0917190984', 'Madar Mobile Money', 'قم بتحويل المبلغ إلى رقم مدار وأرفق لقطة الشاشة', true)
ON CONFLICT (payment_method) DO UPDATE SET
  min_amount = EXCLUDED.min_amount,
  account_number = EXCLUDED.account_number,
  account_name = EXCLUDED.account_name,
  instructions = EXCLUDED.instructions,
  is_active = EXCLUDED.is_active;

-- تحديث البيانات الأخرى للطرق غير المتاحة
INSERT INTO public.payment_settings (payment_method, min_amount, max_amount, account_number, account_name, instructions, is_active) 
VALUES 
('bank', 200, NULL, NULL, 'حساب مصرفي', 'سيتم إضافة تفاصيل الحساب المصرفي قريباً', false),
('binance', 200, NULL, NULL, 'Binance Pay', 'سيتم إضافة تفاصيل Binance قريباً', false),
('cash', 200, NULL, NULL, 'استلام نقدي', 'للمبالغ الكبيرة - يرجى التواصل مع الإدارة', false)
ON CONFLICT (payment_method) DO UPDATE SET
  min_amount = EXCLUDED.min_amount,
  account_name = EXCLUDED.account_name,
  instructions = EXCLUDED.instructions,
  is_active = EXCLUDED.is_active;