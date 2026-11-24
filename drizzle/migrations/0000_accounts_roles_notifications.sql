CREATE TYPE public.app_role AS ENUM ('refugee', 'employer', 'admin');

-- Profiles -----------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '' CHECK (char_length(full_name) <= 120),
  country_of_residence text NOT NULL DEFAULT '' CHECK (char_length(country_of_residence) <= 80),
  city text CHECK (char_length(city) <= 80),
  phone text CHECK (char_length(phone) <= 30),
  professional_title text CHECK (char_length(professional_title) <= 120),
  years_experience integer CHECK (years_experience BETWEEN 0 AND 70),
  highest_education text CHECK (char_length(highest_education) <= 120),
  languages text CHECK (char_length(languages) <= 200),
  bio text CHECK (char_length(bio) <= 1000),
  organization_name text CHECK (char_length(organization_name) <= 160),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Roles --------------------------------------------------------------------
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Notifications ------------------------------------------------------------
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL CHECK (char_length(title) <= 160),
  body text NOT NULL DEFAULT '' CHECK (char_length(body) <= 1000),
  link text CHECK (char_length(link) <= 200),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_created_idx ON public.notifications (user_id, created_at DESC);

GRANT SELECT, DELETE ON public.notifications TO authenticated;
GRANT UPDATE (read_at) ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can mark their own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- New account setup: profile, role (never admin), welcome notifications -----
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _role public.app_role;
BEGIN
  _role := CASE WHEN NEW.raw_user_meta_data->>'account_type' = 'employer'
                THEN 'employer'::public.app_role
                ELSE 'refugee'::public.app_role END;

  INSERT INTO public.profiles (id, full_name, country_of_residence)
  VALUES (
    NEW.id,
    left(trim(coalesce(NEW.raw_user_meta_data->>'full_name', '')), 120),
    left(trim(coalesce(NEW.raw_user_meta_data->>'country_of_residence', '')), 80)
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);

  IF _role = 'refugee' THEN
    INSERT INTO public.notifications (user_id, title, body, link) VALUES
      (NEW.id, 'Welcome to TalentBridge AI',
       'Your account is ready. Start by completing your profile so your Skills Passport has the right foundation.',
       '/dashboard/profile'),
      (NEW.id, 'Digital Skills Passport is coming next',
       'You will soon be able to document your qualifications and experience in one place.',
       '/dashboard/passport');
  ELSE
    INSERT INTO public.notifications (user_id, title, body, link) VALUES
      (NEW.id, 'Welcome to TalentBridge AI',
       'Your employer account is ready. Add your organisation details to your profile.',
       '/employer/profile');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Admin overview: counts only, no private profile data ---------------------
CREATE OR REPLACE FUNCTION public.admin_account_summary()
RETURNS TABLE (role public.app_role, total bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT ur.role, count(*)::bigint
  FROM public.user_roles ur
  WHERE public.has_role(auth.uid(), 'admin')
  GROUP BY ur.role
$$;

REVOKE EXECUTE ON FUNCTION public.admin_account_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_account_summary() TO authenticated;