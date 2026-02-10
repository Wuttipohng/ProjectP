'use client';

import React, { useEffect, useState } from 'react';
import type { TitrationResult } from '@/types';
import { cn } from '@/lib/utils';
import { calculateTitration } from '@/core/titration';
import { createClient } from '@/lib/supabase/client';
import { saveExperiment as localSaveExperiment } from '@/lib/local-db';
import { useAuthStore } from '@/stores/useAuthStore';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { useToolStore } from '@/stores/useToolStore';

interface ResultTableProps {
    result: TitrationResult;
}

export default function ResultTable({ result }: ResultTableProps) {
    const { setDataRows, config, chartConfig, setResult } = useToolStore();
    const { user } = useAuthStore();
    const [saving, setSaving] = useState(false);
    // Keep editable copies of volume, pH and deltas
    const [volumes, setVolumes] = useState<number[]>(result.volume.slice());
    const [phValues, setPhValues] = useState<number[]>(result.pH.slice());
    const [deltaPH, setDeltaPH] = useState<number[]>(result.deltaPH.slice());
    const [deltaV, setDeltaV] = useState<number[]>(result.deltaV.slice());

    

    useEffect(() => {
        setVolumes(result.volume.slice());
        setPhValues(result.pH.slice());
        setDeltaPH(result.deltaPH.slice());
        setDeltaV(result.deltaV.slice());
    }, [result]);

    const recomputeFromVolumes = (newVolumes: number[], newPH: number[]) => {
        const n = newVolumes.length;
        const newDeltaPH: number[] = [];
        const newDeltaV: number[] = [];
        const dPHdV: number[] = [];
        const plotVolume: number[] = [];

        for (let i = 0; i < n - 1; i++) {
            const dPH = (newPH[i + 1] ?? 0) - (newPH[i] ?? 0);
            const dV = (newVolumes[i + 1] ?? 0) - (newVolumes[i] ?? 0);
            newDeltaPH.push(dPH);
            newDeltaV.push(dV);
            dPHdV.push(dV !== 0 ? dPH / dV : 0);
            plotVolume.push(newVolumes[i + 1] ?? 0);
        }

        // endpoint
        let maxDPHdV = dPHdV[0] ?? 0;
        let eqIndex = 0;
        for (let i = 1; i < dPHdV.length; i++) {
            if (dPHdV[i] > maxDPHdV) {
                maxDPHdV = dPHdV[i];
                eqIndex = i;
            }
        }

        const eqVol = plotVolume[eqIndex] ?? 0;
        const eqPH = newPH[eqIndex + 1] ?? 0;
        const eqDPHdV = maxDPHdV;

        let expType = result.expType || '';
        if (eqPH > 8) expType = 'Strong Base + Weak Acid';
        else if (eqPH < 6) expType = 'Strong Acid + Weak Base';
        else expType = 'Strong Acid + Strong Base';

        const newResult: TitrationResult = {
            ...result,
            volume: newVolumes.slice(),
            pH: newPH.slice(),
            deltaPH: newDeltaPH.slice(),
            deltaV: newDeltaV.slice(),
            dPHdV,
            plotVolume,
            eqIndex,
            eqVol,
            eqPH,
            eqDPHdV,
            expType,
        };

        setDeltaPH(newDeltaPH);
        setDeltaV(newDeltaV);
        setResult(newResult);
    };

    const validateVolumes = (arr: number[]) => {
        for (let i = 1; i < arr.length; i++) {
            if (arr[i] < arr[i - 1]) return false;
        }
        return true;
    };

    const canApply = () => {
        // volumes must be non-negative and non-decreasing, pH 0-14
        if (!validateVolumes(volumes)) return false;
        for (const v of volumes) if (v < 0 || !Number.isFinite(v)) return false;
        for (const p of phValues) if (p < 0 || p > 14 || !Number.isFinite(p)) return false;
        return true;
    };

    const applyManualOverrides = async (saveAsExperiment = false) => {
        if (!canApply()) {
            toast.error('ข้อมูลไม่ถูกต้อง: ตรวจสอบ Volume หรือ pH');
            return;
        }

        // Sync back to DataTable
        const dataRows = volumes.map((v, i) => ({ id: String(i + 1), volume: String(v), pH: String(phValues[i]) }));
        setDataRows(dataRows);
        toast.success('Applied overrides to input table');

        if (!saveAsExperiment) return;

        // Save to DB: prefer Supabase if logged in
        try {
            if (user) {
                const supabase = createClient();
                const payload = {
                    user_id: user.id,
                    experiment_name: config.expName,
                    experiment_no: config.expNo,
                    volume_data: volumes,
                    ph_data: phValues,
                    eq_volume: result.eqVol,
                    eq_ph: result.eqPH,
                    eq_dph_dv: result.eqDPHdV,
                    exp_type: result.expType,
                    chart_config: chartConfig,
                };
                const { error } = await supabase.from('experiments').insert([payload]);
                if (error) throw error;
                toast.success('Saved experiment to Supabase');
                // refresh user's experiments list if store has method
                const { fetchExperiments } = useAuthStore.getState();
                if (fetchExperiments) await fetchExperiments();
                return;
            }
        } catch (e) {
            // fallthrough to local save
            console.error('Supabase save failed', e);
        }

        try {
            const { id } = localSaveExperiment({
                user_id: user?.id || 'local',
                experiment_name: config.expName,
                experiment_no: config.expNo,
                volume_data: volumes,
                ph_data: phValues,
                eq_volume: result.eqVol,
                eq_ph: result.eqPH,
                eq_dph_dv: result.eqDPHdV,
                exp_type: result.expType,
                chart_config: chartConfig,
            } as any);
            if (id) toast.success('Saved experiment locally');
        } catch (e) {
            toast.error('Failed to save experiment');
        }
    };

    return (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 overflow-x-auto focus-visible:ring-2 focus-visible:ring-primary-500/80" tabIndex={0}>
            <h3 className="text-lg font-semibold text-white mb-4">📊 ตารางผลการคำนวณ</h3>

            <table className="w-full border-collapse min-w-[600px]" aria-live="polite">
                <caption className="sr-only">ผลการคำนวณไทเทรต</caption>
                <thead>
                    <tr>
                        <th className="bg-primary-500/20 border border-dark-600 px-3 py-2 text-sm font-semibold text-primary-300">{config?.xLabel || 'Volume (mL)'}</th>
                        <th className="bg-primary-500/20 border border-dark-600 px-3 py-2 text-sm font-semibold text-primary-300">{config?.yLabel || 'pH'}</th>
                        <th className="bg-primary-500/20 border border-dark-600 px-3 py-2 text-sm font-semibold text-primary-300">{'Δ' + (config?.yLabel || 'pH')}</th>
                        <th className="bg-primary-500/20 border border-dark-600 px-3 py-2 text-sm font-semibold text-primary-300">{'Δ' + (config?.xLabel || 'V')}</th>
                        <th className="bg-primary-500/20 border border-dark-600 px-3 py-2 text-sm font-semibold text-primary-300">{'Δ' + (config?.yLabel || 'pH') + '/' + 'Δ' + (config?.xLabel || 'V')}</th>
                    </tr>
                </thead>

                <tbody>
                    {/* First row (no deltas) */}
                    <tr>
                        <td className="bg-dark-800 border border-dark-600 px-3 py-2 text-center text-white">
                            <input
                                type="number"
                                step="0.01"
                                className="w-28 bg-transparent text-center outline-none"
                                value={String(Number(volumes[0] ?? 0).toFixed(2))}
                                onChange={(e) => {
                                    const v = Number(e.target.value);
                                    const newVolumes = volumes.slice();
                                    newVolumes[0] = Number.isFinite(v) ? v : 0;
                                    setVolumes(newVolumes);
                                    recomputeFromVolumes(newVolumes, phValues);
                                }}
                                placeholder="0.00"
                                aria-label="Volume แถว 1"
                            />
                        </td>
                        <td className="bg-dark-800 border border-dark-600 px-3 py-2 text-center text-white">
                            <input
                                type="number"
                                step="0.01"
                                className="w-28 bg-transparent text-center outline-none"
                                value={String(Number(phValues[0] ?? 0).toFixed(2))}
                                onChange={(e) => {
                                    const p = Number(e.target.value);
                                    const newPH = phValues.slice();
                                    newPH[0] = Number.isFinite(p) ? p : 0;
                                    setPhValues(newPH);
                                    recomputeFromVolumes(volumes, newPH);
                                }}
                                placeholder="0.00"
                                aria-label="pH แถว 1"
                            />
                        </td>
                        <td className="bg-dark-800 border border-dark-600 px-3 py-2 text-center text-gray-500">—</td>
                        <td className="bg-dark-800 border border-dark-600 px-3 py-2 text-center text-gray-500">—</td>
                        <td className="bg-dark-800 border border-dark-600 px-3 py-2 text-center text-gray-500">—</td>
                    </tr>

                    {/* Editable delta rows */}
                    {deltaPH.map((dph, i) => {
                        const isEndPoint = i === result.eqIndex;
                        const rowClass = i % 2 === 0 ? 'bg-dark-700 text-white' : 'bg-dark-800 text-white';

                        return (
                            <tr key={i}>
                                <td className={cn('border border-dark-600 px-3 py-2 text-center', rowClass)}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-28 bg-transparent text-center outline-none"
                                        value={String(Number(volumes[i + 1] ?? 0).toFixed(2))}
                                        onChange={(e) => {
                                            const v = Number(e.target.value);
                                            const newVolumes = volumes.slice();
                                            newVolumes[i + 1] = Number.isFinite(v) ? v : 0;
                                            setVolumes(newVolumes);
                                            recomputeFromVolumes(newVolumes, phValues);
                                        }}
                                        placeholder="0.00"
                                        aria-label={`Volume แถว ${i + 2}`}
                                    />
                                </td>
                                <td className={cn('border border-dark-600 px-3 py-2 text-center', rowClass)}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-28 bg-transparent text-center outline-none"
                                        value={String(Number(phValues[i + 1] ?? 0).toFixed(2))}
                                        onChange={(e) => {
                                            const p = Number(e.target.value);
                                            const newPH = phValues.slice();
                                            newPH[i + 1] = Number.isFinite(p) ? p : 0;
                                            setPhValues(newPH);
                                            recomputeFromVolumes(volumes, newPH);
                                        }}
                                        placeholder="0.00"
                                        aria-label={`pH แถว ${i + 2}`}
                                    />
                                </td>

                                <td className={cn('border border-dark-600 px-3 py-2 text-center', isEndPoint ? 'bg-yellow-500/20 text-yellow-300 font-bold' : rowClass)}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-28 bg-transparent text-center outline-none"
                                        value={String(Number(deltaPH[i] ?? 0).toFixed(2))}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            const newDPH = deltaPH.slice();
                                            newDPH[i] = Number.isFinite(val) ? val : 0;
                                            setDeltaPH(newDPH);
                                            recomputeFromVolumes(volumes, phValues);
                                        }}
                                    />
                                </td>

                                <td className={cn('border border-dark-600 px-3 py-2 text-center', isEndPoint ? 'bg-yellow-500/20 text-yellow-300 font-bold' : rowClass)}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-28 bg-transparent text-center outline-none"
                                        value={String(Number(deltaV[i] ?? 0).toFixed(2))}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            const newDV = deltaV.slice();
                                            newDV[i] = Number.isFinite(val) ? val : 0;
                                            setDeltaV(newDV);
                                            recomputeFromVolumes(volumes, phValues);
                                        }}
                                    />
                                </td>

                                <td className={cn('border border-dark-600 px-3 py-2 text-center', isEndPoint ? 'bg-yellow-500/20 text-yellow-300 font-bold' : rowClass)}>
                                    {isEndPoint && '★ '}
                                    {(deltaV[i] !== 0 ? (deltaPH[i] / deltaV[i]) : 0).toFixed(2)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="mt-4 flex gap-2">
                <button
                    className="px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded focus-visible:ring-2 focus-visible:ring-primary-400"
                    onClick={() => applyManualOverrides(false)}
                    disabled={!canApply()}
                >
                    นำค่าที่แก้ไขไปยังตารางข้อมูล
                </button>

                <button
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded focus-visible:ring-2 focus-visible:ring-green-400"
                    onClick={() => applyManualOverrides(true)}
                    disabled={!canApply()}
                >
                    นำค่าไปใช้และบันทึกการทดลอง
                </button>
            </div>
        </div>
    );
}
