import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

/**
 * Modaler PIN-Block mit vier Punkten und Ziffernfeld.
 *
 * Sobald vier Ziffern eingegeben sind, wird `completed` mit der PIN ausgelöst.
 * Das Eingabefeld leert sich danach automatisch, sodass der Aufrufer die PIN
 * validieren und das Modal offen halten oder schließen kann. Escape bzw. ein
 * Klick auf den Hintergrund lösen `cancel` aus.
 */
@Component({
  selector: 'app-pin-pad',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'cancel.emit()' },
  template: `
    <div class="fixed inset-0 z-40 flex items-center justify-center">
      <button
        type="button"
        class="absolute inset-0 bg-base-100/80 backdrop-blur-sm"
        aria-label="Dialog schließen"
        (click)="cancel.emit()"
      ></button>

      <div
        class="relative z-10 card w-11/12 max-w-xs bg-base-200 shadow-2xl"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title()"
      >
        <div class="card-body items-center gap-6">
          <h2 class="card-title">{{ title() }}</h2>

          <div class="flex gap-3" aria-hidden="true">
            @for (dot of dots; track $index) {
              <span
                class="size-4 rounded-full border border-primary transition-colors"
                [class.bg-primary]="$index < pin().length"
              ></span>
            }
          </div>

          <div class="grid grid-cols-3 gap-2">
            @for (key of keys; track key) {
              <button
                type="button"
                class="btn btn-lg btn-square text-xl"
                [disabled]="disabled()"
                (click)="press(key)"
              >
                {{ key }}
              </button>
            }
            <button
              type="button"
              class="btn btn-lg btn-square btn-ghost"
              aria-label="Abbrechen"
              [disabled]="disabled()"
              [disabled]="disabled()"
              (click)="cancel.emit()"
            >
              ✕
            </button>
            <button
              type="button"
              class="btn btn-lg btn-square text-xl"
              [disabled]="disabled()"
              (click)="press('0')"
            >
              0
            </button>
            <button
              type="button"
              class="btn btn-lg btn-square btn-ghost"
              aria-label="Letzte Ziffer löschen"
              [disabled]="disabled()"
              (click)="backspace()"
            >
              ←
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PinPad {
  readonly title = input('PIN eingeben');
  readonly disabled = input(false);
  readonly completed = output<string>();
  readonly cancel = output<void>();

  protected readonly dots = [0, 1, 2, 3];
  protected readonly keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  protected readonly pin = signal('');

  protected press(digit: string): void {
    if (this.disabled()) return;
    if (this.pin().length >= 4) return;
    const next = this.pin() + digit;
    this.pin.set(next);
    if (next.length === 4) {
      this.completed.emit(next);
      this.pin.set('');
    }
  }

  protected backspace(): void {
    if (this.disabled()) return;
    this.pin.update((p) => p.slice(0, -1));
  }
}
