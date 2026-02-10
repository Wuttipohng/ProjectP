import { create } from 'zustand';
import type {
    DataRow,
    ExperimentConfig,
    ChartConfig,
    TitrationResult,
    ToolState,
    Experiment,
    DEFAULT_CONFIG,
    DEFAULT_CHART_CONFIG,
    INITIAL_DATA_ROWS
} from '@/types';
import { generateId } from '@/lib/utils';

interface ToolStore extends ToolState {
    // Row Actions
    addRow: () => void;
    removeRow: (id: string) => void;
    updateRow: (id: string, field: 'volume' | 'pH', value: string) => void;
    clearAllRows: () => void;
    setDataRows: (rows: DataRow[]) => void;

    // Get Valid Data
    getValidData: () => { volume: number[]; pH: number[] } | null;

    // Config Actions
    setConfig: (config: Partial<ExperimentConfig>) => void;
    setChartConfig: (config: Partial<ChartConfig>) => void;
    setResult: (result: TitrationResult | null) => void;
    setActiveTab: (tab: 'input' | 'result' | 'report') => void;
    setIsSaving: (saving: boolean) => void;

    // Load Experiment
    loadExperiment: (exp: Experiment) => void;

    // Reset
    reset: () => void;
}

const defaultConfig: ExperimentConfig = {
    expName: 'KHP-STD',
    expNo: 'ครั้งที่1',
    studentName: '',
    xLabel: 'Volume of NaOH (mL)',
    yLabel: 'pH',
};

const defaultChartConfig: ChartConfig = {
    xMax: 10,
    yMaxPH: 14,
    yMaxDV: 6,
    xStep: 2,
    yStepPH: 2,
    yStepDV: 1,
    lineColor: '#33b8ff',
    markerColor: '#33b8ff',
};

const initialDataRows: DataRow[] = [
    { id: generateId(), volume: '', pH: '' },
    { id: generateId(), volume: '', pH: '' },
];

const initialState: ToolState = {
    dataRows: initialDataRows,
    config: defaultConfig,
    chartConfig: defaultChartConfig,
    result: null,
    activeTab: 'input',
    isSaving: false,
};

export const useToolStore = create<ToolStore>((set, get) => ({
    ...initialState,

    addRow: () => {
        set((state) => ({
            dataRows: [...state.dataRows, { id: generateId(), volume: '', pH: '' }],
        }));
    },

    removeRow: (id) => {
        set((state) => {
            if (state.dataRows.length <= 1) return state;
            return {
                dataRows: state.dataRows.filter((row) => row.id !== id),
            };
        });
    },

    updateRow: (id, field, value) => {
        set((state) => ({
            dataRows: state.dataRows.map((row) =>
                row.id === id ? { ...row, [field]: value } : row
            ),
        }));
    },

    clearAllRows: () => {
        set({
            dataRows: [
                { id: generateId(), volume: '', pH: '' },
                { id: generateId(), volume: '', pH: '' },
            ],
            result: null,
        });
    },

    setDataRows: (rows) => {
        set({ dataRows: rows });
    },

    getValidData: () => {
        const { dataRows } = get();
        const validRows = dataRows.filter(
            (r) =>
                r.volume.trim() !== '' &&
                r.pH.trim() !== '' &&
                !isNaN(Number(r.volume)) &&
                !isNaN(Number(r.pH))
        );

        if (validRows.length < 2) return null;

        return {
            volume: validRows.map((r) => Number(r.volume)),
            pH: validRows.map((r) => Number(r.pH)),
        };
    },

    setConfig: (config) => {
        set((state) => ({
            config: { ...state.config, ...config },
        }));
    },

    setChartConfig: (config) => {
        set((state) => ({
            chartConfig: { ...state.chartConfig, ...config },
        }));
    },

    setResult: (result) => set({ result }),

    setActiveTab: (activeTab) => set({ activeTab }),

    setIsSaving: (isSaving) => set({ isSaving }),

    loadExperiment: (exp) => {
        const dataRows: DataRow[] = exp.volume_data.map((vol, i) => ({
            id: generateId(),
            volume: vol.toString(),
            pH: exp.ph_data[i].toString(),
        }));

        set({
            dataRows,
                config: {
                    expName: exp.experiment_name,
                    expNo: exp.experiment_no,
                    studentName: get().config.studentName,
                    xLabel: (exp.chart_config as any)?.xLabel || 'Volume of NaOH (mL)',
                    yLabel: (exp.chart_config as any)?.yLabel || 'pH',
                },
            chartConfig: exp.chart_config || defaultChartConfig,
            result: null,
            activeTab: 'input',
        });
    },

    reset: () => set(initialState),
}));
