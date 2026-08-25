import { Injectable, inject, signal } from '@angular/core';

import { PinPurpose } from '../../models';
import { CocktailApi } from './cocktail-api';

@Injectable({ providedIn: 'root' })
export class PasswordManager {
  private readonly api = inject(CocktailApi);

  readonly adminAuthenticated = signal(false);
  readonly alcoholUnlocked = signal(false);
  readonly checking = signal(false);

  async authenticate(pin: string, purpose: PinPurpose): Promise<boolean> {
    if (this.checking()) return false;

    this.checking.set(true);
    try {
      const response = await this.api.checkPin(pin, purpose);
      if (response.valid) {
        if (purpose === 'admin') this.adminAuthenticated.set(true);
        if (purpose === 'alcohol') this.alcoholUnlocked.set(true);
      }
      return response.valid;
    } finally {
      this.checking.set(false);
    }
  }

  logout(): void {
    this.adminAuthenticated.set(false);
    this.alcoholUnlocked.set(false);
  }
}
