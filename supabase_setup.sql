CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'none');

CREATE TABLE profiles (
  id text PRIMARY KEY,
  email text,
  tier text DEFAULT 'free',
  subscription_status subscription_status DEFAULT 'none',
  polar_customer_id text,
  polar_subscription_id text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (id = auth.uid()::text);

CREATE TABLE optimizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES profiles(id),
  original_name text NOT NULL,
  original_size bigint NOT NULL,
  optimized_size bigint NOT NULL,
  stats jsonb NOT NULL,
  download_url text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE optimizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own optimizations" 
ON optimizations FOR SELECT 
USING (user_id = auth.uid()::text);
