import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Cocktail } from '../../models';
import { CocktailApi } from '../services/cocktail-api';

/** Auswählbare Kachel für einen Cocktail. */
@Component({
  selector: 'app-cocktail-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="card bg-base-200 shadow-md transition-transform hover:-translate-y-1 hover:shadow-xl focus-visible:outline-primary"
      (click)="select.emit(cocktail())"
    >
      <figure class="aspect-square overflow-hidden bg-base-300">
        <img
          class="size-full object-cover"
          [src]="api.imageUrl(cocktail().id)"
          [alt]="cocktail().name"
          draggable="false"
          (error)="onImageError($event)"
        />
      </figure>
      <div class="card-body items-center p-4">
        <h3 class="card-title text-center text-base">{{ cocktail().name }}</h3>
        @if (cocktail().alkoholisch) {
          <span class="badge badge-secondary badge-sm">Alkoholisch</span>
        }
      </div>
    </button>
  `,
})
export class CocktailCard {
  protected readonly api = inject(CocktailApi);
  readonly cocktail = input.required<Cocktail>();
  readonly select = output<Cocktail>();

  protected onImageError(event: Event): void {
    (event.target as HTMLImageElement).src =
      'https://placehold.co/256x256/1e1b2e/ffffff?text=Cocktail';
  }
}
