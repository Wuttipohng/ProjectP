import { create } from 'zustand';
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
        set({ loading: false });
    },

    fetchProfile: async () => {
        // disabled
        return;
    },

    fetchSettings: async () => {
        // disabled
        return;
    },

    fetchExperiments: async () => {
        // disabled
        return;
    },

    deleteExperiment: async (expId: string) => {
        // disabled
        return false;
    },

    checkAdmin: async () => {
        // disabled
        return;
    },

    updateProfile: async (data) => {
        // disabled
        return;
    },

    logout: async () => {
        // disabled: just reset state
        get().reset();
    },

    reset: () => set(initialState),
}));
