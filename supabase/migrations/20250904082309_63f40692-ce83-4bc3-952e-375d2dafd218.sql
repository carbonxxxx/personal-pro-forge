-- Fix 1: Make email confirmation bonus automatic
-- Create a trigger to automatically give 5 LYD bonus when email is confirmed
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if email was just confirmed and bonus not claimed yet
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    -- Update profile to mark email as confirmed and add bonus
    UPDATE public.profiles 
    SET 
      email_confirmed = true,
      wallet_balance = wallet_balance + 5,
      total_earnings = total_earnings + 5,
      welcome_bonus_claimed = true,
      updated_at = now()
    WHERE user_id = NEW.id AND welcome_bonus_claimed = false;
    
    -- Create transaction record for the bonus
    INSERT INTO public.wallet_transactions (
      user_id,
      transaction_type,
      amount,
      status,
      processed_at,
      admin_notes,
      reference_number
    ) VALUES (
      NEW.id,
      'deposit',
      5,
      'approved',
      now(),
      'مكافأة ترحيب - تأكيد البريد الإلكتروني (تلقائي)',
      'WELCOME_BONUS_' || EXTRACT(EPOCH FROM now())::TEXT
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for email confirmation
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;
CREATE TRIGGER on_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_confirmation();

-- Fix 2: Completely rewrite handle_wallet_transaction to fix ambiguous user_id error
CREATE OR REPLACE FUNCTION public.handle_wallet_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance NUMERIC;
BEGIN
  -- إذا تم الموافقة على معاملة إيداع، إضافة الرصيد للمحفظة
  IF NEW.status = 'approved' AND OLD.status = 'pending' AND NEW.transaction_type = 'deposit' THEN
    UPDATE public.profiles 
    SET 
      wallet_balance = wallet_balance + NEW.amount,
      total_earnings = total_earnings + NEW.amount,
      updated_at = now()
    WHERE profiles.user_id = NEW.user_id;
    
    -- إضافة عمولات الإحالة
    PERFORM process_referral_earnings(NEW.id, NEW.amount);
  END IF;
  
  -- إذا تم طلب سحب، حجز المبلغ من المحفظة
  IF NEW.transaction_type = 'withdrawal' AND OLD.transaction_type IS NULL THEN
    -- التحقق من وجود رصيد كافي
    SELECT wallet_balance INTO current_balance 
    FROM public.profiles 
    WHERE profiles.user_id = NEW.user_id;
    
    IF current_balance < NEW.amount THEN
      RAISE EXCEPTION 'رصيد المحفظة غير كافي';
    END IF;
    
    -- حجز المبلغ
    UPDATE public.profiles 
    SET 
      wallet_balance = wallet_balance - NEW.amount,
      updated_at = now()
    WHERE profiles.user_id = NEW.user_id;
  END IF;
  
  -- إذا تم رفض سحب، إعادة المبلغ للمحفظة
  IF NEW.status = 'rejected' AND OLD.status = 'pending' AND NEW.transaction_type = 'withdrawal' THEN
    UPDATE public.profiles 
    SET 
      wallet_balance = wallet_balance + NEW.amount,
      updated_at = now()
    WHERE profiles.user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;