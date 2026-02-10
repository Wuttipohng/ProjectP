'use client';

import React, { useEffect, useState } from 'react';
import type { TitrationResult } from '@/types';
import { cn } from '@/lib/utils';
import { useToolStore } from '@/stores/useToolStore';

interface ResultTableProps {
    result: TitrationResult;
}

export default function ResultTable({ result }: ResultTableProps) {
    const { setResult } = useToolStore();

    const [deltaPH, setDeltaPH] = useState<number[]>(result.deltaPH.slice());
    const [deltaV, setDeltaV] = useState<number[]>(result.deltaV.slice());

    useEffect(() => {
        setDeltaPH(result.deltaPH.slice());
        setDeltaV(result.deltaV.slice());
    }, [result]);

    const updateComputed = (newDeltaPH: number[], newDeltaV: number[]) => {
        const n = result.volume.length;
        const dPHdV: number[] = [];
        const plotVolume: number[] = [];

        for (let i = 0; i < n - 1; i++) {
            const dPH = newDeltaPH[i] ?? 0;
            const dV = newDeltaV[i] ?? 0;
            dPHdV.push(dV !== 0 ? dPH / dV : 0);
            plotVolume.push(result.volume[i + 1]);
        }

        // Find endpoint
        let maxDPHdV = dPHdV[0] ?? 0;
        let eqIndex = 0;
        for (let i = 1; i < dPHdV.length; i++) {
            if (dPHdV[i] > maxDPHdV) {
                maxDPHdV = dPHdV[i];
                eqIndex = i;
            }
        }

        const eqVol = plotVolume[eqIndex];
        const eqPH = result.pH[eqIndex + 1];
        const eqDPHdV = maxDPHdV;

        let expType = result.expType || '';
        if (eqPH > 8) expType = 'Strong Base + Weak Acid';
        else if (eqPH < 6) expType = 'Strong Acid + Weak Base';
        else expType = 'Strong Acid + Strong Base';

        const newResult: TitrationResult = {
            ...result,
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

        setResult(newResult);
    };

    return (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 overflow-x-auto focus-visible:ring-2 focus-visible:ring-primary-500/80" tabIndex={0}>
            <h3 className="text-lg font-semibold text-white mb-4">📊 ตารางผลการคำนวณ</h3>

            <table className="w-full border-collapse min-w-[600px]" aria-live="polite">
                <caption className="sr-only">ผลการคำนวณไทเทรต</caption>
                <thead>
                    <tr>
                        <th className="bg-primary-500/20 border border-dark-600 px-3 py-2 text-sm font-semibold text-primary-300">Volume (mL)</th>
                        <th className="bg-primary-500/20 border border-dark-600 px-3 py-2 text-sm font-semibold text-primary-300">pH</th>
                        <th className="bg-primary-500/20 border border-dark-600 px-3 py-2 text-sm font-semibold text-primary-300">ΔpH</th>
                        <th className="bg-primary-500/20 border border-dark-600 px-3 py-2 text-sm font-semibold text-primary-300">ΔV</th>
                        <th className="bg-primary-500/20 border border-dark-600 px-3 py-2 text-sm font-semibold text-primary-300">ΔpH/ΔV</th>
                    </tr>
                </thead>

                <tbody>
                    {/* First row (no deltas) */}
                    <tr>
                        <td className="bg-dark-800 border border-dark-600 px-3 py-2 text-center text-white">{result.volume[0].toFixed(2)}</td>
                        <td className="bg-dark-800 border border-dark-600 px-3 py-2 text-center text-white">{result.pH[0].toFixed(2)}</td>
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
                                    {result.volume[i + 1].toFixed(2)}
                                </td>
                                <td className={cn('border border-dark-600 px-3 py-2 text-center', rowClass)}>
                                    {result.pH[i + 1].toFixed(2)}
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
                                            updateComputed(newDPH, deltaV);
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
                                            updateComputed(deltaPH, newDV);
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
        </div>
    );
}
