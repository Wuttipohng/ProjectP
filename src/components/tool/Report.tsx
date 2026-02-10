'use client';

import React from 'react';
import { FileDown } from 'lucide-react';
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

    const appendDebug = (line: string) => {
        // keep console logs for developer tools, do not render on-screen
        console.log('[Report debug]', line);
    };

    const internalPhRef = useRef<any>(null);
    const internalDvRef = useRef<any>(null);
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
                        {/* Export moved to ResultTable */}
                        <span className="text-sm text-gray-400">PDF export is available below the calculation table</span>
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
