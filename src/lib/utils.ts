import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ─── Tailwind Class Merge ───
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ─── Generate ID ───
export function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
}

// ─── Format Date Thai ───
export function formatDateThai(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// ─── Format Time Thai ───
export function formatTimeThai(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
    }) + ' น.';
}

// ─── Format Number ───
export function formatNumber(num: number, decimals: number = 2): string {
    return num.toFixed(decimals);
}

// ─── Parse Pasted Data ───
export interface ParsedRow {
    volume: number;
    pH: number;
}

export function parsePastedData(text: string): ParsedRow[] {
    const rows = text.split('\n').filter(line => line.trim() !== '');
    const result: ParsedRow[] = [];

    for (const row of rows) {
        let parts: string[];

        // แยกด้วย Tab > Comma > Space
        if (row.includes('\t')) {
            parts = row.split('\t');
        } else if (row.includes(',')) {
            parts = row.split(',');
        } else {
            parts = row.split(/\s+/);
        }

        parts = parts.map(p => p.trim()).filter(p => p !== '');

        if (parts.length >= 2) {
            const vol = parseFloat(parts[0]);
            const ph = parseFloat(parts[1]);

            // ข้ามถ้าไม่ใช่ตัวเลข (เช่น header)
            if (!isNaN(vol) && !isNaN(ph)) {
                result.push({ volume: vol, pH: ph });
            }
        }
    }

    return result;
}

// ─── Check if paste is multi-line ───
export function isMultiLinePaste(text: string): boolean {
    return text.includes('\n') || text.includes('\t');
}
