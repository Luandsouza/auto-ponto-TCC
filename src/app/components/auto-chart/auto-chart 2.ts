import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

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
export class AutoChart implements AfterViewInit, OnChanges {
  @Input() type: AutoChartType = 'bar';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() data: AutoChartDatum[] = [];
  @Input() currency = false;

  @ViewChild('canvas') private readonly canvasRef?: ElementRef<HTMLCanvasElement>;

  private readonly palette = ['#f97316', '#0ea5e9', '#22c55e', '#ef4444', '#64748b', '#15146f'];

  ngAfterViewInit(): void {
    this.draw();
  }

  ngOnChanges(_: SimpleChanges): void {
    queueMicrotask(() => this.draw());
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

  private draw(): void {
    const canvas = this.canvasRef?.nativeElement;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    const parent = canvas.parentElement;
    const width = parent?.clientWidth || 520;
    const height = 260;
    const ratio = window.devicePixelRatio || 1;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    if (!this.normalizedData.length) {
      this.drawEmpty(context, width, height);
      return;
    }

    if (this.type === 'doughnut') {
      this.drawDoughnut(context, width, height);
      return;
    }

    if (this.type === 'line') {
      this.drawLine(context, width, height);
      return;
    }

    this.drawBars(context, width, height);
  }

  private drawEmpty(context: CanvasRenderingContext2D, width: number, height: number): void {
    context.fillStyle = '#94a3b8';
    context.font = '700 14px Inter, system-ui, sans-serif';
    context.textAlign = 'center';
    context.fillText('Sem dados para exibir', width / 2, height / 2);
  }

  private drawBars(context: CanvasRenderingContext2D, width: number, height: number): void {
    const data = this.normalizedData;
    const padding = { top: 22, right: 18, bottom: 46, left: 46 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const max = Math.max(...data.map((item) => item.value), 1);
    const gap = 14;
    const barWidth = Math.max((chartWidth - gap * (data.length - 1)) / data.length, 16);

    this.drawGrid(context, padding.left, padding.top, chartWidth, chartHeight);

    data.forEach((item, index) => {
      const x = padding.left + index * (barWidth + gap);
      const barHeight = (item.value / max) * chartHeight;
      const y = padding.top + chartHeight - barHeight;

      this.roundedRect(context, x, y, barWidth, barHeight, 8, item.color);

      context.fillStyle = '#64748b';
      context.font = '700 11px Inter, system-ui, sans-serif';
      context.textAlign = 'center';
      context.fillText(item.label.slice(0, 10), x + barWidth / 2, height - 18);
    });
  }

  private drawLine(context: CanvasRenderingContext2D, width: number, height: number): void {
    const data = this.normalizedData;
    const padding = { top: 24, right: 22, bottom: 40, left: 46 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const max = Math.max(...data.map((item) => item.value), 1);
    const step = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;
    const points = data.map((item, index) => ({
      x: padding.left + index * step,
      y: padding.top + chartHeight - (item.value / max) * chartHeight,
      item,
    }));

    this.drawGrid(context, padding.left, padding.top, chartWidth, chartHeight);

    const gradient = context.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(249, 115, 22, 0.28)');
    gradient.addColorStop(1, 'rgba(14, 165, 233, 0.02)');

    context.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    });
    context.lineTo(points[points.length - 1].x, padding.top + chartHeight);
    context.lineTo(points[0].x, padding.top + chartHeight);
    context.closePath();
    context.fillStyle = gradient;
    context.fill();

    context.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    });
    context.strokeStyle = '#f97316';
    context.lineWidth = 4;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.stroke();

    points.forEach((point) => {
      context.beginPath();
      context.arc(point.x, point.y, 5, 0, Math.PI * 2);
      context.fillStyle = '#ffffff';
      context.fill();
      context.lineWidth = 3;
      context.strokeStyle = point.item.color;
      context.stroke();
    });
  }

  private drawDoughnut(context: CanvasRenderingContext2D, width: number, height: number): void {
    const data = this.normalizedData;
    const total = Math.max(this.total, 1);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 22;
    let start = -Math.PI / 2;

    context.lineWidth = 28;
    context.lineCap = 'round';

    data.forEach((item) => {
      const angle = (Math.max(item.value, 0) / total) * Math.PI * 2;
      context.beginPath();
      context.arc(centerX, centerY, radius, start, start + angle);
      context.strokeStyle = item.color;
      context.stroke();
      start += angle;
    });

    context.fillStyle = '#11124a';
    context.font = '900 24px Inter, system-ui, sans-serif';
    context.textAlign = 'center';
    context.fillText(this.formatValue(this.total), centerX, centerY + 4);
    context.fillStyle = '#64748b';
    context.font = '700 11px Inter, system-ui, sans-serif';
    context.fillText('total', centerX, centerY + 24);
  }

  private drawGrid(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    context.strokeStyle = '#e2e8f0';
    context.lineWidth = 1;

    for (let index = 0; index <= 4; index += 1) {
      const gridY = y + (height / 4) * index;
      context.beginPath();
      context.moveTo(x, gridY);
      context.lineTo(x + width, gridY);
      context.stroke();
    }
  }

  private roundedRect(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    color: string,
  ): void {
    const safeHeight = Math.max(height, 4);
    const safeY = height < 4 ? y - (4 - height) : y;

    context.beginPath();
    context.roundRect(x, safeY, width, safeHeight, radius);
    context.fillStyle = color;
    context.fill();
  }
}
