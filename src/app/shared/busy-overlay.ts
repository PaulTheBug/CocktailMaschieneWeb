import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';

/**
 * Vollflächige Ladeanimation während des Mixens.
 *
 * Sobald `active` auf `true` wechselt, läuft ein Fortschrittsbalken über
 * `durationMs` (Standard 17 s, angelehnt an das Original-Frontend) und zeigt
 * die verbleibende Zeit an.
 */
@Component({
  selector: 'app-busy-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (active()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-base-100/80 backdrop-blur-sm"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div class="card w-11/12 max-w-md bg-base-200 shadow-2xl">
          <div class="card-body items-center gap-6 text-center">
            <span class="loading loading-ring loading-xl text-primary"></span>
            <div>
              <h2 class="card-title justify-center text-2xl">Cocktail wird gemixt …</h2>
              @if (label()) {
                <p class="mt-1 text-base-content/70">{{ label() }}</p>
              }
            </div>

            <progress
              class="progress progress-primary w-full"
              aria-label="Fortschritt"
              [value]="progress()"
              max="100"
            ></progress>

            <span class="font-mono text-3xl tabular-nums text-primary">{{ remaining() }}s</span>
          </div>
        </div>
      </div>
    }
  `,
})
export class BusyOverlay {
  readonly active = input.required<boolean>();
  readonly durationMs = input(17_000);
  readonly label = input<string>('');

  private readonly destroyRef = inject(DestroyRef);
  private frame = 0;

  protected readonly progress = signal(0);
  protected readonly remaining = computed(() =>
    Math.max(0, Math.ceil((this.durationMs() * (1 - this.progress() / 100)) / 1000)),
  );

  constructor() {
    effect((onCleanup) => {
      if (!this.active()) {
        this.progress.set(0);
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(100, ((now - start) / this.durationMs()) * 100);
        this.progress.set(p);
        if (p < 100) {
          this.frame = requestAnimationFrame(tick);
        }
      };
      this.frame = requestAnimationFrame(tick);
      onCleanup(() => cancelAnimationFrame(this.frame));
    });

    this.destroyRef.onDestroy(() => cancelAnimationFrame(this.frame));
  }
}
