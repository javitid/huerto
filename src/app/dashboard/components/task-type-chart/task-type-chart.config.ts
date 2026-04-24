import { ChartOptions, TooltipItem } from 'chart.js';

interface TaskTypeChartOptionsParams {
  chartBrushes: string[];
  chartGridStroke: string;
  getChartTitle: () => string;
  getSubtitle: () => string;
  getXAxisTitle: () => string;
  getYAxisTitle: () => string;
  getTooltipTitle: (items: TooltipItem<'line'>[]) => string;
  getTooltipLabel: (item: TooltipItem<'line'>) => string;
}

export function createTaskTypeChartOptions({
  chartBrushes,
  chartGridStroke,
  getChartTitle,
  getSubtitle,
  getXAxisTitle,
  getYAxisTitle,
  getTooltipTitle,
  getTooltipLabel
}: TaskTypeChartOptionsParams): ChartOptions<'line'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    elements: {
      line: {
        tension: 0.35,
        borderWidth: 3
      },
      point: {
        radius: 3,
        hoverRadius: 5,
        hitRadius: 10
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: getChartTitle(),
        color: '#f8fafc',
        padding: {
          bottom: 12
        },
        font: {
          size: 18,
          weight: 700
        }
      },
      subtitle: {
        display: true,
        text: getSubtitle(),
        color: '#cbd5e1',
        padding: {
          bottom: 20
        },
        font: {
          size: 12,
          weight: 600
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.96)',
        borderColor: 'rgba(148, 163, 184, 0.18)',
        borderWidth: 1,
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        displayColors: true,
        padding: 14,
        callbacks: {
          title: getTooltipTitle,
          label: getTooltipLabel,
          labelColor: (item) => ({
            borderColor: chartBrushes[item.datasetIndex] ?? '#f8fafc',
            backgroundColor: chartBrushes[item.datasetIndex] ?? '#f8fafc'
          })
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: chartGridStroke
        },
        ticks: {
          color: '#cbd5e1',
          maxRotation: 45,
          minRotation: 45
        },
        title: {
          display: true,
          text: getXAxisTitle(),
          color: '#cbd5e1',
          font: {
            size: 12,
            weight: 600
          }
        }
      },
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
          precision: 0,
          color: '#cbd5e1'
        },
        grid: {
          color: chartGridStroke
        },
        title: {
          display: true,
          text: getYAxisTitle(),
          color: '#cbd5e1',
          font: {
            size: 12,
            weight: 600
          }
        }
      }
    }
  };
}
