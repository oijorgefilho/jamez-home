-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  name TEXT,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro')),
  daily_credits_reset TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Credits table
CREATE TABLE IF NOT EXISTS public.credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  amount INTEGER NOT NULL DEFAULT 1800,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_user_profiles_auth_users'
  ) THEN
    ALTER TABLE public.user_profiles
    ADD CONSTRAINT fk_user_profiles_auth_users
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_credits_auth_users'
  ) THEN
    ALTER TABLE public.credits
    ADD CONSTRAINT fk_credits_auth_users
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Function to reset daily credits
CREATE OR REPLACE FUNCTION public.reset_daily_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Reset credits for free users
  UPDATE public.credits
  SET amount = 1800 -- 30 minutes in seconds
  WHERE user_id IN (
    SELECT user_id FROM public.user_profiles WHERE plan_type = 'free'
  );

  -- Reset credits for pro users
  UPDATE public.credits
  SET amount = 7200 -- 120 minutes in seconds
  WHERE user_id IN (
    SELECT user_id FROM public.user_profiles WHERE plan_type = 'pro'
  );

  -- Update the reset timestamp
  UPDATE public.user_profiles
  SET daily_credits_reset = CURRENT_TIMESTAMP;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS daily_credit_reset ON public.user_profiles;

-- Recreate the trigger for daily credit reset
CREATE TRIGGER daily_credit_reset
AFTER UPDATE OF daily_credits_reset ON public.user_profiles
FOR EACH STATEMENT
EXECUTE FUNCTION public.reset_daily_credits();

-- Function to add credits
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_minutes INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.credits
  SET amount = amount + (p_minutes * 60)
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to use credits
CREATE OR REPLACE FUNCTION public.use_credits(
  p_user_id UUID,
  p_seconds INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.credits
  SET amount = GREATEST(amount - p_seconds, 0)
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

