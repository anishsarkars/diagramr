-- Create the waitlist table to store potential users when the registration limit is reached
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow admins to see all waitlist entries
CREATE POLICY "Allow admins to access all waitlist entries" ON public.waitlist
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM auth.users WHERE id IN (
    SELECT id FROM public.profiles WHERE is_premium = TRUE
  )));

-- Allow anonymous users to submit waitlist emails
CREATE POLICY "Allow anonymous to insert waitlist entries" ON public.waitlist
  FOR INSERT
  TO anon
  WITH CHECK (TRUE); 