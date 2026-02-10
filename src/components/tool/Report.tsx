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

    const appendDebug = (line: string) => {
        // keep console logs for developer tools, do not render on-screen
        console.log('[Report debug]', line);
    };

    const internalPhRef = useRef<any>(null);
    const internalDvRef = useRef<any>(null);

    const handleExportPDF = async () => {
        const getDataUrlFromRef = (ref: React.RefObject<any>): string | null => {
            try {
                const r = ref?.current;
                if (!r) return null;

                // direct canvas
                if (r instanceof HTMLCanvasElement) return r.toDataURL('image/png', 1.0);

                // chart.js wrappers: try to temporarily force black text colors for export
                const chartInstance = r.chart || (r?.instance || null);
                if (chartInstance && chartInstance.canvas instanceof HTMLCanvasElement) {
                    // backup options and data
                    const originalOptions = JSON.parse(JSON.stringify(chartInstance.options || {}));
                    const originalData = JSON.parse(JSON.stringify(chartInstance.data || {}));
                    try {
                        // set black for title, scales and ticks
                        if (!chartInstance.options) chartInstance.options = {};
                        const o: any = chartInstance.options;
                        if (!o.plugins) o.plugins = {};
                        if (!o.scales) o.scales = {};

                        // title
                        if (!o.plugins.title) o.plugins.title = {};
                        o.plugins.title.color = '#000000';

                        // legend labels
                        if (!o.plugins.legend) o.plugins.legend = {};
                        if (!o.plugins.legend.labels) o.plugins.legend.labels = {};
                        o.plugins.legend.labels.color = '#000000';

                        // prefer a Thai-capable font family during export
                        if (!o.font) o.font = {};
                        o.font.family = "Sarabun, 'Noto Sans Thai', 'Noto Sans', Arial, sans-serif";

                        // scales
                        for (const key of Object.keys(o.scales)) {
                            if (!o.scales[key].ticks) o.scales[key].ticks = {};
                            if (!o.scales[key].title) o.scales[key].title = {};
                            o.scales[key].ticks.color = '#000000';
                            o.scales[key].title.color = '#000000';
                        }

                        // annotation labels (if any)
                        if (o.plugins.annotation && o.plugins.annotation.annotations) {
                            for (const aKey of Object.keys(o.plugins.annotation.annotations)) {
                                const ann = o.plugins.annotation.annotations[aKey];
                                if (ann.label) {
                                    ann.label.color = '#000000';
                                    // make annotation label background transparent for clean export
                                    ann.label.backgroundColor = 'rgba(255,255,255,0)';
                                    ann.label.borderColor = '#000000';
                                    ann.label.borderWidth = 0;
                                }
                            }
                        }

                        // force dataset drawing colors to black for exported image
                        try {
                            if (Array.isArray(chartInstance.data?.datasets)) {
                                for (const ds of chartInstance.data.datasets) {
                                    if (!ds || typeof ds !== 'object') continue;
                                    ds.borderColor = '#000000';
                                    ds.backgroundColor = '#000000';
                                    ds.pointBackgroundColor = '#000000';
                                    ds.pointBorderColor = '#000000';
                                }
                            }
                        } catch (e) {
                            console.warn('Failed to override dataset colors for export', e);
                        }

                        // apply and render immediately
                        if (typeof chartInstance.update === 'function') chartInstance.update();

                        // try Chart.js helper
                        if (typeof r.toBase64Image === 'function') return r.toBase64Image();
                        return chartInstance.canvas.toDataURL('image/png', 1.0);
                    } finally {
                        // restore original options and data
                        try {
                            chartInstance.options = originalOptions;
                            // restore datasets/data
                            if (originalData) chartInstance.data = originalData;
                            if (typeof chartInstance.update === 'function') chartInstance.update();
                        } catch (e) {
                            console.warn('Failed to restore chart state after export', e);
                        }
                    }
                }

                if (r.canvas && r.canvas instanceof HTMLCanvasElement) return r.canvas.toDataURL('image/png', 1.0);

                // Chart.js instance helper
                if (typeof r.toBase64Image === 'function') return r.toBase64Image();

                // container node
                const container = r.container || r.node || r.el || r.canvas?.parentNode;
                const canvas = container?.querySelector?.('canvas') as HTMLCanvasElement | null;
                if (canvas) return canvas.toDataURL('image/png', 1.0);

                return null;
            } catch (e) {
                console.error('getDataUrlFromRef error', e);
                return null;
            }
        };

        // Try multiple sources for chart images
        // If hidden/chart refs exist, ensure they're updated and rendered before capture
        const forceUpdateChart = async (ref: React.RefObject<any>) => {
            try {
                const r = ref?.current;
                const chartInstance = r?.chart || r?.instance || null;
                if (chartInstance && typeof chartInstance.update === 'function') {
                    chartInstance.update();
                    // wait one animation frame for Chart.js to complete rendering
                    await new Promise((res) => requestAnimationFrame(() => res(undefined)));
                }
            } catch (e) {
                // ignore
            }
        };

        await forceUpdateChart(internalPhRef);
        await forceUpdateChart(internalDvRef);

        let phDataUrl = getDataUrlFromRef(phChartRef) || getDataUrlFromRef(internalPhRef);
        let dvDataUrl = getDataUrlFromRef(dvChartRef) || getDataUrlFromRef(internalDvRef);
        appendDebug(`phDataUrl found: ${!!phDataUrl}; dvDataUrl found: ${!!dvDataUrl}`);

        // DOM fallbacks (visible charts and hidden fallback charts)
        try {
            if (!phDataUrl) {
                const c = document.querySelector('[data-chart="ph"] canvas') as HTMLCanvasElement | null;
                if (c) phDataUrl = c.toDataURL('image/png', 1.0);
            }
            if (!dvDataUrl) {
                const c2 = document.querySelector('[data-chart="dv"] canvas') as HTMLCanvasElement | null;
                if (c2) dvDataUrl = c2.toDataURL('image/png', 1.0);
            }

            // check hidden copies rendered specifically for export
            if (!phDataUrl) {
                const hc = document.querySelector('[data-chart-hidden="ph"] canvas') as HTMLCanvasElement | null;
                if (hc) phDataUrl = hc.toDataURL('image/png', 1.0);
            }
            if (!dvDataUrl) {
                const hc2 = document.querySelector('[data-chart-hidden="dv"] canvas') as HTMLCanvasElement | null;
                if (hc2) dvDataUrl = hc2.toDataURL('image/png', 1.0);
            }
        } catch (e) {
            console.error('DOM fallback error', e);
        }

        if (!phDataUrl || !dvDataUrl) {
            const details = { phDataUrl: !!phDataUrl, dvDataUrl: !!dvDataUrl, phRef: phChartRef?.current, dvRef: dvChartRef?.current };
            console.error('handleExportPDF: image data not found', details);
            appendDebug(`image data missing: ${JSON.stringify(details)}`);
            toast.error('ไม่สามารถสร้าง PDF ได้ — ไม่พบภาพกราฟ');
            return;
        }

        try {
            setExporting(true);
            appendDebug('Importing PDF generator...');
            const { exportPDF } = await import('@/core/pdfGenerator');
            appendDebug('Calling exportPDF()');
            await exportPDF(
                result,
                config,
                chartConfig,
                {
                    full_name: profile?.full_name || config.studentName || '',
                    university: profile?.university || '',
                },
                phDataUrl,
                dvDataUrl
            );
            appendDebug('exportPDF() completed');
            toast.success('📄 ส่งออก PDF สำเร็จ!');
        } catch (error) {
            console.error('PDF export error:', error);
            appendDebug(`export error: ${error instanceof Error ? error.message : String(error)}`);
            if ((error as any)?.stack) appendDebug((error as any).stack);
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
                    {/* Debug helper removed in production */}

                    <Button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary-500/80"
                        aria-label="ส่งออก PDF"
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
                        {exporting ? 'กำลังส่งออก…' : 'ส่งออก PDF'}
                    </Button>
                </div>
            </div>

            {/* debug output removed from UI; logs still go to console */}

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
            <div id="report-hidden" style={{ position: 'absolute', left: -9999, top: -9999, width: 800, height: 600, overflow: 'hidden' }} aria-hidden>
                <div data-chart-hidden="ph">
                    <PHChart ref={internalPhRef} result={result} chartConfig={chartConfig} expConfig={config} />
                </div>
                <div data-chart-hidden="dv">
                    <DerivativeChart ref={internalDvRef} result={result} chartConfig={chartConfig} expConfig={config} />
                </div>
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
