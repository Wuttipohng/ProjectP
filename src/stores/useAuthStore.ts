import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import {
    getCurrentUser,
    getProfile,
    getSettings,
    getExperiments,
    ensureFirstUserIsAdmin,
    isAdmin as dbIsAdmin,
    updateProfile as dbUpdateProfile,
    signOut,
} from '@/lib/local-db';
import type { AuthState, Profile, UserSettings, Experiment } from '@/types';

interface AuthStore extends AuthState {
    // Actions
    setUser: (user: { id: string; email: string } | null) => void;
    setProfile: (profile: Profile | null) => void;
    setSettings: (settings: UserSettings | null) => void;
    setExperiments: (experiments: Experiment[]) => void;
    setIsAdmin: (isAdmin: boolean) => void;
    setLoading: (loading: boolean) => void;

    // Async Actions
    initialize: () => void;
    fetchProfile: () => Promise<void>;
    fetchSettings: () => Promise<void>;
    fetchExperiments: () => Promise<void>;
    checkAdmin: () => Promise<void>;
    updateProfile: (data: Partial<Profile>) => Promise<void>;
    deleteExperiment: (expId: string) => Promise<boolean>;
    logout: () => Promise<void>;
    reset: () => void;
}

const initialState: AuthState = {
    user: null,
    profile: null,
    settings: null,
    isAdmin: false,
    loading: true,
    experiments: [],
};

export const useAuthStore = create<AuthStore>((set, get) => ({
    ...initialState,

    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    setSettings: (settings) => set({ settings }),
    setExperiments: (experiments) => set({ experiments }),
    setIsAdmin: (isAdmin) => set({ isAdmin }),
    setLoading: (loading) => set({ loading }),

    initialize: () => {
        const user = getCurrentUser();
        if (user) {
            set({ user });
            get().fetchProfile();
            get().fetchSettings();
            get().fetchExperiments();
            get().checkAdmin();
        }
        set({ loading: false });
    },

    fetchProfile: async () => {
        const { user } = get();
        if (!user) return;
        const profile = getProfile(user.id);
        if (profile) set({ profile });
    },

    fetchSettings: async () => {
        const { user } = get();
        if (!user) return;
        const settings = getSettings(user.id);
        if (settings) set({ settings });
    },

    fetchExperiments: async () => {
        const { user } = get();
        if (!user) return;
        // Prefer Supabase when available, fall back to local-db
        try {
            const supabase = createClient();
            const { data, error } = await supabase.from('experiments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100);
            if (!error && data) {
                set({ experiments: data as any });
                return;
            }
        } catch (e) {
            // ignore and fallback
        }

        const experiments = getExperiments(user.id);
        set({ experiments });
    },

    deleteExperiment: async (expId: string) => {
        const { user } = get();
        if (!user) return false;

        // Try Supabase delete
        try {
            const supabase = createClient();
            const { error } = await supabase.from('experiments').delete().eq('id', expId);
            if (!error) {
                // refresh list
                await get().fetchExperiments();
                return true;
            }
        } catch (e) {
            // ignore
        }

        // Final fallback: call deleteExperiment from local-db directly
        try {
            const { deleteExperiment: localDelete } = await import('@/lib/local-db');
            const ok = localDelete(expId);
            if (ok) {
                await get().fetchExperiments();
                return true;
            }
        } catch (e) {
            // ignore
        }

        return false;
    },

    checkAdmin: async () => {
        const { user } = get();
        if (!user) return;
        ensureFirstUserIsAdmin();
        set({ isAdmin: dbIsAdmin(user.id) });
    },

    updateProfile: async (data) => {
        const { user, profile } = get();
        if (!user || !profile) return;
        dbUpdateProfile(user.id, data);
        set({ profile: { ...profile, ...data, updated_at: new Date().toISOString() } });
    },

    logout: async () => {
        signOut();
        get().reset();
    },

    reset: () => set(initialState),
}));
