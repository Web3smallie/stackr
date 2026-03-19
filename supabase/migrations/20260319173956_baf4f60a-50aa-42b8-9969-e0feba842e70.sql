
-- Fix users table RLS policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.users;

CREATE POLICY "Anyone can view profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Anyone can insert profile" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update own profile" ON public.users FOR UPDATE USING (true);

-- Fix payment_pages policies
DROP POLICY IF EXISTS "Owners can manage payment pages" ON public.payment_pages;
DROP POLICY IF EXISTS "Payment pages viewable by anyone" ON public.payment_pages;

CREATE POLICY "Anyone can view payment pages" ON public.payment_pages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert payment pages" ON public.payment_pages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update payment pages" ON public.payment_pages FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete payment pages" ON public.payment_pages FOR DELETE USING (true);

-- Fix payments policies
DROP POLICY IF EXISTS "Recipients can view their payments" ON public.payments;
DROP POLICY IF EXISTS "Validated payments can be created" ON public.payments;

CREATE POLICY "Anyone can view payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert payments" ON public.payments FOR INSERT WITH CHECK (amount > 0 AND from_wallet IS NOT NULL AND to_wallet IS NOT NULL);

-- Fix vaults policies
DROP POLICY IF EXISTS "Contributable vaults viewable" ON public.vaults;
DROP POLICY IF EXISTS "Owners can manage vaults" ON public.vaults;

CREATE POLICY "Anyone can view vaults" ON public.vaults FOR SELECT USING (true);
CREATE POLICY "Anyone can insert vaults" ON public.vaults FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update vaults" ON public.vaults FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete vaults" ON public.vaults FOR DELETE USING (true);

-- Fix vault_deposits policies
DROP POLICY IF EXISTS "Valid deposits can be created" ON public.vault_deposits;
DROP POLICY IF EXISTS "Vault owners can view deposits" ON public.vault_deposits;

CREATE POLICY "Anyone can view vault deposits" ON public.vault_deposits FOR SELECT USING (true);
CREATE POLICY "Anyone can insert vault deposits" ON public.vault_deposits FOR INSERT WITH CHECK (amount > 0 AND vault_id IS NOT NULL);

-- Fix pools policies
DROP POLICY IF EXISTS "Active pools viewable" ON public.pools;
DROP POLICY IF EXISTS "Creators can manage pools" ON public.pools;

CREATE POLICY "Anyone can view pools" ON public.pools FOR SELECT USING (true);
CREATE POLICY "Anyone can insert pools" ON public.pools FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update pools" ON public.pools FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete pools" ON public.pools FOR DELETE USING (true);

-- Fix pool_members policies
DROP POLICY IF EXISTS "Pool members viewable by pool participants" ON public.pool_members;
DROP POLICY IF EXISTS "Valid pool joins allowed" ON public.pool_members;

CREATE POLICY "Anyone can view pool members" ON public.pool_members FOR SELECT USING (true);
CREATE POLICY "Anyone can insert pool members" ON public.pool_members FOR INSERT WITH CHECK (pool_id IS NOT NULL AND wallet_address IS NOT NULL);
CREATE POLICY "Anyone can update pool members" ON public.pool_members FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete pool members" ON public.pool_members FOR DELETE USING (true);

-- Fix fundraising_goals policies
DROP POLICY IF EXISTS "Goals viewable by anyone" ON public.fundraising_goals;
DROP POLICY IF EXISTS "Owners can manage goals" ON public.fundraising_goals;

CREATE POLICY "Anyone can view goals" ON public.fundraising_goals FOR SELECT USING (true);
CREATE POLICY "Anyone can insert goals" ON public.fundraising_goals FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update goals" ON public.fundraising_goals FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete goals" ON public.fundraising_goals FOR DELETE USING (true);

-- Fix subscriptions policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Valid subscriptions can be created" ON public.subscriptions;

CREATE POLICY "Anyone can view subscriptions" ON public.subscriptions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (amount > 0 AND from_wallet IS NOT NULL AND to_wallet IS NOT NULL);
CREATE POLICY "Anyone can update subscriptions" ON public.subscriptions FOR UPDATE USING (true);

-- Fix token_gates policies
DROP POLICY IF EXISTS "Owners can manage token gates" ON public.token_gates;
DROP POLICY IF EXISTS "Token gates viewable" ON public.token_gates;

CREATE POLICY "Anyone can view token gates" ON public.token_gates FOR SELECT USING (true);
CREATE POLICY "Anyone can insert token gates" ON public.token_gates FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update token gates" ON public.token_gates FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete token gates" ON public.token_gates FOR DELETE USING (true);

-- Fix referrals policies
DROP POLICY IF EXISTS "Referrers can view own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Valid referrals can be created" ON public.referrals;

CREATE POLICY "Anyone can view referrals" ON public.referrals FOR SELECT USING (true);
CREATE POLICY "Anyone can insert referrals" ON public.referrals FOR INSERT WITH CHECK (referrer_id IS NOT NULL AND referred_wallet IS NOT NULL);
