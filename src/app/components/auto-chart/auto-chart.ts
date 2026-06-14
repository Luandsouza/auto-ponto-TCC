import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Chart,
  ChartConfiguration,
  ChartType,
  Filler,
  TooltipItem,
  registerables,
} from 'chart.js';

Chart.register(...registerables, Filler);

export type AutoChartType = 'bar' | 'line' | 'doughnut';

export type AutoChartDatum = {
  label: string;
  value: number;
  color?: string;
};

@Component({
  selector: 'app-auto-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auto-chart.html',
  styleUrl: './auto-chart.css',
})
export class AutoChart implements AfterViewInit, OnChanges, OnDestroy {
  @Input() type: AutoChartType = 'bar';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() data: AutoChartDatum[] = [];
  @Input() currency = false;

  @ViewChild('canvas') private readonly canvasRef?: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private readonly palette = ['#1E3A8A', '#F59E0B', '#374151', '#64748B', '#0F766E', '#B45309'];

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(_: SimpleChanges): void {
    queueMicrotask(() => this.renderChart());
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  get total(): number {
    return this.data.reduce((sum, item) => sum + Math.max(item.value, 0), 0);
  }

  get normalizedData(): Required<AutoChartDatum>[] {
    return this.data.map((item, index) => ({
      label: item.label,
      value: Number.isFinite(item.value) ? item.value : 0,
      color: item.color || this.palette[index % this.palette.length],
    }));
  }

  formatValue(value: number): string {
    if (this.currency) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }

    return new Intl.NumberFormat('pt-BR').format(value);
  }

  private renderChart(): void {
    const canvas = this.canvasRef?.nativeElement;

    if (!canvas) {
      return;
    }

    this.chart?.destroy();

    const data = this.normalizedData;
    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    const chartType: ChartType = this.type === 'doughnut' ? 'doughnut' : this.type;
    const gradient = context.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, 'rgba(30, 58, 138, 0.22)');
    gradient.addColorStop(0.52, 'rgba(245, 158, 11, 0.12)');
    gradient.addColorStop(1, 'rgba(31, 41, 55, 0.04)');

    const chartOptions: ChartConfiguration['options'] & { cutout?: string } = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 700,
        easing: 'easeOutQuart',
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: '#0f172a',
          borderColor: 'rgba(245, 158, 11, 0.5)',
          borderWidth: 1,
          padding: 12,
          titleFont: {
            family: 'Inter, system-ui, sans-serif',
            weight: 'bold',
          },
          bodyFont: {
            family: 'Inter, system-ui, sans-serif',
            weight: 'bold',
          },
          callbacks: {
            label: (item: TooltipItem<ChartType>) => this.formatValue(Number(item.raw || 0)),
          },
        },
      },
      cutout: this.type === 'doughnut' ? '68%' : undefined,
      scales:
        this.type === 'doughnut'
          ? undefined
          : {
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  color: '#64748b',
                  font: {
                    family: 'Inter, system-ui, sans-serif',
                    weight: 'bold',
                  },
                },
                border: {
                  display: false,
                },
              },
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(55, 65, 81, 0.16)',
                },
                ticks: {
                  color: '#64748b',
                  font: {
                    family: 'Inter, system-ui, sans-serif',
                    weight: 'bold',
                  },
                  callback: (value) => (this.currency ? this.formatCompactCurrency(Number(value)) : value),
                },
                border: {
                  display: false,
                },
              },
            },
    };

    const configuration: ChartConfiguration = {
      type: chartType,
      data: {
        labels: data.map((item) => item.label),
        datasets: [
          {
            label: this.title || 'Indicador',
            data: data.map((item) => Math.max(item.value, 0)),
            backgroundColor:
              this.type === 'line'
                ? gradient
                : data.map((item) => this.hexToRgba(item.color, this.type === 'doughnut' ? 0.92 : 0.86)),
            borderColor: data.map((item) => item.color),
            borderWidth: this.type === 'line' ? 3 : 1,
            borderRadius: this.type === 'bar' ? 10 : 0,
            borderSkipped: false,
            tension: 0.38,
            fill: this.type === 'line',
            pointBackgroundColor: '#ffffff',
            pointBorderColor: data.map((item) => item.color),
            pointBorderWidth: 3,
            pointRadius: this.type === 'line' ? 5 : 0,
            hoverOffset: this.type === 'doughnut' ? 8 : 0,
          },
        ],
      },
      options: chartOptions,
    };

    this.chart = new Chart(context, configuration);
  }

  private formatCompactCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }

  private hexToRgba(hex: string, alpha: number): string {
    const cleanHex = hex.replace('#', '');
    const bigint = parseInt(cleanHex, 16);
    const red = (bigint >> 16) & 255;
    const green = (bigint >> 8) & 255;
    const blue = bigint & 255;

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }
}
