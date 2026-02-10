export function downloadChartAsPNG(ref: any, filename = 'chart.png') {
    try {
        const chartRef = ref?.current;
        if (!chartRef) return false;

        let dataUrl = '';

        // 1) If the ref is directly a canvas element
        if (typeof HTMLCanvasElement !== 'undefined' && chartRef instanceof HTMLCanvasElement) {
            dataUrl = chartRef.toDataURL('image/png', 1.0);
        }

        // 2) Chart.js/react-chartjs-2 instances expose several helpers
        if (!dataUrl) {
            // chartRef.canvas (some wrappers)
            if (chartRef.canvas && typeof chartRef.canvas.toDataURL === 'function') {
                dataUrl = chartRef.canvas.toDataURL('image/png', 1.0);
            }

            // chartRef.chart.canvas (Chart.js v3+ wrapper)
            if (!dataUrl && chartRef.chart && chartRef.chart.canvas && typeof chartRef.chart.canvas.toDataURL === 'function') {
                dataUrl = chartRef.chart.canvas.toDataURL('image/png', 1.0);
            }

            // toBase64Image provided by Chart.js instance
            if (!dataUrl && typeof chartRef.toBase64Image === 'function') {
                dataUrl = chartRef.toBase64Image();
            }
        }

        // 3) Last resort: search for a canvas element inside the component container
        if (!dataUrl) {
            const container = chartRef?.container || chartRef?.node || chartRef?.el || chartRef?.canvas?.parentNode;
            const canvas = container?.querySelector?.('canvas') || (chartRef?.canvas instanceof HTMLCanvasElement ? chartRef.canvas : null);
            if (canvas && typeof canvas.toDataURL === 'function') {
                dataUrl = canvas.toDataURL('image/png', 1.0);
            }
        }

        if (!dataUrl) return false;

        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        return true;
    } catch (e) {
        console.error('downloadChartAsPNG error', e);
        return false;
    }
}

export function getCanvasFromRef(ref: any): HTMLCanvasElement | null {
    try {
        const chartRef = ref?.current;
        if (!chartRef) return null;

        // Direct canvas
        if (chartRef instanceof HTMLCanvasElement) return chartRef;

        if (chartRef.canvas && chartRef.canvas instanceof HTMLCanvasElement) return chartRef.canvas;
        if (chartRef.chart && chartRef.chart.canvas && chartRef.chart.canvas instanceof HTMLCanvasElement) return chartRef.chart.canvas;

        // DOM search
        const container = chartRef?.container || chartRef?.node || chartRef?.el || chartRef?.canvas?.parentNode;
        const canvas = container?.querySelector?.('canvas');
        if (canvas && canvas instanceof HTMLCanvasElement) return canvas;

        return null;
    } catch (e) {
        console.error('getCanvasFromRef error', e);
        return null;
    }
}

// Explicit named exports for compatibility with some bundlers
export { downloadChartAsPNG, getCanvasFromRef };
