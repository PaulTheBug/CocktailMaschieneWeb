import { Injectable, Signal, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../core/api.config';
import {
  Cocktail,
  IngredientStatus,
  MachineStatus,
  OrderResponse,
  PinCheckResponse,
  PinChangeResponse,
  PinPurpose,
} from '../../models';

/**
 * Zentraler Zugriff auf die Flask-REST-API.
 *
 * Für reaktive Listen (`GET`) werden `httpResource`s zurückgegeben, die
 * automatisch neu laden, sobald sich die übergebenen Signale ändern und die
 * einen `isLoading()`-Status für Ladeanimationen bereitstellen. Aktionen
 * (`POST`) laufen als Promise.
 */
@Injectable({ providedIn: 'root' })
export class CocktailApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  imageUrl(cocktailId: number): string {
    return `${this.base}/cocktails/${cocktailId}/image`;
  }

  /** Reaktive Cocktail-Liste, optional gefiltert nach `alkoholisch`. */
  cocktailsResource(alcoholic: Signal<boolean | undefined>) {
    return httpResource<Cocktail[]>(
      () => {
        const alk = alcoholic();
        const params: Record<string, string> = {};
        if (alk !== undefined) params['alkoholisch'] = String(alk);
        return { url: `${this.base}/cocktails`, params };
      },
      { defaultValue: [] },
    );
  }

  /** Reaktive Füllstände aller Zutaten. */
  ingredientsResource() {
    return httpResource<IngredientStatus[]>(() => `${this.base}/ingredients`, {
      defaultValue: [],
    });
  }

  /** Statistik der Maschine. */
  statusResource() {
    return httpResource<MachineStatus>(() => `${this.base}/status`);
  }

  /** Bestellung auslösen – das Backend mixt im Hintergrund-Thread. */
  order(cocktailId: number): Promise<OrderResponse> {
    return firstValueFrom(
      this.http.post<OrderResponse>(`${this.base}/order`, { cocktail_id: cocktailId }),
    );
  }

  /** PIN prüfen (`alcohol` schaltet Cocktails frei, `admin` den Adminbereich). */
  checkPin(pin: string, purpose: PinPurpose): Promise<PinCheckResponse> {
    return firstValueFrom(
      this.http.post<PinCheckResponse>(`${this.base}/check-pin`, { pin, purpose }),
    );
  }

  /** Alkohol-PIN ändern. */
  changePin(oldPin: string, newPin: string): Promise<PinChangeResponse> {
    return firstValueFrom(
      this.http.post<PinChangeResponse>(`${this.base}/change-pin`, {
        old_pin: oldPin,
        new_pin: newPin,
      }),
    );
  }

  changeAdminPin(oldPin: string, newPin: string): Promise<PinChangeResponse> {
    return firstValueFrom(
      this.http.post<PinChangeResponse>(`${this.base}/change-admin-pin`, {
        old_pin: oldPin,
        new_pin: newPin,
      }),
    );
  }

  /** Füllstand einer Zutat auf einen festen Wert setzen. */
  setIngredientLevel(ingredientId: number, level: number): Promise<unknown> {
    return firstValueFrom(
      this.http.post(`${this.base}/ingredients/set`, { ingredient_id: ingredientId, level }),
    );
  }

  /** Zutat additiv auffüllen. */
  refillIngredient(ingredientId: number, amount: number): Promise<unknown> {
    return firstValueFrom(
      this.http.post(`${this.base}/ingredients/refill`, { ingredient_id: ingredientId, amount }),
    );
  }

  /** Alle Zutaten auf einen Wert setzen. */
  refillAll(level: number): Promise<unknown> {
    return firstValueFrom(this.http.post(`${this.base}/ingredients/refill_all`, { level }));
  }

  /** Pumpe einschalten (Admin-Priming). */
  startPump(pumpId: number): Promise<unknown> {
    return firstValueFrom(this.http.post(`${this.base}/pump/${pumpId}/start`, {}));
  }

  /** Pumpe ausschalten. */
  stopPump(pumpId: number): Promise<unknown> {
    return firstValueFrom(this.http.post(`${this.base}/pump/${pumpId}/stop`, {}));
  }

  /** Pumpe testweise laufen lassen. */
  testPump(pumpId: number): Promise<unknown> {
    return firstValueFrom(this.http.post(`${this.base}/test-pump/${pumpId}`, {}));
  }

  /** Einzelne Pumpe für einen kurzen Reinigungsdurchlauf laufen lassen. */
  cleanPump(
    pumpId: number,
    durationSec: number,
  ): Promise<{ success: boolean; pump_id: number; duration_sec: number }> {
    return firstValueFrom(
      this.http.post<{ success: boolean; pump_id: number; duration_sec: number }>(
        `${this.base}/pump/${pumpId}/clean`,
        { duration_sec: durationSec },
      ),
    );
  }

  /** Alle Pumpen nacheinander für einen kurzen Reinigungsdurchlauf laufen lassen. */
  cleanAllPumps(
    durationSec: number,
  ): Promise<{ success: boolean; pump_count: number; duration_sec: number; message: string }> {
    return firstValueFrom(
      this.http.post<{
        success: boolean;
        pump_count: number;
        duration_sec: number;
        message: string;
      }>(`${this.base}/pump/clean-all`, { duration_sec: durationSec }),
    );
  }
}
