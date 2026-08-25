import { LiquidIngredient, ManualIngredient } from './cocktail';

/** Antwort von `POST /api/order`. */
export interface OrderResponse {
  status: string;
  cocktail: string;
  alkoholisch: boolean;
  volume: string;
  liquid_ingredients: LiquidIngredient[];
  manual_steps: ManualIngredient[];
  message?: string;
  instructions?: string[];
}
