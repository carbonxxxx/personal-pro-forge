-- Harden functions: set search_path for all and use SECURITY DEFINER where appropriate
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO exists;
    IF NOT exists THEN EXIT; END IF;
  END LOOP;
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_referral_earnings(transaction_id UUID, amount DECIMAL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id UUID;
  referrer_id UUID;
  second_level_referrer_id UUID;
  direct_bonus DECIMAL;
  indirect_bonus DECIMAL;
BEGIN
  SELECT wt.user_id, p.referred_by INTO user_id, referrer_id
  FROM public.wallet_transactions wt
  JOIN public.profiles p ON p.user_id = wt.user_id
  WHERE wt.id = transaction_id;

  IF referrer_id IS NOT NULL THEN
    direct_bonus := amount * 0.20;
    UPDATE public.profiles 
    SET wallet_balance = wallet_balance + direct_bonus,
        total_earnings = total_earnings + direct_bonus
    WHERE user_id = referrer_id;
    INSERT INTO public.referral_earnings (referrer_id, referred_id, level, percentage, amount, source_transaction_id)
    VALUES (referrer_id, user_id, 1, 20.00, direct_bonus, transaction_id);

    SELECT referred_by INTO second_level_referrer_id FROM public.profiles WHERE user_id = referrer_id;
    IF second_level_referrer_id IS NOT NULL THEN
      indirect_bonus := amount * 0.10;
      UPDATE public.profiles 
      SET wallet_balance = wallet_balance + indirect_bonus,
          total_earnings = total_earnings + indirect_bonus
      WHERE user_id = second_level_referrer_id;
      INSERT INTO public.referral_earnings (referrer_id, referred_id, level, percentage, amount, source_transaction_id)
      VALUES (second_level_referrer_id, user_id, 2, 10.00, indirect_bonus, transaction_id);
    END IF;
  END IF;
END;
$$;

-- Admin promotion helper
CREATE OR REPLACE FUNCTION public.promote_admin_by_email(email_input TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = email_input;
  IF uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

-- Attempt to promote the provided admin email
SELECT public.promote_admin_by_email('fghg46814@gmail.com');