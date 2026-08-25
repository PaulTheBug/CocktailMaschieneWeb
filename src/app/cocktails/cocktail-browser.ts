import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';

import { Cocktail } from '../../models';
import { CocktailApi } from '../services/cocktail-api';
import { ToastService } from '../shared/toast';
import { LoadingSpinner } from '../shared/loading-spinner';
import { BusyOverlay } from '../shared/busy-overlay';
import { CocktailCard } from './cocktail-card';
import { CocktailDialog } from './cocktail-dialog';

/**
 * Zeigt die verfügbaren Cocktails (gefiltert nach `alcoholic`), öffnet den
 * Detail-Dialog und wickelt eine Bestellung samt Ladeanimation ab.
 */
@Component({
  selector: 'app-cocktail-browser',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoadingSpinner, BusyOverlay, CocktailCard, CocktailDialog],
  template: `
    @if (resource.isLoading()) {
      <app-loading-spinner label="Cocktails werden geladen …" />
    } @else if (resource.error()) {
      <div class="alert alert-error">
        <span>Verbindung zum Backend fehlgeschlagen. Läuft der Flask-Server auf Port 5000?</span>
        <button type="button" class="btn btn-sm" (click)="resource.reload()">
          Erneut versuchen
        </button>
      </div>
    } @else if (resource.value().length === 0) {
      <div class="py-16 text-center text-base-content/60">
        <p class="text-lg">Keine mixbaren Getränke verfügbar.</p>
      </div>
    } @else {
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        @for (cocktail of resource.value(); track cocktail.id) {
          <app-cocktail-card [cocktail]="cocktail" (select)="selected.set($event)" />
        }
      </div>
    }

    <app-cocktail-dialog
      [cocktail]="selected()"
      (order)="placeOrder($event)"
      (close)="selected.set(null)"
    />

    <app-busy-overlay [active]="busy()" [label]="busyLabel()" />
  `,
})
export class CocktailBrowser {
  /** `true` = alkoholische Cocktails, `false` = Mocktails. */
  readonly alcoholic = input.required<boolean>();

  private readonly api = inject(CocktailApi);
  private readonly toasts = inject(ToastService);

  private readonly filter = computed<boolean | undefined>(() => this.alcoholic());
  protected readonly resource = this.api.cocktailsResource(this.filter);

  protected readonly selected = signal<Cocktail | null>(null);
  protected readonly busy = signal(false);
  protected readonly busyLabel = signal('');

  protected async placeOrder(cocktail: Cocktail): Promise<void> {
    if (this.busy()) return;
    this.selected.set(null);
    this.busyLabel.set(cocktail.name);
    this.busy.set(true);

    try {
      const response = await this.api.order(cocktail.id);
      if (response.instructions?.length) {
        this.toasts.show('Manuelle Schritte', response.instructions.join(' · '), 'warning', 8000);
      }
      // Fortschrittsbalken (17 s) im Overlay abwarten, dann Füllstände neu laden.
      await new Promise((resolve) => setTimeout(resolve, 17_000));
      this.toasts.success('Fertig', `${cocktail.name} ist bereit. Guten Durst!`);
      this.resource.reload();
    } catch {
      this.toasts.error('Fehler', 'Bestellung fehlgeschlagen.');
    } finally {
      this.busy.set(false);
    }
  }
}
