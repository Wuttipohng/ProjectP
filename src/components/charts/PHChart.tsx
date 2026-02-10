'use client';

import React, { forwardRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Line } from 'react-chartjs-2';
import type { TitrationResult, ChartConfig, ExperimentConfig } from '@/types';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    annotationPlugin
);

interface PHChartProps {
    result: TitrationResult;
    chartConfig: ChartConfig;
    expConfig: ExperimentConfig;
    experimentsCount?: number;
}

const PHChart = forwardRef<any, PHChartProps>(
    ({ result, chartConfig, expConfig, experimentsCount }, ref) => {
        const data = {
            labels: result.volume.map((v) => v.toFixed(2)),
            datasets: [
                {
                    label: 'pH',
                    data: result.pH,
                    borderColor: chartConfig.lineColor,
                    backgroundColor: chartConfig.markerColor,
                    pointBackgroundColor: result.volume.map((v, i) =>
                        i === result.eqIndex + 1 ? '#ef4444' : chartConfig.markerColor
                    ),
                    pointBorderColor: result.volume.map((v, i) =>
                        i === result.eqIndex + 1 ? '#ef4444' : chartConfig.markerColor
                    ),
                    pointRadius: result.volume.map((v, i) =>
                        i === result.eqIndex + 1 ? 8 : 4
                    ),
                    pointHoverRadius: 6,
                    tension: 0.1,
                    borderWidth: 2,
                },
            ],
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 500,
            },
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: [
                        `กราฟแสดงความสัมพันธ์ระหว่างค่า ${expConfig.yLabel} ของ ${expConfig.expName}`,
                        `กับค่า ${expConfig.xLabel} ${expConfig.expNo}`,
                    ],
                    color: '#fff',
                    font: {
                        size: 16,
                        weight: 'bold' as const,
                    },
                    padding: {
                        top: 6,
                        bottom: 6,
                    },
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#33b8ff',
                    borderWidth: 1,
                    callbacks: {
                        label: (context: any) => {
                            return `pH: ${context.parsed.y.toFixed(2)}`;
                        },
                    },
                },
                annotation: {
                    annotations: {
                        endpointLine: {
                            type: 'line' as const,
                            xMin: result.eqVol.toFixed(2),
                            xMax: result.eqVol.toFixed(2),
                            borderColor: 'rgba(239, 68, 68, 0.7)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                display: true,
                                content: `End Point (${result.eqVol.toFixed(2)}, ${result.eqPH.toFixed(2)})`,
                                position: 'start' as const,
                                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                                color: '#fff',
                                font: {
                                    size: 11,
                                },
                            },
                        },
                    },
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: expConfig.xLabel,
                        color: '#9ca3af',
                        font: {
                            size: 12,
                        },
                    },
                    max: chartConfig.xMax,
                    ticks: {
                        stepSize: chartConfig.xStep,
                        color: '#9ca3af',
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'pH',
                        color: '#9ca3af',
                        font: {
                            size: 12,
                        },
                    },
                    min: 0,
                    max: chartConfig.yMaxPH,
                    ticks: {
                        stepSize: chartConfig.yStepPH,
                        color: '#9ca3af',
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                    },
                },
            },
        };

        return (
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-4" style={{ height: '450px' }}>
                <Line ref={ref} data={data} options={options} />
            </div>
        );
    }
);

PHChart.displayName = 'PHChart';

export default PHChart;
