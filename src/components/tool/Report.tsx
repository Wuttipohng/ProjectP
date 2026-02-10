'use client';

import React from 'react';
import { FileDown, Download } from 'lucide-react';
import type { TitrationResult, ExperimentConfig, ChartConfig } from '@/types';
import { useAuthStore } from '@/stores/useAuthStore';
import { getCanvasFromRef, downloadChartAsPNG } from '@/lib/exportChart';
import dynamic from 'next/dynamic';
import { useRef } from 'react';

const PHChart = dynamic(() => import('@/components/charts/PHChart'), { ssr: false });
const DerivativeChart = dynamic(() => import('@/components/charts/DerivativeChart'), { ssr: false });
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface ReportProps {
    result: TitrationResult;
    config: ExperimentConfig;
    chartConfig: ChartConfig;
    phChartRef: React.RefObject<any>;
    dvChartRef: React.RefObject<any>;
}

export default function Report({ result, config, chartConfig, phChartRef, dvChartRef }: ReportProps) {
    const { profile } = useAuthStore();
    const [exporting, setExporting] = useState(false);
    const [debugText, setDebugText] = useState('');

    const internalPhRef = useRef<any>(null);
    const internalDvRef = useRef<any>(null);

    const handleExportPDF = async () => {
        // Prefer canvas from refs passed from page, otherwise use internal hidden charts
        let phCanvas = getCanvasFromRef(phChartRef);
        let dvCanvas = getCanvasFromRef(dvChartRef);
        if (!phCanvas) phCanvas = getCanvasFromRef(internalPhRef);
        if (!dvCanvas) dvCanvas = getCanvasFromRef(internalDvRef);

        // Final fallback: query the DOM for canvases inside chart containers
        if (!phCanvas) {
            phCanvas = document.querySelector('[data-chart="ph"] canvas') as HTMLCanvasElement | null;
        }
        if (!dvCanvas) {
            dvCanvas = document.querySelector('[data-chart="dv"] canvas') as HTMLCanvasElement | null;
        }

        if (!phCanvas || !dvCanvas) {
            console.error('handleExportPDF: canvas not found', { phCanvas, dvCanvas, phRef: phChartRef?.current, dvRef: dvChartRef?.current });
            toast.error('ไม่สามารถสร้าง PDF ได้ — ไม่พบ canvas ของกราฟ');
            return;
        }

        try {
            setExporting(true);
            const { exportPDF } = await import('@/core/pdfGenerator');
            await exportPDF(
                result,
                config,
                chartConfig,
                {
                    full_name: profile?.full_name || config.studentName || '',
                    university: profile?.university || '',
                },
                phCanvas,
                dvCanvas
            );
            toast.success('📄 Export PDF สำเร็จ!');
        } catch (error) {
            console.error('PDF export error:', error);
            toast.error('เกิดข้อผิดพลาดในการสร้าง PDF — ดูคอนโซลสำหรับรายละเอียด');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">📍 สรุปผลการทดลอง</h3>

                <div className="flex items-center gap-2">
                    {/* Debug helper (temporary) */}
                    <button
                        type="button"
                        className="px-2 py-1 bg-yellow-500 text-black rounded text-sm"
                        onClick={() => {
                            try {
                                // expose refs for manual inspection
                                (window as any)._phRef = phChartRef.current;
                                (window as any)._dvRef = dvChartRef.current;
                                console.log('exposed refs to window._phRef and window._dvRef', phChartRef.current, dvChartRef.current);

                                const phCanvas = getCanvasFromRef(phChartRef);
                                const dvCanvas = getCanvasFromRef(dvChartRef);
                                console.log('getCanvasFromRef ->', { phCanvas, dvCanvas });

                                if (phCanvas) {
                                    const ok = downloadChartAsPNG(phChartRef, `${config.expName || 'ph-chart'}-debug.png`);
                                    console.log('downloadChartAsPNG ph ->', ok);
                                } else console.warn('phCanvas not found');

                                if (dvCanvas) {
                                    const ok2 = downloadChartAsPNG(dvChartRef, `${config.expName || 'dv-chart'}-debug.png`);
                                    console.log('downloadChartAsPNG dv ->', ok2);
                                } else console.warn('dvCanvas not found');
                            } catch (e) {
                                console.error('Debug button error', e);
                            }
                        }}
                    >
                        Debug
                    </button>

                    <Button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary-500/80"
                        aria-label="Export PDF"
                        disabled={exporting}
                    >
                        {exporting ? (
                            <svg className="-ml-1 mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                <style>{`@media (prefers-reduced-motion: reduce) {.animate-spin {animation: none !important;}}`}</style>
                            </svg>
                        ) : (
                            <Download className="h-4 w-4" aria-hidden="true" />
                        )}
                        {exporting ? 'กำลังส่งออก…' : 'Export PDF'}
                    </Button>
                </div>
            </div>

            {debugText && (
                <pre className="mt-4 p-3 bg-black text-white rounded text-sm whitespace-pre-wrap overflow-auto">{debugText}</pre>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                {/* End Point Info */}
                <div className="space-y-4">
                    <div className="p-4 bg-dark-700 rounded-lg border border-dark-600">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">End Point (กราฟ pH)</h4>
                        <div className="space-y-1">
                            <p className="text-white">Volume = <span className="text-primary-400 font-bold">{result.eqVol.toFixed(2)}</span> mL</p>
                            <p className="text-white">pH = <span className="text-primary-400 font-bold">{result.eqPH.toFixed(2)}</span></p>
                        </div>
                    </div>

                    <div className="p-4 bg-dark-700 rounded-lg border border-dark-600">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">End Point (กราฟ ΔpH/ΔV)</h4>
                        <div className="space-y-1">
                            <p className="text-white">Volume = <span className="text-purple-400 font-bold">{result.eqVol.toFixed(2)}</span> mL</p>
                            <p className="text-white">ΔpH/ΔV = <span className="text-purple-400 font-bold">{result.eqDPHdV.toFixed(2)}</span></p>
                        </div>
                    </div>
                </div>

                {/* Experiment Type & Stats */}
                <div className="space-y-4">
                    <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                        <h4 className="text-sm font-medium text-primary-300 mb-2">ประเภทการไทเทรชัน</h4>
                        <p className="text-xl font-bold text-white">{result.expType}</p>
                    </div>

                    <div className="p-4 bg-dark-700 rounded-lg border border-dark-600">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">สถิติข้อมูล</h4>
                        <div className="space-y-1 text-sm">
                            <p className="text-gray-300">จำนวนจุดข้อมูล: <span className="text-white font-medium">{result.volume.length}</span> จุด</p>
                            <p className="text-gray-300">ช่วง Volume: <span className="text-white font-medium">{result.volume[0].toFixed(2)} - {result.volume[result.volume.length - 1].toFixed(2)}</span> mL</p>
                            <p className="text-gray-300">ช่วง pH: <span className="text-white font-medium">{Math.min(...result.pH).toFixed(2)} - {Math.max(...result.pH).toFixed(2)}</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden chart instances for export (mounted off-screen) */}
            <div style={{ position: 'absolute', left: -9999, top: -9999, width: 800, height: 600, overflow: 'hidden' }} aria-hidden>
                <PHChart ref={internalPhRef} result={result} chartConfig={chartConfig} expConfig={config} />
                <DerivativeChart ref={internalDvRef} result={result} chartConfig={chartConfig} expConfig={config} />
            </div>

            {/* Experiment Info */}
            <div className="mt-6 p-4 bg-dark-700 rounded-lg border border-dark-600">
                <h4 className="text-sm font-medium text-gray-400 mb-2">ข้อมูลการทดลอง</h4>
                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                    <p className="text-gray-300">การทดลอง: <span className="text-white font-medium">{config.expName} {config.expNo}</span></p>
                    <p className="text-gray-300">ผู้ทดลอง: <span className="text-white font-medium">{config.studentName || profile?.full_name || '-'}</span></p>
                    <p className="text-gray-300">มหาวิทยาลัย: <span className="text-white font-medium">{profile?.university || '-'}</span></p>
                    <p className="text-gray-300">วันที่: <span className="text-white font-medium">{new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                </div>
            </div>
        </div>
    );
}
