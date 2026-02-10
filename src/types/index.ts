// ═══════════════════════════════════════════════════════════
// Types for Titration Graph Generator
// ═══════════════════════════════════════════════════════════

// ─── Data Row (ตาราง Input) ───
export interface DataRow {
    id: string;
    volume: string;
    pH: string;
}

// ─── Experiment Config ───
export interface ExperimentConfig {
    expName: string;
    expNo: string;
    studentName: string;
    xLabel: string;
    yLabel: string;
}

// ─── Chart Config ───
export interface ChartConfig {
    xMax: number;
    yMaxPH: number;
    yMaxDV: number;
    xStep: number;
    yStepPH: number;
    yStepDV: number;
    lineColor: string;
    markerColor: string;
}

// ─── Titration Result ───
export interface TitrationResult {
    volume: number[];
    pH: number[];
    plotVolume: number[];
    deltaPH: number[];
    deltaV: number[];
    dPHdV: number[];
    eqIndex: number;
    eqVol: number;
    eqPH: number;
    eqDPHdV: number;
    expType: string;
}

// ─── Database Types ───
export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    university: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface UserSettings {
    id: string;
    user_id: string;
    default_experiment_name: string;
    default_x_label: string;
    default_y_label: string;
    default_chart_config: ChartConfig;
    theme: 'dark' | 'light';
    created_at: string;
    updated_at: string;
}

export interface Experiment {
    id: string;
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
    created_at: string;
    updated_at: string;
}

// Admin type removed — admin functionality disabled
// ─── Visit (tracking) ───
export interface Visit {
    id: string;
    user_id: string | null;
    email: string | null;
    timestamp: string;
}

// ─── Auth State ───
// ─── Auth State ───
export interface AuthState {
    user: { id: string; email: string } | null;
    profile: Profile | null;
    settings: UserSettings | null;
    isAdmin: boolean;
    loading: boolean;
    experiments: Experiment[];
}

// ─── Tool State ───
export interface ToolState {
    dataRows: DataRow[];
    config: ExperimentConfig;
    chartConfig: ChartConfig;
    result: TitrationResult | null;
    activeTab: 'input' | 'result' | 'report';
    isSaving: boolean;
}

// ─── Default Values ───
export const DEFAULT_CONFIG: ExperimentConfig = {
    expName: 'KHP-STD',
    expNo: 'ครั้งที่1',
    studentName: '',
    xLabel: 'Volume of NaOH (mL)',
    yLabel: 'pH',
};

export const DEFAULT_CHART_CONFIG: ChartConfig = {
    xMax: 10,
    yMaxPH: 14,
    yMaxDV: 6,
    xStep: 2,
    yStepPH: 2,
    yStepDV: 1,
    lineColor: '#6c63ff',
    markerColor: '#6c63ff',
};

export const INITIAL_DATA_ROWS: DataRow[] = [
    { id: '1', volume: '', pH: '' },
    { id: '2', volume: '', pH: '' },
];
