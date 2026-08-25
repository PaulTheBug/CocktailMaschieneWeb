/** Flüssige Zutat eines Cocktails, die per Pumpe dosiert wird. */
export interface LiquidIngredient {
  pump_id: number;
  ingredient_id: number;
  ingredient_name: string;
  amount_ml: number;
  is_liquid: true;
}

/** Manuell hinzuzufügende Zutat (z. B. Limette, Minze) inkl. Anweisung. */
export interface ManualIngredient {
  ingredient_id: number;
  ingredient_name: string;
  amount_ml: number;
  is_liquid: false;
  instruction: string;
}

/** Ein mixbarer Cocktail, wie ihn `GET /api/cocktails` liefert. */
export interface Cocktail {
  id: number;
  name: string;
  image_path: string;
  alkoholisch: boolean;
  description: string;
  glass_size_ml: number;
  liquid_recipe: LiquidIngredient[];
  manual_ingredients: ManualIngredient[];
  requires_manual_steps: boolean;
}

/** Statistik von `GET /api/status`. */
export interface MachineStatus {
  is_mixing: boolean;
  total_cocktails: number;
  alcoholic_cocktails: number;
  non_alcoholic_cocktails: number;
}
