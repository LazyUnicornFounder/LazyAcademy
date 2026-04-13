
-- Add onboarding_complete to profiles
ALTER TABLE public.profiles ADD COLUMN onboarding_complete BOOLEAN DEFAULT false;

-- Children table
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 3 AND age <= 16),
  avatar_url TEXT DEFAULT 'owl',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own children" ON public.children FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Child interests table
CREATE TABLE public.child_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  interest TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.child_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own child interests" ON public.child_interests FOR ALL
  USING (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()))
  WITH CHECK (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()));

-- Child preferences table
CREATE TABLE public.child_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  preference TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.child_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own child preferences" ON public.child_preferences FOR ALL
  USING (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()))
  WITH CHECK (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()));

-- Learning schedules table
CREATE TABLE public.learning_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  minutes_per_day INTEGER NOT NULL DEFAULT 30,
  days TEXT[] NOT NULL DEFAULT ARRAY['Mon','Tue','Wed','Thu','Fri'],
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.learning_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own learning schedules" ON public.learning_schedules FOR ALL
  USING (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()))
  WITH CHECK (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()));
