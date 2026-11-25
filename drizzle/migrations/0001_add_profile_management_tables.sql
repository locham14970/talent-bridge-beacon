CREATE TABLE public.profile_educations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  qualification TEXT NOT NULL,
  field_of_study TEXT NOT NULL,
  graduation_year INTEGER NOT NULL CHECK (graduation_year >= 1950 AND graduation_year <= 2040),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_educations TO authenticated;
GRANT ALL ON public.profile_educations TO service_role;

ALTER TABLE public.profile_educations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own educations"
  ON public.profile_educations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own educations"
  ON public.profile_educations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own educations"
  ON public.profile_educations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own educations"
  ON public.profile_educations FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX profile_educations_user_year_idx
  ON public.profile_educations (user_id, graduation_year DESC);

CREATE TRIGGER profile_educations_set_updated_at
  BEFORE UPDATE ON public.profile_educations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


CREATE TABLE public.profile_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('technical', 'soft')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_skills TO authenticated;
GRANT ALL ON public.profile_skills TO service_role;

ALTER TABLE public.profile_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own skills"
  ON public.profile_skills FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skills"
  ON public.profile_skills FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills"
  ON public.profile_skills FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills"
  ON public.profile_skills FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX profile_skills_user_category_idx
  ON public.profile_skills (user_id, category);

CREATE TRIGGER profile_skills_set_updated_at
  BEFORE UPDATE ON public.profile_skills
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


CREATE TABLE public.profile_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  employer TEXT NOT NULL,
  job_title TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  is_current BOOLEAN NOT NULL DEFAULT false,
  responsibilities TEXT NOT NULL DEFAULT '',
  achievements TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_experiences TO authenticated;
GRANT ALL ON public.profile_experiences TO service_role;

ALTER TABLE public.profile_experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own experiences"
  ON public.profile_experiences FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own experiences"
  ON public.profile_experiences FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own experiences"
  ON public.profile_experiences FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own experiences"
  ON public.profile_experiences FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX profile_experiences_user_start_idx
  ON public.profile_experiences (user_id, start_date DESC);

CREATE TRIGGER profile_experiences_set_updated_at
  BEFORE UPDATE ON public.profile_experiences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


CREATE TABLE public.profile_career_interests (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_roles TEXT[] NOT NULL DEFAULT '{}',
  industries TEXT[] NOT NULL DEFAULT '{}',
  employment_preferences TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_career_interests TO authenticated;
GRANT ALL ON public.profile_career_interests TO service_role;

ALTER TABLE public.profile_career_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own career interests"
  ON public.profile_career_interests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own career interests"
  ON public.profile_career_interests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own career interests"
  ON public.profile_career_interests FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own career interests"
  ON public.profile_career_interests FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER profile_career_interests_set_updated_at
  BEFORE UPDATE ON public.profile_career_interests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();