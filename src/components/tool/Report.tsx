'use client';

import React from 'react';
import { FileDown, Download } from 'lucide-react';
import type { TitrationResult, ExperimentConfig, ChartConfig } from '@/types';
import { useAuthStore } from '@/stores/useAuthStore';
import { downloadChartAsPNG } from '@/lib/exportChart';
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

    const handleExportPDF = async () => {
        const phCanvas = phChartRef.current?.canvas;
        const dvCanvas = dvChartRef.current?.canvas;

        if (!phCanvas || !dvCanvas) {
            toast.error('ไม่สามารถสร้าง PDF ได้');
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
            toast.error('เกิดข้อผิดพลาดในการสร้าง PDF');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">📍 สรุปผลการทดลอง</h3>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => {
                            const ok = downloadChartAsPNG(phChartRef, `${config.expName || 'ph-chart'}.png`);
                            if (ok) toast.success('ดาวน์โหลดกราฟ pH สำเร็จ');
                            else toast.error('ไม่สามารถดาวน์โหลดกราฟ pH ได้');
                        }}
                        className="flex items-center gap-2"
                        aria-label="Download pH PNG"
                    >
                        <FileDown className="h-4 w-4" aria-hidden="true" />
                        pH PNG
                    </Button>

                    <Button
                        onClick={() => {
                            const ok = downloadChartAsPNG(dvChartRef, `${config.expName || 'dv-chart'}.png`);
                            if (ok) toast.success('ดาวน์โหลดกราฟ ΔpH/ΔV สำเร็จ');
                            else toast.error('ไม่สามารถดาวน์โหลดกราฟ ΔpH/ΔV ได้');
                        }}
                        className="flex items-center gap-2"
                        aria-label="Download ΔpH/ΔV PNG"
                    >
                        <FileDown className="h-4 w-4" aria-hidden="true" />
                        ΔpH/ΔV PNG
                    </Button>

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
