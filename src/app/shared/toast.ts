import { ChangeDetectionStrategy, Component, Injectable, inject, signal } from '@angular/core';

export type ToastType = 'info' | 'success' | 'error' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message: string;
}

/** Signal-basiertes Benachrichtigungssystem (Ersatz für alerts.js). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  readonly toasts = signal<Toast[]>([]);

  show(title: string, message: string, type: ToastType = 'info', timeoutMs = 4000): void {
    const id = this.nextId++;
    this.toasts.update((list) => [...list, { id, title, message, type }]);
    setTimeout(() => this.dismiss(id), timeoutMs);
  }

  success(title: string, message: string): void {
    this.show(title, message, 'success');
  }

  error(title: string, message: string): void {
    this.show(title, message, 'error');
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}

/** Zeigt die aktiven Toasts unten rechts an. */
@Component({
  selector: 'app-toasts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast toast-end z-50" role="status" aria-live="polite">
      @for (toast of service.toasts(); track toast.id) {
        <button
          type="button"
          class="alert text-left shadow-lg"
          [class.alert-success]="toast.type === 'success'"
          [class.alert-error]="toast.type === 'error'"
          [class.alert-warning]="toast.type === 'warning'"
          [class.alert-info]="toast.type === 'info'"
          [attr.aria-label]="'Benachrichtigung schließen: ' + toast.title"
          (click)="service.dismiss(toast.id)"
        >
          <div>
            <h3 class="font-bold">{{ toast.title }}</h3>
            <div class="text-sm">{{ toast.message }}</div>
          </div>
        </button>
      }
    </div>
  `,
})
export class Toasts {
  protected readonly service = inject(ToastService);
}
