'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calculator, BarChart3, FileText, Settings, Save } from 'lucide-react';
import { useToolStore } from '@/stores/useToolStore';
import { useAuthStore } from '@/stores/useAuthStore';
// ...existing code...
import { calculateTitration } from '@/core/titration';
import { cn } from '@/lib/utils';
import DataTable from '@/components/tool/DataTable';
import PHChart from '@/components/charts/PHChart';
import DerivativeChart from '@/components/charts/DerivativeChart';
import ResultTable from '@/components/tool/ResultTable';
import Report from '@/components/tool/Report';
import ExperimentHistory from '@/components/tool/ExperimentHistory';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import toast from 'react-hot-toast';

export default function ToolPage() {
    const router = useRouter();
    const phChartRef = useRef<any>(null);
    const dvChartRef = useRef<any>(null);

    const { user, profile, fetchExperiments } = useAuthStore();

    // Redirect if not logged in
    useEffect(() => {
        if (!user && typeof window !== 'undefined') {
// ...existing code...
            if (!getCurrentUser()) router.push('/login');
        }
    }, [user, router]);

    const {
        dataRows,
        config,
        chartConfig,
        result,
        activeTab,
        isSaving,
        getValidData,
        setConfig,
        setChartConfig,
        setResult,
        setActiveTab,
        setIsSaving,
    } = useToolStore();

    const [showSettings, setShowSettings] = useState(false);

    // คำนวณ
    const handleCalculate = async () => {
        const data = getValidData();
        if (!data) {
            toast.error('ต้องมีข้อมูลอย่างน้อย 2 จุด');
            return;
        }

        const calcResult = calculateTitration(data.volume, data.pH);
        if (!calcResult) {
            toast.error('ไม่สามารถคำนวณได้');
            return;
        }

        setResult(calcResult);

        // Auto-adjust chart config
        const maxVol = Math.max(...data.volume);
        const maxDPHdV = Math.max(...calcResult.dPHdV);
        setChartConfig({
            xMax: Math.ceil(maxVol / 2) * 2 + 2,
            yMaxDV: Math.ceil(maxDPHdV) + 1,
        });

        setActiveTab('result');
        toast.success('คำนวณสำเร็จ!');

        // Auto-save to database
        if (user) {
            setIsSaving(true);

            const { error } = saveExperiment({
                user_id: user.id,
                experiment_name: config.expName,
                experiment_no: config.expNo,
                volume_data: data.volume,
                ph_data: data.pH,
                eq_volume: calcResult.eqVol,
                eq_ph: calcResult.eqPH,
                eq_dph_dv: calcResult.eqDPHdV,
                exp_type: calcResult.expType,
                chart_config: chartConfig,
            });

            if (error) {
                console.error('Save error:', error);
            } else {
                await fetchExperiments();
            }
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'input', label: 'ข้อมูล', icon: Calculator },
        { id: 'result', label: 'ผลลัพธ์', icon: BarChart3, disabled: !result },
        { id: 'report', label: 'รายงาน', icon: FileText, disabled: !result },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        🧪 Titration Graph Generator
                    </h1>
                    <p className="text-gray-400 mt-1">
                        ใส่ข้อมูล Volume และ pH แล้วกดคำนวณ
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowSettings(!showSettings)}
                    >
                        <Settings className="h-4 w-4 mr-1" />
                        ตั้งค่า
                    </Button>
                    <Button onClick={handleCalculate} loading={isSaving}>
                        <Calculator className="h-4 w-4 mr-1" />
                        คำนวณ
                    </Button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <Card className="mb-6 animate-slide-up">
                    <h3 className="text-lg font-semibold text-white mb-4">⚙️ ตั้งค่าการทดลอง</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Input
                            label="ชื่อการทดลอง"
                            value={config.expName}
                            onChange={(e) => setConfig({ expName: e.target.value })}
                            placeholder="KHP-STD"
                        />
                        <Input
                            label="ครั้งที่"
                            value={config.expNo}
                            onChange={(e) => setConfig({ expNo: e.target.value })}
                            placeholder="ครั้งที่1"
                        />
                        <Input
                            label="ชื่อผู้ทดลอง"
                            value={config.studentName}
                            onChange={(e) => setConfig({ studentName: e.target.value })}
                            placeholder={profile?.full_name || 'ชื่อ นามสกุล'}
                        />
                        <Input
                            label="แกน X"
                            value={config.xLabel}
                            onChange={(e) => setConfig({ xLabel: e.target.value })}
                            placeholder="Volume of NaOH (mL)"
                        />
                    </div>

                    <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
                        <Input
                            label="X Max"
                            type="number"
                            value={chartConfig.xMax}
                            onChange={(e) => setChartConfig({ xMax: Number(e.target.value) })}
                        />
                        <Input
                            label="Y Max (pH)"
                            type="number"
                            value={chartConfig.yMaxPH}
                            onChange={(e) => setChartConfig({ yMaxPH: Number(e.target.value) })}
                        />
                        <Input
                            label="Y Max (ΔpH/ΔV)"
                            type="number"
                            value={chartConfig.yMaxDV}
                            onChange={(e) => setChartConfig({ yMaxDV: Number(e.target.value) })}
                        />
                        <Input
                            label="X Step"
                            type="number"
                            value={chartConfig.xStep}
                            onChange={(e) => setChartConfig({ xStep: Number(e.target.value) })}
                        />
                        <Input
                            label="สีเส้น"
                            type="color"
                            value={chartConfig.lineColor}
                            onChange={(e) => setChartConfig({ lineColor: e.target.value })}
                            className="h-[42px]"
                        />
                        <Input
                            label="สีจุด"
                            type="color"
                            value={chartConfig.markerColor}
                            onChange={(e) => setChartConfig({ markerColor: e.target.value })}
                            className="h-[42px]"
                        />
                    </div>
                </Card>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Data Input & History */}
                <div className="lg:col-span-1 space-y-6">
                    <DataTable />
                    <ExperimentHistory />
                </div>

                {/* Right Column - Results */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs */}
                    <div className="flex border-b border-dark-600">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
                                disabled={tab.disabled}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-3 border-b-2 transition-all',
                                    activeTab === tab.id
                                        ? 'border-primary-500 text-primary-400'
                                        : 'border-transparent text-gray-400 hover:text-white',
                                    tab.disabled && 'opacity-50 cursor-not-allowed'
                                )}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'input' && (
                        <div className="text-center py-12 text-gray-400">
                            <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">กรอกข้อมูลทางซ้าย แล้วกดปุ่ม "คำนวณ"</p>
                            <p className="text-sm mt-2">
                                หรือ copy จาก Excel แล้ว paste ที่ตาราง
                            </p>
                        </div>
                    )}

                    {activeTab === 'result' && result && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid md:grid-cols-2 gap-6">
                                <PHChart
                                    ref={phChartRef}
                                    result={result}
                                    chartConfig={chartConfig}
                                    expConfig={config}
                                />
                                <DerivativeChart
                                    ref={dvChartRef}
                                    result={result}
                                    chartConfig={chartConfig}
                                    expConfig={config}
                                />
                            </div>
                            <ResultTable result={result} />
                        </div>
                    )}

                    {activeTab === 'report' && result && (
                        <div className="animate-fade-in">
                            <Report
                                result={result}
                                config={config}
                                chartConfig={chartConfig}
                                phChartRef={phChartRef}
                                dvChartRef={dvChartRef}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
