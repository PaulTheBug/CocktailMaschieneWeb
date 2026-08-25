import { ChangeDetectionStrategy, Component } from '@angular/core';

import { CocktailBrowser } from '../cocktails/cocktail-browser';

@Component({
  selector: 'app-mocktails',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CocktailBrowser],
  templateUrl: './mocktails.html',
})
export class Mocktails {}
