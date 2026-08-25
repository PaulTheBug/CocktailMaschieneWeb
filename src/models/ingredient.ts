/** Füllstand einer Zutat, wie ihn `GET /api/ingredients` liefert. */
export interface IngredientStatus {
  ingredient_id: number;
  ingredient_name: string;
  is_liquid: boolean;
  current_level: number;
  max_level: number;
  pump_id: number | null;
}
