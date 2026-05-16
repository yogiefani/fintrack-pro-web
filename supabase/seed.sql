-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Define variables for UUIDs
DO $$
DECLARE
  superadmin_id uuid := '00000000-0000-0000-0000-000000000001';
  yogi_id uuid := '00000000-0000-0000-0000-000000000002';
  zalva_id uuid := '00000000-0000-0000-0000-000000000003';
  kenza_id uuid := '00000000-0000-0000-0000-000000000004';
  
  -- Category IDs (just for Yogi to show examples, we can generate dynamic ones later)
  cat_food_id uuid := gen_random_uuid();
  cat_transport_id uuid := gen_random_uuid();
  cat_salary_id uuid := gen_random_uuid();
BEGIN
  -- 1. Insert Users into auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, app_metadata, user_metadata, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES
  ('00000000-0000-0000-0000-000000000000', superadmin_id, 'authenticated', 'authenticated', 'superadmin@fintrack.app', crypt('SuperAdmin@2025!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Super Admin"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', yogi_id, 'authenticated', 'authenticated', 'yogi@fintrack.app', crypt('Yogi@2025!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Yogi"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', zalva_id, 'authenticated', 'authenticated', 'zalva@fintrack.app', crypt('Zalva@2025!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Zalva"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', kenza_id, 'authenticated', 'authenticated', 'kenza@fintrack.app', crypt('Kenza@2025!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Kenza"}', now(), now(), '', '', '', '')
  ON CONFLICT (id) DO NOTHING;

  -- 2. Insert into profiles
  INSERT INTO public.profiles (id, full_name, email, role, base_currency) VALUES
  (superadmin_id, 'Super Admin', 'superadmin@fintrack.app', 'super_admin', 'IDR'),
  (yogi_id, 'Yogi', 'yogi@fintrack.app', 'member', 'IDR'),
  (zalva_id, 'Zalva', 'zalva@fintrack.app', 'member', 'IDR'),
  (kenza_id, 'Kenza', 'kenza@fintrack.app', 'member', 'IDR')
  ON CONFLICT (id) DO NOTHING;

  -- 3. Insert Default Categories for Yogi
  INSERT INTO public.categories (id, user_id, name, type, icon, color, is_default) VALUES
  (cat_food_id, yogi_id, 'Makanan & Minuman', 'expense', 'Utensils', '#ef4444', true),
  (cat_transport_id, yogi_id, 'Transportasi', 'expense', 'Car', '#3b82f6', true),
  (cat_salary_id, yogi_id, 'Gaji', 'income', 'Wallet', '#22c55e', true);

  -- 4. Insert Sample Transactions for Yogi
  INSERT INTO public.transactions (id, user_id, category_id, type, amount, currency, description, date, is_recurring) VALUES
  (gen_random_uuid(), yogi_id, cat_salary_id, 'income', 15000000, 'IDR', 'Gaji Bulanan', now() - interval '10 days', false),
  (gen_random_uuid(), yogi_id, cat_food_id, 'expense', 50000, 'IDR', 'Makan Siang', now() - interval '2 days', false),
  (gen_random_uuid(), yogi_id, cat_transport_id, 'expense', 150000, 'IDR', 'Isi Bensin', now() - interval '1 day', false);

  -- 5. Insert Sample Budgets for Yogi
  INSERT INTO public.budgets (id, user_id, category_id, amount, month, year) VALUES
  (gen_random_uuid(), yogi_id, cat_food_id, 3000000, EXTRACT(MONTH FROM now()), EXTRACT(YEAR FROM now())),
  (gen_random_uuid(), yogi_id, cat_transport_id, 1000000, EXTRACT(MONTH FROM now()), EXTRACT(YEAR FROM now()));

  -- 6. Insert Sample Saving Goal for Yogi
  INSERT INTO public.saving_goals (id, user_id, name, target_amount, current_amount, is_completed) VALUES
  (gen_random_uuid(), yogi_id, 'Liburan ke Jepang', 20000000, 5000000, false);

END $$;
