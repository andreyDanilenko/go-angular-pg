import {
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  Input
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tooltip',
  exportAs: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #trigger class="tooltip-trigger" (click)="toggleTooltip()">
      <ng-content select="[tooltip-trigger]"></ng-content>
    </div>

    @if (visible) {
      <div
        #tooltip
        class="tooltip-box"
          [ngStyle]="{
            top: (position?.top || 40) + 'px',
            right: (position?.left || 20) + 'px'
          }"
      >
        <ng-container *ngTemplateOutlet="tooltipContent"></ng-container>
      </div>
    }
  `,
  styles: [`
    :host {
      position: relative;
    }

    .tooltip-trigger {
      align-items: center;
      display: flex;
      cursor: pointer;
    }

    .tooltip-box {
      position: absolute !important;
      z-index: 9999 !important;
      background-color: var(--md-sys-color-surface);
      color: var(--md-sys-color-on-surface);
      padding: 10px;
      border-radius: 6px;
      font-size: 14px;
      max-width: 300px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      /* Защита от обрезания */
      transform: none !important;
      will-change: unset !important;
      contain: none !important;
      clip-path: none !important;
    }
  `]
})
export class TooltipComponent implements AfterViewInit {
  @ViewChild('trigger', { static: true }) triggerRef!: ElementRef;
  @ViewChild('tooltip') tooltipRef?: ElementRef;
  @ContentChild(TemplateRef) tooltipContent!: TemplateRef<any>;
  @Input() position: { top: number, left: number } | null = null;

  @Output() closed = new EventEmitter<void>();

  visible = false;
  // position = { top: 0, left: 0 };

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    if (!this.tooltipContent) {
      console.warn('Tooltip content template is missing');
    }
  }

  toggleTooltip() {
    this.visible = !this.visible;
    if (!this.visible) {
      this.closed.emit();
    }
  }

  closeTooltip() {
    if (this.visible) {
      this.visible = false;
      this.cdr.detectChanges();
      this.closed.emit();
    }
  }

  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: MouseEvent) {
    const triggerEl = this.triggerRef.nativeElement;
    const tooltipEl = this.tooltipRef?.nativeElement;

    const clickedInsideTrigger = triggerEl.contains(event.target);
    const clickedInsideTooltip = tooltipEl?.contains(event.target as Node);

    if (!clickedInsideTrigger && !clickedInsideTooltip) {
      // Отложенное закрытие для корректного срабатывания событий внутри тултипа
      setTimeout(() => {
        this.closeTooltip();
      }, 0);
    }
  }
}
