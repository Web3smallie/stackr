
-- Create token enum
CREATE TYPE public.accepted_token AS ENUM ('SOL', 'USDC', 'USDT', 'BAGS');

-- Create payment status enum
CREATE TYPE public.payment_status AS ENUM ('pending', 'confirmed', 'failed');

-- Create subscription frequency enum
CREATE TYPE public.subscription_frequency AS ENUM ('weekly', 'monthly', 'yearly');

-- Create content type enum
CREATE TYPE public.content_type AS ENUM ('text', 'file', 'link', 'video');

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  twitter_handle TEXT,
  stackr_score INTEGER NOT NULL DEFAULT 0,
  total_received NUMERIC NOT NULL DEFAULT 0,
  total_supporters INTEGER NOT NULL DEFAULT 0,
  show_earnings BOOLEAN NOT NULL DEFAULT false,
  show_supporter_count BOOLEAN NOT NULL DEFAULT false,
  show_payment_history BOOLEAN NOT NULL DEFAULT false,
  show_profile_photo BOOLEAN NOT NULL DEFAULT true,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  privacy_mode BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 2. PAYMENT PAGES TABLE
-- ============================================
CREATE TABLE public.payment_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  suggested_amounts NUMERIC[] DEFAULT '{1, 5, 10, 25}',
  accepted_tokens accepted_token[] NOT NULL DEFAULT '{SOL, USDC, USDT, BAGS}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payment pages viewable by anyone" ON public.payment_pages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Owners can manage payment pages" ON public.payment_pages
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'));

CREATE TRIGGER update_payment_pages_updated_at
  BEFORE UPDATE ON public.payment_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 3. PAYMENTS TABLE
-- ============================================
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_wallet TEXT NOT NULL,
  to_wallet TEXT NOT NULL,
  page_id UUID REFERENCES public.payment_pages(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  token accepted_token NOT NULL,
  message TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  transaction_signature TEXT UNIQUE,
  status payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipients can view their payments" ON public.payments
  FOR SELECT USING (to_wallet IN (SELECT wallet_address FROM public.users));

CREATE POLICY "Anyone can create payments" ON public.payments
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 4. VAULTS TABLE
-- ============================================
CREATE TABLE public.vaults (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vault_name TEXT NOT NULL,
  vault_purpose TEXT,
  vault_target NUMERIC NOT NULL DEFAULT 0,
  vault_target_token accepted_token NOT NULL DEFAULT 'SOL',
  current_amount NUMERIC NOT NULL DEFAULT 0,
  vault_progress_percentage NUMERIC GENERATED ALWAYS AS (
    CASE WHEN vault_target > 0 THEN ROUND((current_amount / vault_target) * 100, 2) ELSE 0 END
  ) STORED,
  vault_notes TEXT,
  unlock_date TIMESTAMPTZ,
  is_locked BOOLEAN NOT NULL DEFAULT true,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  allow_contributions BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage vaults" ON public.vaults
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'));

CREATE POLICY "Contributable vaults viewable" ON public.vaults
  FOR SELECT USING (allow_contributions = true);

CREATE TRIGGER update_vaults_updated_at
  BEFORE UPDATE ON public.vaults
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 5. VAULT DEPOSITS TABLE
-- ============================================
CREATE TABLE public.vault_deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
  from_wallet TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  token accepted_token NOT NULL,
  transaction_signature TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vault_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vault owners can view deposits" ON public.vault_deposits
  FOR SELECT USING (vault_id IN (SELECT id FROM public.vaults WHERE user_id IN (SELECT id FROM public.users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')));

CREATE POLICY "Anyone can create deposits" ON public.vault_deposits
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 6. POOLS TABLE
-- ============================================
CREATE TABLE public.pools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_tokens TEXT[],
  total_value NUMERIC NOT NULL DEFAULT 0,
  member_count INTEGER NOT NULL DEFAULT 0,
  token accepted_token NOT NULL DEFAULT 'SOL',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active pools viewable" ON public.pools
  FOR SELECT USING (is_active = true);

CREATE POLICY "Creators can manage pools" ON public.pools
  FOR ALL USING (creator_id IN (SELECT id FROM public.users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'));

CREATE TRIGGER update_pools_updated_at
  BEFORE UPDATE ON public.pools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 7. POOL MEMBERS TABLE
-- ============================================
CREATE TABLE public.pool_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_id UUID NOT NULL REFERENCES public.pools(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  contribution NUMERIC NOT NULL DEFAULT 0,
  share_percentage NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(pool_id, wallet_address)
);

ALTER TABLE public.pool_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pool members viewable by pool participants" ON public.pool_members
  FOR SELECT USING (true);

CREATE POLICY "Anyone can join pools" ON public.pool_members
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 8. FUNDRAISING GOALS TABLE
-- ============================================
CREATE TABLE public.fundraising_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  token accepted_token NOT NULL DEFAULT 'SOL',
  deadline TIMESTAMPTZ,
  collaborators TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fundraising_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Goals viewable by anyone" ON public.fundraising_goals
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage goals" ON public.fundraising_goals
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'));

CREATE TRIGGER update_fundraising_goals_updated_at
  BEFORE UPDATE ON public.fundraising_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 9. SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_wallet TEXT NOT NULL,
  to_wallet TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  token accepted_token NOT NULL,
  frequency subscription_frequency NOT NULL DEFAULT 'monthly',
  next_payment_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (
    from_wallet IN (SELECT wallet_address FROM public.users) OR
    to_wallet IN (SELECT wallet_address FROM public.users)
  );

CREATE POLICY "Anyone can create subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (true);

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 10. TOKEN GATES TABLE
-- ============================================
CREATE TABLE public.token_gates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  content_type content_type NOT NULL DEFAULT 'text',
  required_amount NUMERIC NOT NULL DEFAULT 0,
  token accepted_token NOT NULL DEFAULT 'SOL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.token_gates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Token gates viewable" ON public.token_gates
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage token gates" ON public.token_gates
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'));

CREATE TRIGGER update_token_gates_updated_at
  BEFORE UPDATE ON public.token_gates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 11. REFERRALS TABLE
-- ============================================
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_wallet TEXT NOT NULL,
  reward_amount NUMERIC NOT NULL DEFAULT 0,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referrers can view own referrals" ON public.referrals
  FOR SELECT USING (referrer_id IN (SELECT id FROM public.users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'));

CREATE POLICY "Anyone can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (true);
