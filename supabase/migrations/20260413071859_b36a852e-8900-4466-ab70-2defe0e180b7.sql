
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE public.child_progress ADD COLUMN IF NOT EXISTS difficulty_level integer NOT NULL DEFAULT 2;
