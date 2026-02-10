-- ═══════════════════════════════════════════════════════════
-- Titration Graph Generator — Database Schema
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════
-- ตาราง: profiles
-- ═══════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    university TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ═══════════════════════════════════
-- ตาราง: experiments
-- ═══════════════════════════════════
CREATE TABLE IF NOT EXISTS experiments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    experiment_name TEXT NOT NULL DEFAULT 'Untitled',
    experiment_no TEXT DEFAULT '',
    volume_data JSONB NOT NULL,
    ph_data JSONB NOT NULL,
    eq_volume DECIMAL(10,4),
    eq_ph DECIMAL(10,4),
    eq_dph_dv DECIMAL(10,4),
    exp_type TEXT,
    chart_config JSONB DEFAULT '{
        "xLabel": "Volume of NaOH (mL)",
        "yLabel": "pH",
        "xMax": 10, "yMaxPH": 14, "yMaxDV": 6,
        "xStep": 2, "yStepPH": 2, "yStepDV": 1,
        "lineColor": "#6c63ff", "markerColor": "#6c63ff"
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_experiments_user ON experiments(user_id);
CREATE INDEX IF NOT EXISTS idx_experiments_date ON experiments(created_at DESC);

ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users CRUD own experiments"
    ON experiments FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════
-- ตาราง: user_settings
-- ═══════════════════════════════════
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    default_experiment_name TEXT DEFAULT 'KHP-STD',
    default_x_label TEXT DEFAULT 'Volume of NaOH (mL)',
    default_y_label TEXT DEFAULT 'pH',
    default_chart_config JSONB DEFAULT '{
        "xMax": 10, "yMaxPH": 14, "yMaxDV": 6,
        "xStep": 2, "yStepPH": 2, "yStepDV": 1,
        "lineColor": "#6c63ff", "markerColor": "#6c63ff"
    }',
    theme TEXT DEFAULT 'dark',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own settings"
    ON user_settings FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════
-- ตาราง: admins
-- ═══════════════════════════════════
CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin table"
    ON admins FOR SELECT USING (auth.uid() = user_id);

-- ═══════════════════════════════════
-- Triggers: Auto-create profile & settings
-- ═══════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
    
    INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════
-- Triggers: Auto-update updated_at
-- ═══════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles ON profiles;
CREATE TRIGGER trg_profiles BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_experiments ON experiments;
CREATE TRIGGER trg_experiments BEFORE UPDATE ON experiments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_settings ON user_settings;
CREATE TRIGGER trg_settings BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════
-- Grant permissions for admins to read all
-- ═══════════════════════════════════
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all experiments"
    ON experiments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
        )
    );

-- ═══════════════════════════════════
-- Example: Make a user admin (run manually)
-- ═══════════════════════════════════
-- INSERT INTO admins (user_id, role)
-- SELECT id, 'admin' FROM profiles WHERE email = 'your-email@example.com';
