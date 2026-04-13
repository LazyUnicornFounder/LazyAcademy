
-- curriculum_modules table
CREATE TABLE public.curriculum_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  theme_emoji TEXT,
  week_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.curriculum_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own curriculum modules"
ON public.curriculum_modules FOR ALL
USING (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()))
WITH CHECK (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()));

-- lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.curriculum_modules(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('video', 'read', 'hands_on', 'audio', 'game', 'quiz')),
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  content_json JSONB,
  day_number INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own lessons"
ON public.lessons FOR ALL
USING (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()))
WITH CHECK (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()));

-- child_progress table
CREATE TABLE public.child_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  total_lessons_completed INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(child_id)
);

ALTER TABLE public.child_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own child progress"
ON public.child_progress FOR ALL
USING (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()))
WITH CHECK (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()));

-- Enable realtime for lessons (for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.lessons;
