-- إصلاح مشكلة column reference "user_id" is ambiguous في دالة handle_wallet_transaction
CREATE OR REPLACE FUNCTION public.handle_wallet_transaction()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- إذا تم الموافقة على معاملة إيداع، إضافة الرصيد للمحفظة
  IF NEW.status = 'approved' AND OLD.status = 'pending' AND NEW.transaction_type = 'deposit' THEN
    UPDATE public.profiles 
    SET wallet_balance = wallet_balance + NEW.amount,
        total_earnings = total_earnings + NEW.amount,
        updated_at = now()
    WHERE profiles.user_id = NEW.user_id;
    
    -- إضافة عمولات الإحالة
    PERFORM process_referral_earnings(NEW.id, NEW.amount);
  END IF;
  
  -- إذا تم طلب سحب، حجز المبلغ من المحفظة
  IF NEW.transaction_type = 'withdrawal' AND OLD.transaction_type IS NULL THEN
    -- التحقق من وجود رصيد كافي
    IF (SELECT wallet_balance FROM public.profiles WHERE profiles.user_id = NEW.user_id) < NEW.amount THEN
      RAISE EXCEPTION 'رصيد المحفظة غير كافي';
    END IF;
    
    -- حجز المبلغ
    UPDATE public.profiles 
    SET wallet_balance = wallet_balance - NEW.amount,
        updated_at = now()
    WHERE profiles.user_id = NEW.user_id;
  END IF;
  
  -- إذا تم رفض سحب، إعادة المبلغ للمحفظة
  IF NEW.status = 'rejected' AND OLD.status = 'pending' AND NEW.transaction_type = 'withdrawal' THEN
    UPDATE public.profiles 
    SET wallet_balance = wallet_balance + NEW.amount,
        updated_at = now()
    WHERE profiles.user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;