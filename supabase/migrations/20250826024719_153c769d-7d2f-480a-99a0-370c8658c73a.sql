-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create payment methods enum
CREATE TYPE public.payment_method AS ENUM ('libyana', 'madar', 'bank', 'binance', 'cash');

-- Create transaction types enum
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal', 'referral_bonus', 'commission');

-- Create transaction status enum
CREATE TYPE public.transaction_status AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  phone TEXT,
  wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  referral_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Create wallet transactions table
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_type public.transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'LYD',
  payment_method public.payment_method,
  status public.transaction_status DEFAULT 'pending',
  reference_number TEXT,
  receipt_image_url TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ
);

-- Create referral earnings table
CREATE TABLE public.referral_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  level INTEGER NOT NULL CHECK (level IN (1, 2)), -- 1 for direct, 2 for indirect
  percentage DECIMAL(5,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  source_transaction_id UUID REFERENCES public.wallet_transactions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payment settings table for admin configuration
CREATE TABLE public.payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_method public.payment_method NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  min_amount DECIMAL(10,2) NOT NULL,
  max_amount DECIMAL(10,2),
  account_number TEXT,
  account_name TEXT,
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default payment settings
INSERT INTO public.payment_settings (payment_method, min_amount, account_number, account_name, instructions) VALUES
('libyana', 50.00, '0921774738', 'Profilee Platform', 'قم بالتحويل إلى رقم ليبيانا المذكور وأرسل لقطة شاشة للتحويل'),
('madar', 50.00, '0917190984', 'Profilee Platform', 'قم بالتحويل إلى رقم مدار المذكور وأرسل لقطة شاشة للتحويل'),
('cash', 200.00, NULL, NULL, 'التحويل النقدي - سيتم التواصل معك لترتيب عملية التسليم'),
('bank', 200.00, NULL, NULL, 'الخدمات المصرفية - قريباً'),
('binance', 200.00, NULL, NULL, 'بايننس - قريباً');

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO exists;
    IF NOT exists THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN code;
END;
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_code TEXT;
  referrer_user_id UUID;
BEGIN
  -- Generate unique referral code
  ref_code := generate_referral_code();
  
  -- Check if user was referred
  IF NEW.raw_user_meta_data ? 'referral_code' THEN
    SELECT user_id INTO referrer_user_id 
    FROM public.profiles 
    WHERE referral_code = NEW.raw_user_meta_data->>'referral_code';
  END IF;
  
  -- Insert profile
  INSERT INTO public.profiles (
    user_id, 
    display_name,
    referral_code,
    referred_by
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    ref_code,
    referrer_user_id
  );
  
  -- Insert default user role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  
  -- Update referrer's referral count
  IF referrer_user_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET referral_count = referral_count + 1 
    WHERE user_id = referrer_user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallet_transactions_updated_at
  BEFORE UPDATE ON public.wallet_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_settings_updated_at
  BEFORE UPDATE ON public.payment_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to process referral earnings
CREATE OR REPLACE FUNCTION public.process_referral_earnings(transaction_id UUID, amount DECIMAL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  referrer_id UUID;
  second_level_referrer_id UUID;
  direct_bonus DECIMAL;
  indirect_bonus DECIMAL;
BEGIN
  -- Get user and referrer info
  SELECT wt.user_id, p.referred_by INTO user_id, referrer_id
  FROM public.wallet_transactions wt
  JOIN public.profiles p ON p.user_id = wt.user_id
  WHERE wt.id = transaction_id;
  
  -- Process direct referral bonus (20%)
  IF referrer_id IS NOT NULL THEN
    direct_bonus := amount * 0.20;
    
    -- Add to referrer's wallet
    UPDATE public.profiles 
    SET wallet_balance = wallet_balance + direct_bonus,
        total_earnings = total_earnings + direct_bonus
    WHERE user_id = referrer_id;
    
    -- Record the earning
    INSERT INTO public.referral_earnings (referrer_id, referred_id, level, percentage, amount, source_transaction_id)
    VALUES (referrer_id, user_id, 1, 20.00, direct_bonus, transaction_id);
    
    -- Check for second level referral (10%)
    SELECT referred_by INTO second_level_referrer_id
    FROM public.profiles
    WHERE user_id = referrer_id;
    
    IF second_level_referrer_id IS NOT NULL THEN
      indirect_bonus := amount * 0.10;
      
      -- Add to second level referrer's wallet
      UPDATE public.profiles 
      SET wallet_balance = wallet_balance + indirect_bonus,
          total_earnings = total_earnings + indirect_bonus
      WHERE user_id = second_level_referrer_id;
      
      -- Record the earning
      INSERT INTO public.referral_earnings (referrer_id, referred_id, level, percentage, amount, source_transaction_id)
      VALUES (second_level_referrer_id, user_id, 2, 10.00, indirect_bonus, transaction_id);
    END IF;
  END IF;
END;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for wallet_transactions
CREATE POLICY "Users can view their own transactions" ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON public.wallet_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON public.wallet_transactions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all transactions" ON public.wallet_transactions
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for referral_earnings
CREATE POLICY "Users can view their own referral earnings" ON public.referral_earnings
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Admins can view all referral earnings" ON public.referral_earnings
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for payment_settings
CREATE POLICY "Everyone can view payment settings" ON public.payment_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage payment settings" ON public.payment_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_status ON public.wallet_transactions(status);
CREATE INDEX idx_referral_earnings_referrer_id ON public.referral_earnings(referrer_id);