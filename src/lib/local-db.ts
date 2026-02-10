// (ลบไฟล์นี้ออกจากโปรเจค) — This file is obsolete. All logic now uses Supabase. Safe to delete.
import type { Profile, UserSettings, Experiment, ChartConfig } from '@/types';

// Lightweight localStorage helpers (minimal, for compatibility during local dev)
type StoredUser = { id: string; email: string; password: string; full_name?: string | null; created_at: string };

const STORAGE_KEYS = {
    USERS: 'app_users',
    PROFILES: 'app_profiles',
    SETTINGS: 'app_settings',
    EXPERIMENTS: 'app_experiments',
    ADMINS: 'app_admins',
    CURRENT_USER: 'app_current_user',
} as const;

function getItem<T>(key: string, def: T): T {
    try {
        if (typeof window === 'undefined') return def;
        const raw = localStorage.getItem(key);
        if (!raw) return def;
        return JSON.parse(raw) as T;
    } catch (e) {
        return def;
    }
}

function setItem<T>(key: string, val: T) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
        // ignore
    }
}

function generateUUID() {
    return Math.random().toString(36).slice(2, 9);
}

function simpleHash(s: string) {
    return s.split('').reverse().join('');
}

export function signUp(email: string, password: string, fullName?: string): { user: { id: string; email: string } | null; error: string | null } {
    const users = getItem<StoredUser[]>(STORAGE_KEYS.USERS, []);

    if (users.find((u) => u.email === email)) {
        return { user: null, error: 'อีเมลนี้ถูกใช้งานแล้ว' };
    }

    const id = generateUUID();
    const now = new Date().toISOString();

    const newUser: StoredUser = {
        id,
        email,
        password: simpleHash(password),
        full_name: fullName,
        created_at: now,
    };

    users.push(newUser);
    setItem(STORAGE_KEYS.USERS, users);

    // Auto-create profile
    const profiles = getItem<Profile[]>(STORAGE_KEYS.PROFILES, []);
    profiles.push({
        id,
        email,
        full_name: fullName || null,
        university: null,
        avatar_url: null,
        created_at: now,
        updated_at: now,
    });
    setItem(STORAGE_KEYS.PROFILES, profiles);

    // Auto-create settings
    const settings = getItem<UserSettings[]>(STORAGE_KEYS.SETTINGS, []);
    settings.push({
        id: generateUUID(),
        user_id: id,
        default_experiment_name: 'KHP-STD',
        default_x_label: 'Volume of NaOH (mL)',
        default_y_label: 'pH',
        default_chart_config: {
            xMax: 10, yMaxPH: 14, yMaxDV: 6,
            xStep: 2, yStepPH: 2, yStepDV: 1,
            lineColor: '#6c63ff', markerColor: '#6c63ff',
        },
        theme: 'dark',
        created_at: now,
        updated_at: now,
    });
    setItem(STORAGE_KEYS.SETTINGS, settings);

    // Set current user
    setItem(STORAGE_KEYS.CURRENT_USER, { id, email });

    return { user: { id, email }, error: null };
}

export function signIn(email: string, password: string): { user: { id: string; email: string } | null; error: string | null } {
    const users = getItem<StoredUser[]>(STORAGE_KEYS.USERS, []);
    const found = users.find((u) => u.email === email && u.password === simpleHash(password));

    if (!found) {
        return { user: null, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
    }

    const userInfo = { id: found.id, email: found.email };
    setItem(STORAGE_KEYS.CURRENT_USER, userInfo);
    return { user: userInfo, error: null };
}

export function signOut() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
}

export function getCurrentUser(): { id: string; email: string } | null {
    return getItem<{ id: string; email: string } | null>(STORAGE_KEYS.CURRENT_USER, null);
}

// ═══════════════════════════════════
// Profile Functions
// ═══════════════════════════════════

export function getProfile(userId: string): Profile | null {
    const profiles = getItem<Profile[]>(STORAGE_KEYS.PROFILES, []);
    return profiles.find((p) => p.id === userId) || null;
}

export function updateProfile(userId: string, data: Partial<Profile>): boolean {
    const profiles = getItem<Profile[]>(STORAGE_KEYS.PROFILES, []);
    const idx = profiles.findIndex((p) => p.id === userId);
    if (idx === -1) return false;

    profiles[idx] = {
        ...profiles[idx],
        ...data,
        updated_at: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.PROFILES, profiles);
    return true;
}

// ═══════════════════════════════════
// Settings Functions
// ═══════════════════════════════════

export function getSettings(userId: string): UserSettings | null {
    const settings = getItem<UserSettings[]>(STORAGE_KEYS.SETTINGS, []);
    return settings.find((s) => s.user_id === userId) || null;
}

// ═══════════════════════════════════
// Experiments Functions
// ═══════════════════════════════════

export function getExperiments(userId: string, limit = 20): Experiment[] {
    const experiments = getItem<Experiment[]>(STORAGE_KEYS.EXPERIMENTS, []);
    return experiments
        .filter((e) => e.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
}

export function saveExperiment(data: {
    user_id: string;
    experiment_name: string;
    experiment_no: string;
    volume_data: number[];
    ph_data: number[];
    eq_volume: number | null;
    eq_ph: number | null;
    eq_dph_dv: number | null;
    exp_type: string | null;
    chart_config: ChartConfig;
}): { id: string; error: string | null } {
    const experiments = getItem<Experiment[]>(STORAGE_KEYS.EXPERIMENTS, []);
    const now = new Date().toISOString();
    const id = generateUUID();

    const newExp: Experiment = {
        id,
        user_id: data.user_id,
        experiment_name: data.experiment_name,
        experiment_no: data.experiment_no,
        volume_data: data.volume_data,
        ph_data: data.ph_data,
        eq_volume: data.eq_volume,
        eq_ph: data.eq_ph,
        eq_dph_dv: data.eq_dph_dv,
        exp_type: data.exp_type,
        chart_config: data.chart_config,
        created_at: now,
        updated_at: now,
    };

    experiments.push(newExp);
    setItem(STORAGE_KEYS.EXPERIMENTS, experiments);
    return { id, error: null };
}

export function deleteExperiment(expId: string): boolean {
    const experiments = getItem<Experiment[]>(STORAGE_KEYS.EXPERIMENTS, []);
    const filtered = experiments.filter((e) => e.id !== expId);
    if (filtered.length === experiments.length) return false; // not found
    setItem(STORAGE_KEYS.EXPERIMENTS, filtered);
    return true;
}

// ═══════════════════════════════════
// Admin Functions
// ═══════════════════════════════════

export function isAdmin(userId: string): boolean {
    const admins = getItem<{ user_id: string; role: string }[]>(STORAGE_KEYS.ADMINS, []);
    return admins.some((a) => a.user_id === userId);
}

export function getAllProfiles(): Profile[] {
    return getItem<Profile[]>(STORAGE_KEYS.PROFILES, []);
}

export function getAllExperiments(): Experiment[] {
    return getItem<Experiment[]>(STORAGE_KEYS.EXPERIMENTS, []);
}

// ─── Make first user admin (auto) ───
export function ensureFirstUserIsAdmin() {
    const users = getItem<StoredUser[]>(STORAGE_KEYS.USERS, []);
    const admins = getItem<{ user_id: string; role: string; id: string; created_at: string }[]>(STORAGE_KEYS.ADMINS, []);

    if (users.length > 0 && admins.length === 0) {
        admins.push({
            id: generateUUID(),
            user_id: users[0].id,
            role: 'admin',
            created_at: new Date().toISOString(),
        });
        setItem(STORAGE_KEYS.ADMINS, admins);
    }
}
