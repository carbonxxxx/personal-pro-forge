-- 1) Ensure enum includes 'subscription'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'transaction_type' AND e.enumlabel = 'subscription'
  ) THEN
    ALTER TYPE public.transaction_type ADD VALUE 'subscription';
  END IF;
END $$;

-- 2) Update wallet trigger to handle subscription charges (immediate deduction)
CREATE OR REPLACE FUNCTION public.handle_wallet_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance NUMERIC;
BEGIN
  -- Approved deposit: add funds when status moves from pending -> approved
  IF NEW.status = 'approved' AND OLD.status = 'pending' AND NEW.transaction_type = 'deposit' THEN
    UPDATE public.profiles 
    SET 
      wallet_balance = wallet_balance + NEW.amount,
      total_earnings = total_earnings + NEW.amount,
      updated_at = now()
    WHERE profiles.user_id = NEW.user_id;
    
    -- Referral bonuses on approved deposits
    PERFORM process_referral_earnings(NEW.id, NEW.amount);
  END IF;
  
  -- Withdrawal request: reserve funds immediately on insert
  IF NEW.transaction_type = 'withdrawal' AND OLD.transaction_type IS NULL THEN
    SELECT wallet_balance INTO current_balance 
    FROM public.profiles 
    WHERE profiles.user_id = NEW.user_id;
    
    IF current_balance < NEW.amount THEN
      RAISE EXCEPTION 'رصيد المحفظة غير كافي';
    END IF;
    
    UPDATE public.profiles 
    SET 
      wallet_balance = wallet_balance - NEW.amount,
      updated_at = now()
    WHERE profiles.user_id = NEW.user_id;
  END IF;
  
  -- Rejected withdrawal: refund reserved amount
  IF NEW.status = 'rejected' AND OLD.status = 'pending' AND NEW.transaction_type = 'withdrawal' THEN
    UPDATE public.profiles 
    SET 
      wallet_balance = wallet_balance + NEW.amount,
      updated_at = now()
    WHERE profiles.user_id = NEW.user_id;
  END IF;

  -- Subscription purchase: immediate charge on insert (like a payment)
  IF NEW.transaction_type = 'subscription' AND OLD.transaction_type IS NULL THEN
    SELECT wallet_balance INTO current_balance 
    FROM public.profiles 
    WHERE profiles.user_id = NEW.user_id;

    IF current_balance < NEW.amount THEN
      RAISE EXCEPTION 'رصيد المحفظة غير كافي';
    END IF;

    UPDATE public.profiles 
    SET 
      wallet_balance = wallet_balance - NEW.amount,
      updated_at = now()
    WHERE profiles.user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3) Allow users to update their own subscription rows (to cancel previous active)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_subscriptions' 
      AND policyname = 'Users can update their own subscriptions'
  ) THEN
    CREATE POLICY "Users can update their own subscriptions"
    ON public.user_subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;