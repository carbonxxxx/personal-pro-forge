-- إضافة أدمن رئيسي للنظام
SELECT promote_admin_by_email('admin@example.com');

-- إضافة عمود is_active للمستخدمين في جدول profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- إنشاء دالة لشحن رصيد المستخدم يدوياً
CREATE OR REPLACE FUNCTION public.add_manual_balance(
  target_user_id UUID,
  amount NUMERIC,
  admin_notes TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- التحقق من أن المستدعي أدمن
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'غير مسموح - مطلوب صلاحيات أدمن';
  END IF;
  
  -- إضافة الرصيد إلى المحفظة
  UPDATE public.profiles 
  SET wallet_balance = wallet_balance + amount,
      total_earnings = total_earnings + amount,
      updated_at = now()
  WHERE user_id = target_user_id;
  
  -- إنشاء سجل في المعاملات
  INSERT INTO public.wallet_transactions (
    user_id,
    transaction_type,
    amount,
    status,
    processed_by,
    processed_at,
    admin_notes,
    reference_number
  ) VALUES (
    target_user_id,
    'deposit',
    amount,
    'approved',
    auth.uid(),
    now(),
    COALESCE(admin_notes, 'شحن يدوي من قبل الإدارة'),
    'MANUAL_' || EXTRACT(EPOCH FROM now())::TEXT
  );
END;
$$;

-- إنشاء دالة لتفعيل/إلغاء تفعيل المستخدم
CREATE OR REPLACE FUNCTION public.toggle_user_status(
  target_user_id UUID,
  new_status BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- التحقق من أن المستدعي أدمن
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'غير مسموح - مطلوب صلاحيات أدمن';
  END IF;
  
  -- تحديث حالة المستخدم
  UPDATE public.profiles 
  SET is_active = new_status,
      updated_at = now()
  WHERE user_id = target_user_id;
END;
$$;