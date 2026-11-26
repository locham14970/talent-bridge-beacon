CREATE TABLE public.profile_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('cv', 'certificate')),
  title TEXT NOT NULL,
  issuer TEXT NOT NULL DEFAULT '',
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_documents TO authenticated;
GRANT ALL ON public.profile_documents TO service_role;

ALTER TABLE public.profile_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
  ON public.profile_documents FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON public.profile_documents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON public.profile_documents FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON public.profile_documents FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX profile_documents_user_type_idx ON public.profile_documents (user_id, doc_type, created_at DESC);

CREATE POLICY "Users can view their own profile files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'profile-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload their own profile files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own profile files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-documents' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'profile-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own profile files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'profile-documents' AND (storage.foldername(name))[1] = auth.uid()::text);


CREATE TABLE public.skills_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  technical_score INTEGER NOT NULL CHECK (technical_score >= 0 AND technical_score <= 100),
  language_score INTEGER NOT NULL CHECK (language_score >= 0 AND language_score <= 100),
  digital_score INTEGER NOT NULL CHECK (digital_score >= 0 AND digital_score <= 100),
  readiness_score INTEGER NOT NULL CHECK (readiness_score >= 0 AND readiness_score <= 100),
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  summary TEXT NOT NULL DEFAULT '',
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.skills_assessments TO authenticated;
GRANT ALL ON public.skills_assessments TO service_role;

ALTER TABLE public.skills_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assessments"
  ON public.skills_assessments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments"
  ON public.skills_assessments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
  ON public.skills_assessments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessments"
  ON public.skills_assessments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX skills_assessments_user_completed_idx ON public.skills_assessments (user_id, completed_at DESC);


CREATE TABLE public.passport_shares (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_active BOOLEAN NOT NULL DEFAULT false,
  include_contact BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.passport_shares TO authenticated;
GRANT ALL ON public.passport_shares TO service_role;

ALTER TABLE public.passport_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own passport share"
  ON public.passport_shares FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own passport share"
  ON public.passport_shares FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own passport share"
  ON public.passport_shares FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own passport share"
  ON public.passport_shares FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER passport_shares_set_updated_at
  BEFORE UPDATE ON public.passport_shares
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


CREATE OR REPLACE FUNCTION public.get_shared_passport(_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_share public.passport_shares%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
  v_result JSONB;
BEGIN
  IF _token IS NULL OR length(trim(_token)) < 16 THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_share
  FROM public.passport_shares
  WHERE share_token = trim(_token) AND is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE id = v_share.user_id;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  v_result := jsonb_build_object(
    'full_name', v_profile.full_name,
    'professional_title', v_profile.professional_title,
    'country_of_residence', v_profile.country_of_residence,
    'city', v_profile.city,
    'languages', v_profile.languages,
    'bio', v_profile.bio,
    'phone', CASE WHEN v_share.include_contact THEN v_profile.phone ELSE NULL END,
    'educations', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'institution', e.institution,
        'qualification', e.qualification,
        'field_of_study', e.field_of_study,
        'graduation_year', e.graduation_year
      ) ORDER BY e.graduation_year DESC)
      FROM public.profile_educations e WHERE e.user_id = v_share.user_id
    ), '[]'::jsonb),
    'experiences', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'employer', w.employer,
        'job_title', w.job_title,
        'start_date', w.start_date,
        'end_date', w.end_date,
        'is_current', w.is_current,
        'responsibilities', w.responsibilities,
        'achievements', w.achievements
      ) ORDER BY w.start_date DESC)
      FROM public.profile_experiences w WHERE w.user_id = v_share.user_id
    ), '[]'::jsonb),
    'skills', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'name', s.name,
        'category', s.category
      ) ORDER BY s.category, s.name)
      FROM public.profile_skills s WHERE s.user_id = v_share.user_id
    ), '[]'::jsonb),
    'certificates', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'title', d.title,
        'issuer', d.issuer,
        'created_at', d.created_at
      ) ORDER BY d.created_at DESC)
      FROM public.profile_documents d WHERE d.user_id = v_share.user_id AND d.doc_type = 'certificate'
    ), '[]'::jsonb),
    'latest_assessment', (
      SELECT jsonb_build_object(
        'technical_score', a.technical_score,
        'language_score', a.language_score,
        'digital_score', a.digital_score,
        'readiness_score', a.readiness_score,
        'overall_score', a.overall_score,
        'summary', a.summary,
        'completed_at', a.completed_at
      )
      FROM public.skills_assessments a
      WHERE a.user_id = v_share.user_id
      ORDER BY a.completed_at DESC
      LIMIT 1
    )
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_shared_passport(TEXT) TO anon, authenticated;


CREATE TABLE public.job_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  location TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  industry TEXT NOT NULL,
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL,
  is_sample BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_opportunities TO authenticated;
GRANT ALL ON public.job_opportunities TO service_role;

ALTER TABLE public.job_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active opportunities"
  ON public.job_opportunities FOR SELECT TO authenticated
  USING (is_active = true OR auth.uid() = employer_id);

CREATE POLICY "Employers can create their own opportunities"
  ON public.job_opportunities FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'employer') AND auth.uid() = employer_id AND is_sample = false);

CREATE POLICY "Employers can update their own opportunities"
  ON public.job_opportunities FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'employer') AND auth.uid() = employer_id)
  WITH CHECK (public.has_role(auth.uid(), 'employer') AND auth.uid() = employer_id);

CREATE POLICY "Employers can delete their own opportunities"
  ON public.job_opportunities FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'employer') AND auth.uid() = employer_id);

CREATE INDEX job_opportunities_active_created_idx ON public.job_opportunities (is_active, created_at DESC);

CREATE TRIGGER job_opportunities_set_updated_at
  BEFORE UPDATE ON public.job_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


CREATE TABLE public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.job_opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_id)
);

GRANT SELECT, INSERT, DELETE ON public.saved_jobs TO authenticated;
GRANT ALL ON public.saved_jobs TO service_role;

ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved jobs"
  ON public.saved_jobs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save jobs"
  ON public.saved_jobs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave their own jobs"
  ON public.saved_jobs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.job_opportunities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'interview', 'accepted', 'rejected')),
  cover_note TEXT NOT NULL DEFAULT '',
  cv_document_id UUID REFERENCES public.profile_documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_applications TO authenticated;
GRANT ALL ON public.job_applications TO service_role;

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own applications"
  ON public.job_applications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit their own applications"
  ON public.job_applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'submitted');

CREATE POLICY "Users can withdraw their own applications"
  ON public.job_applications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Employers can view applications to their jobs"
  ON public.job_applications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.job_opportunities j WHERE j.id = job_id AND j.employer_id = auth.uid()));

CREATE POLICY "Employers can update status on applications to their jobs"
  ON public.job_applications FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.job_opportunities j WHERE j.id = job_id AND j.employer_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.job_opportunities j WHERE j.id = job_id AND j.employer_id = auth.uid()));

CREATE INDEX job_applications_user_created_idx ON public.job_applications (user_id, created_at DESC);

CREATE TRIGGER job_applications_set_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();