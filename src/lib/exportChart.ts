export function downloadChartAsPNG(ref: any, filename = 'chart.png') {
    try {
        const chart = ref?.current;
        if (!chart) return false;

        // Prefer canvas.toDataURL if available (react-chartjs-2 provides canvas)
        let dataUrl = '';
        if (chart.canvas && typeof chart.canvas.toDataURL === 'function') {
            dataUrl = chart.canvas.toDataURL('image/png', 1.0);
        } else if (typeof chart.toBase64Image === 'function') {
            dataUrl = chart.toBase64Image();
        }

        if (!dataUrl) return false;

        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        // Safari needs the link to be added to the DOM
        document.body.appendChild(a);
        a.click();
        a.remove();
        return true;
    } catch (e) {
        console.error('downloadChartAsPNG error', e);
        return false;
    }
}
