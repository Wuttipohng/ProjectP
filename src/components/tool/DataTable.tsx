'use client';

import React from 'react';
import { Plus, Trash2, Lightbulb } from 'lucide-react';
import { useToolStore } from '@/stores/useToolStore';
import { parsePastedData, isMultiLinePaste, generateId } from '@/lib/utils';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function DataTable() {
    const { dataRows, addRow, removeRow, updateRow, clearAllRows, setDataRows, config } = useToolStore();

    // ★ Smart Paste Handler
    const handlePaste = (
        event: React.ClipboardEvent<HTMLInputElement>,
        rowIndex: number,
        field: 'volume' | 'pH'
    ) => {
        const text = event.clipboardData.getData('text').trim();

        // ถ้าเป็น single value → ไม่ทำ Smart Paste
        if (!isMultiLinePaste(text)) return;

        // ★ Smart Paste!
        event.preventDefault();

        const parsedRows = parsePastedData(text);

        if (parsedRows.length > 0) {
            const newDataRows = parsedRows.map((row) => ({
                id: generateId(),
                volume: row.volume.toString(),
                pH: row.pH.toString(),
            }));

            setDataRows(newDataRows);
            toast.success(`📋 วาง ${newDataRows.length} แถวสำเร็จ!`);
        } else {
            toast.error('❌ อ่านข้อมูลไม่ได้ ลองตรวจสอบรูปแบบ');
        }
    };

    // Keyboard Navigation
    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>,
        rowIndex: number,
        field: 'volume' | 'pH'
    ) => {
        const input = event.target as HTMLInputElement;

        switch (event.key) {
            case 'Enter':
                event.preventDefault();
                if (rowIndex === dataRows.length - 1) {
                    // เพิ่มแถวใหม่ถ้าอยู่แถวสุดท้าย
                    addRow();
                    setTimeout(() => {
                        const inputs = document.querySelectorAll<HTMLInputElement>('.data-input');
                        const nextInput = inputs[(rowIndex + 1) * 2]; // volume ของแถวถัดไป
                        nextInput?.focus();
                    }, 50);
                } else {
                    // เลื่อนไปแถวถัดไป
                    const inputs = document.querySelectorAll<HTMLInputElement>('.data-input');
                    const currentIndex = rowIndex * 2 + (field === 'pH' ? 1 : 0);
                    const nextInput = inputs[currentIndex + 2];
                    nextInput?.focus();
                }
                break;

            case 'ArrowDown':
                event.preventDefault();
                {
                    const inputs = document.querySelectorAll<HTMLInputElement>('.data-input');
                    const currentIndex = rowIndex * 2 + (field === 'pH' ? 1 : 0);
                    const nextInput = inputs[currentIndex + 2];
                    nextInput?.focus();
                }
                break;

            case 'ArrowUp':
                event.preventDefault();
                {
                    const inputs = document.querySelectorAll<HTMLInputElement>('.data-input');
                    const currentIndex = rowIndex * 2 + (field === 'pH' ? 1 : 0);
                    const prevInput = inputs[currentIndex - 2];
                    prevInput?.focus();
                }
                break;

            case 'Backspace':
                // ถ้าช่องว่าง + ไม่ใช่แถวแรก/สุดท้าย → ลบแถวนี้
                if (input.value === '' && dataRows.length > 1) {
                    const volumeEmpty = dataRows[rowIndex].volume === '';
                    const phEmpty = dataRows[rowIndex].pH === '';
                    if (volumeEmpty && phEmpty) {
                        event.preventDefault();
                        removeRow(dataRows[rowIndex].id);
                        setTimeout(() => {
                            const inputs = document.querySelectorAll<HTMLInputElement>('.data-input');
                            const prevIndex = Math.max(0, (rowIndex - 1) * 2 + (field === 'pH' ? 1 : 0));
                            inputs[prevIndex]?.focus();
                        }, 50);
                    }
                }
                break;
        }
    };

    const validCount = dataRows.filter(
        (r) =>
            r.volume.trim() !== '' &&
            r.pH.trim() !== '' &&
            !isNaN(Number(r.volume)) &&
            !isNaN(Number(r.pH))
    ).length;

    return (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    📊 ข้อมูลการทดลอง
                </h3>
                <span className="text-sm text-gray-400">
                    จำนวนข้อมูล: <span className="text-primary-400 font-medium">{validCount}</span> จุด
                </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="bg-dark-700 border border-dark-600 px-3 py-2 text-sm font-semibold text-gray-300 w-12">
                                #
                            </th>
                            <th className="bg-dark-700 border border-dark-600 px-3 py-2 text-sm font-semibold text-gray-300">
                                {/** Use configured axis labels */}
                                {config?.xLabel || 'Volume (mL)'}
                            </th>
                            <th className="bg-dark-700 border border-dark-600 px-3 py-2 text-sm font-semibold text-gray-300">
                                {config?.yLabel || 'pH'}
                            </th>
                            <th className="bg-dark-700 border border-dark-600 px-3 py-2 text-sm font-semibold text-gray-300 w-12">
                                ลบ
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataRows.map((row, index) => (
                            <tr key={row.id} className="group">
                                <td className="bg-dark-800 border border-dark-600 px-3 py-2 text-center text-gray-400 text-sm">
                                    {index + 1}
                                </td>
                                <td className="bg-dark-800 border border-dark-600 px-1 py-1">
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        className="data-input w-full bg-dark-900 border border-dark-600 rounded px-3 py-2 text-white text-center focus:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/80 outline-none transition-all"
                                        value={row.volume}
                                        onChange={(e) => updateRow(row.id, 'volume', e.target.value)}
                                        onPaste={(e) => handlePaste(e, index, 'volume')}
                                        onKeyDown={(e) => handleKeyDown(e, index, 'volume')}
                                        placeholder="0.00"
                                        autoComplete="on"
                                        name={`volume_${index}`}
                                        aria-label={`Volume แถว ${index + 1}`}
                                        spellCheck={false}
                                    />
                                </td>
                                <td className="bg-dark-800 border border-dark-600 px-1 py-1">
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        className="data-input w-full bg-dark-900 border border-dark-600 rounded px-3 py-2 text-white text-center focus:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/80 outline-none transition-all"
                                        value={row.pH}
                                        onChange={(e) => updateRow(row.id, 'pH', e.target.value)}
                                        onPaste={(e) => handlePaste(e, index, 'pH')}
                                        onKeyDown={(e) => handleKeyDown(e, index, 'pH')}
                                        placeholder="0.00"
                                        autoComplete="on"
                                        name={`ph_${index}`}
                                        aria-label={`pH แถว ${index + 1}`}
                                        spellCheck={false}
                                    />
                                </td>
                                <td className="bg-dark-800 border border-dark-600 px-1 py-1 text-center">
                                    <button
                                        onClick={() => removeRow(row.id)}
                                        disabled={dataRows.length <= 1}
                                        className="p-2 text-gray-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-red-400"
                                        aria-label={`ลบแถวที่ ${index + 1}`}
                                    >
                                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={addRow} aria-label="เพิ่มแถวใหม่">
                        <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                        เพิ่มแถว
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearAllRows} aria-label="ลบข้อมูลทั้งหมด">
                        <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
                        ลบทั้งหมด
                    </Button>
                </div>
            </div>

            {/* Tip */}
            <div className="mt-4 flex items-start gap-2 p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                <Lightbulb className="h-4 w-4 text-primary-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <p className="text-sm text-primary-300">
                    <strong>Tip:</strong> Copy ข้อมูลจาก Excel แล้ว Ctrl+V ที่ช่องแรกได้เลย! รองรับ Tab, Comma, Space
                </p>
            </div>
        </div>
    );
}
