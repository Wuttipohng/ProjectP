// ═══════════════════════════════════════════════════════════
// Titration Calculation Engine
// ═══════════════════════════════════════════════════════════

import type { TitrationResult } from '@/types';

/**
 * คำนวณผลการไทเทรชัน
 * 
 * @param volume - array ของ volume (mL)
 * @param pH - array ของค่า pH
 * @returns TitrationResult หรือ null ถ้าข้อมูลไม่พอ
 */
export function calculateTitration(
    volume: number[],
    pH: number[]
): TitrationResult | null {
    // ต้องมีข้อมูลอย่างน้อย 2 จุด
    if (volume.length < 2 || pH.length < 2) {
        return null;
    }

    if (volume.length !== pH.length) {
        return null;
    }

    const n = volume.length;

    // คำนวณ ΔpH, ΔV, ΔpH/ΔV
    const deltaPH: number[] = [];
    const deltaV: number[] = [];
    const dPHdV: number[] = [];
    const plotVolume: number[] = []; // Volume ขวาของช่วง (ตามอาจารย์)

    for (let i = 0; i < n - 1; i++) {
        const dPH = pH[i + 1] - pH[i];
        const dV = volume[i + 1] - volume[i];

        deltaPH.push(dPH);
        deltaV.push(dV);
        dPHdV.push(dV !== 0 ? dPH / dV : 0);
        plotVolume.push(volume[i + 1]); // Volume ขวา
    }

    // หา End Point (max ΔpH/ΔV)
    let maxDPHdV = dPHdV[0];
    let eqIndex = 0;

    for (let i = 1; i < dPHdV.length; i++) {
        if (dPHdV[i] > maxDPHdV) {
            maxDPHdV = dPHdV[i];
            eqIndex = i;
        }
    }

    const eqVol = plotVolume[eqIndex];
    const eqPH = pH[eqIndex + 1]; // pH ที่ End Point
    const eqDPHdV = maxDPHdV;

    // ตรวจสอบประเภทการไทเทรชัน
    let expType: string;
    if (eqPH > 8) {
        expType = 'Strong Base + Weak Acid';
    } else if (eqPH < 6) {
        expType = 'Strong Acid + Weak Base';
    } else {
        expType = 'Strong Acid + Strong Base';
    }

    return {
        volume,
        pH,
        plotVolume,
        deltaPH,
        deltaV,
        dPHdV,
        eqIndex,
        eqVol,
        eqPH,
        eqDPHdV,
        expType,
    };
}

/**
 * Format number to fixed decimals
 */
export function formatNum(num: number, decimals: number = 2): string {
    return num.toFixed(decimals);
}
