'use client';

import type { TitrationResult } from '@/types';
import { cn } from '@/lib/utils';

interface ResultTableProps {
    result: TitrationResult;
}

export default function ResultTable({ result }: ResultTableProps) {
    return (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 overflow-x-auto">
            <h3 className="text-lg font-semibold text-white mb-4">📊 ตารางผลการคำนวณ</h3>

            <table className="w-full border-collapse min-w-[600px]">
                <thead>
                    <tr>
                        <th className="bg-primary-500/20 border border-dark-600 px-3 py-2 text-sm font-semibold text-primary-300">
                            Volume (mL)
                        </th>
                        <th className="bg-primary-500/20 border border-dark-600 px-3 py-2 text-sm font-semibold text-primary-300">
                            pH
                        </th>
                        <th className="bg-primary-500/20 border border-dark-600 px-3 py-2 text-sm font-semibold text-primary-300">
                            ΔpH
                        </th>
                        <th className="bg-primary-500/20 border border-dark-600 px-3 py-2 text-sm font-semibold text-primary-300">
                            ΔV
                        </th>
                        <th className="bg-primary-500/20 border border-dark-600 px-3 py-2 text-sm font-semibold text-primary-300">
                            ΔpH/ΔV
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {/* แถวแรก */}
                    <tr>
                        <td className="bg-dark-800 border border-dark-600 px-3 py-2 text-center text-white">
                            {result.volume[0].toFixed(2)}
                        </td>
                        <td className="bg-dark-800 border border-dark-600 px-3 py-2 text-center text-white">
                            {result.pH[0].toFixed(2)}
                        </td>
                        <td className="bg-dark-800 border border-dark-600 px-3 py-2 text-center text-gray-500">
                            —
                        </td>
                        <td className="bg-dark-800 border border-dark-600 px-3 py-2 text-center text-gray-500">
                            —
                        </td>
                        <td className="bg-dark-800 border border-dark-600 px-3 py-2 text-center text-gray-500">
                            —
                        </td>
                    </tr>

                    {/* แถวที่เหลือ */}
                    {result.dPHdV.map((dphdv, i) => {
                        const isEndPoint = i === result.eqIndex;

                        return (
                            <tr key={i}>
                                <td
                                    className={cn(
                                        'border border-dark-600 px-3 py-2 text-center',
                                        isEndPoint
                                            ? 'bg-yellow-500/20 text-yellow-300 font-bold'
                                            : i % 2 === 0
                                                ? 'bg-dark-700 text-white'
                                                : 'bg-dark-800 text-white'
                                    )}
                                >
                                    {isEndPoint && '★ '}
                                    {result.volume[i + 1].toFixed(2)}
                                </td>
                                <td
                                    className={cn(
                                        'border border-dark-600 px-3 py-2 text-center',
                                        isEndPoint
                                            ? 'bg-yellow-500/20 text-yellow-300 font-bold'
                                            : i % 2 === 0
                                                ? 'bg-dark-700 text-white'
                                                : 'bg-dark-800 text-white'
                                    )}
                                >
                                    {result.pH[i + 1].toFixed(2)}
                                </td>
                                <td
                                    className={cn(
                                        'border border-dark-600 px-3 py-2 text-center',
                                        isEndPoint
                                            ? 'bg-yellow-500/20 text-yellow-300 font-bold'
                                            : i % 2 === 0
                                                ? 'bg-dark-700 text-white'
                                                : 'bg-dark-800 text-white'
                                    )}
                                >
                                    {result.deltaPH[i].toFixed(2)}
                                </td>
                                <td
                                    className={cn(
                                        'border border-dark-600 px-3 py-2 text-center',
                                        isEndPoint
                                            ? 'bg-yellow-500/20 text-yellow-300 font-bold'
                                            : i % 2 === 0
                                                ? 'bg-dark-700 text-white'
                                                : 'bg-dark-800 text-white'
                                    )}
                                >
                                    {result.deltaV[i].toFixed(2)}
                                </td>
                                <td
                                    className={cn(
                                        'border border-dark-600 px-3 py-2 text-center',
                                        isEndPoint
                                            ? 'bg-yellow-500/20 text-yellow-300 font-bold'
                                            : i % 2 === 0
                                                ? 'bg-dark-700 text-white'
                                                : 'bg-dark-800 text-white'
                                    )}
                                >
                                    {isEndPoint && '★ '}
                                    {dphdv.toFixed(2)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
