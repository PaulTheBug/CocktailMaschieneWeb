import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Zentrierte Ladeanimation für laufende Datenabfragen. */
@Component({
  selector: 'app-loading-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center gap-4 py-16 text-base-content/70">
      <span class="loading loading-spinner loading-lg text-primary"></span>
      <span class="text-lg">{{ label() }}</span>
    </div>
  `,
})
export class LoadingSpinner {
  readonly label = input('Wird geladen …');
}
