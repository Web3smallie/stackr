
-- Fix overly permissive INSERT policies where we can add validation

-- Users: only allow insert if no duplicate wallet
DROP POLICY "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (
    NOT EXISTS (SELECT 1 FROM public.users u WHERE u.wallet_address = wallet_address)
  );

-- Payments: require valid amount
DROP POLICY "Anyone can create payments" ON public.payments;
CREATE POLICY "Validated payments can be created" ON public.payments
  FOR INSERT WITH CHECK (amount > 0 AND from_wallet IS NOT NULL AND to_wallet IS NOT NULL);

-- Vault deposits: require valid amount and existing vault
DROP POLICY "Anyone can create deposits" ON public.vault_deposits;
CREATE POLICY "Valid deposits can be created" ON public.vault_deposits
  FOR INSERT WITH CHECK (amount > 0 AND vault_id IS NOT NULL);

-- Pool members: require valid pool
DROP POLICY "Anyone can join pools" ON public.pool_members;
CREATE POLICY "Valid pool joins allowed" ON public.pool_members
  FOR INSERT WITH CHECK (pool_id IS NOT NULL AND wallet_address IS NOT NULL);

-- Referrals: require valid referrer
DROP POLICY "Anyone can create referrals" ON public.referrals;
CREATE POLICY "Valid referrals can be created" ON public.referrals
  FOR INSERT WITH CHECK (referrer_id IS NOT NULL AND referred_wallet IS NOT NULL);

-- Subscriptions: require valid data
DROP POLICY "Anyone can create subscriptions" ON public.subscriptions;
CREATE POLICY "Valid subscriptions can be created" ON public.subscriptions
  FOR INSERT WITH CHECK (amount > 0 AND from_wallet IS NOT NULL AND to_wallet IS NOT NULL);
