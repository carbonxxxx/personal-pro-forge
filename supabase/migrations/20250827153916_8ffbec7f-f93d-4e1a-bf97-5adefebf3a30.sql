-- إضافة triggers لإدارة المحافظ تلقائياً

-- إنشاء function لمعالجة المعاملات المالية
CREATE OR REPLACE FUNCTION public.handle_wallet_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- إذا تم الموافقة على معاملة إيداع، إضافة الرصيد للمحفظة
  IF NEW.status = 'approved' AND OLD.status = 'pending' AND NEW.transaction_type = 'deposit' THEN
    UPDATE public.profiles 
    SET wallet_balance = wallet_balance + NEW.amount,
        total_earnings = total_earnings + NEW.amount,
        updated_at = now()
    WHERE user_id = NEW.user_id;
    
    -- إضافة عمولات الإحالة
    PERFORM process_referral_earnings(NEW.id, NEW.amount);
  END IF;
  
  -- إذا تم طلب سحب، حجز المبلغ من المحفظة
  IF NEW.transaction_type = 'withdrawal' AND OLD.transaction_type IS NULL THEN
    -- التحقق من وجود رصيد كافي
    IF (SELECT wallet_balance FROM public.profiles WHERE user_id = NEW.user_id) < NEW.amount THEN
      RAISE EXCEPTION 'رصيد المحفظة غير كافي';
    END IF;
    
    -- حجز المبلغ
    UPDATE public.profiles 
    SET wallet_balance = wallet_balance - NEW.amount,
        updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  -- إذا تم رفض سحب، إعادة المبلغ للمحفظة
  IF NEW.status = 'rejected' AND OLD.status = 'pending' AND NEW.transaction_type = 'withdrawal' THEN
    UPDATE public.profiles 
    SET wallet_balance = wallet_balance + NEW.amount,
        updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء trigger للمعاملات المالية
DROP TRIGGER IF EXISTS wallet_transaction_trigger ON public.wallet_transactions;
CREATE TRIGGER wallet_transaction_trigger
  AFTER INSERT OR UPDATE ON public.wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_wallet_transaction();

-- إضافة عمود لتتبع الرصيد المحجوز
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reserved_balance numeric DEFAULT 0.00;