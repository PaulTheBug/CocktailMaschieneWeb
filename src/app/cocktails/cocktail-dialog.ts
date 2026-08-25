import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Cocktail } from '../../models';
import { CocktailApi } from '../services/cocktail-api';

/** Detail-Dialog eines Cocktails inkl. Zutatenliste und Bestell-Button. */
@Component({
  selector: 'app-cocktail-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'close.emit()' },
  template: `
    @if (cocktail(); as drink) {
      <div class="fixed inset-0 z-30 flex items-center justify-center p-4">
        <button
          type="button"
          class="absolute inset-0 bg-base-100/80 backdrop-blur-sm"
          aria-label="Dialog schließen"
          (click)="close.emit()"
        ></button>

        <div
          class="relative z-10 card w-full max-w-2xl bg-base-200 shadow-2xl"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="drink.name"
        >
          <div class="card-body gap-4">
            <div class="flex flex-col gap-4 sm:flex-row">
              <img
                class="aspect-square w-40 shrink-0 self-center rounded-box bg-base-300 object-cover"
                [src]="api.imageUrl(drink.id)"
                [alt]="drink.name"
                draggable="false"
                (error)="onImageError($event)"
              />
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <h2 class="card-title text-2xl">{{ drink.name }}</h2>
                  @if (drink.alkoholisch) {
                    <span class="badge badge-secondary">Alkoholisch</span>
                  }
                </div>
                <p class="text-base-content/80">
                  {{ drink.description || 'Keine Beschreibung verfügbar.' }}
                </p>
                <span class="text-sm text-base-content/60"
                  >Glasgröße: {{ drink.glass_size_ml }} ml</span
                >
              </div>
            </div>

            <div class="divider my-0">Zutaten</div>

            <ul class="grid gap-1 sm:grid-cols-2">
              @for (item of drink.liquid_recipe; track item.ingredient_id) {
                <li class="flex justify-between rounded-field bg-base-300 px-3 py-1.5">
                  <span>{{ item.ingredient_name }}</span>
                  <span class="text-base-content/60">{{ item.amount_ml }} ml</span>
                </li>
              }
              @for (item of drink.manual_ingredients; track item.ingredient_id) {
                <li class="flex justify-between rounded-field bg-base-300 px-3 py-1.5">
                  <span>{{ item.ingredient_name }}</span>
                  <span class="badge badge-warning badge-sm">manuell</span>
                </li>
              }
            </ul>

            @if (manualSteps().length) {
              <div class="alert alert-warning">
                <div>
                  <h3 class="font-semibold">Manuelle Schritte nötig:</h3>
                  <ul class="list-inside list-disc text-sm">
                    @for (step of manualSteps(); track $index) {
                      <li>{{ step }}</li>
                    }
                  </ul>
                </div>
              </div>
            }

            <div class="card-actions justify-end">
              <button type="button" class="btn btn-ghost" (click)="close.emit()">Schließen</button>
              <button type="button" class="btn btn-primary" (click)="order.emit(drink)">
                Bestellen
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class CocktailDialog {
  protected readonly api = inject(CocktailApi);
  readonly cocktail = input.required<Cocktail | null>();
  readonly order = output<Cocktail>();
  readonly close = output<void>();

  protected readonly manualSteps = computed(
    () => this.cocktail()?.manual_ingredients.map((i) => i.instruction) ?? [],
  );

  protected onImageError(event: Event): void {
    (event.target as HTMLImageElement).src =
      'https://placehold.co/256x256/1e1b2e/ffffff?text=Cocktail';
  }
}
