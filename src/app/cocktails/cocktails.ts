import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { PasswordManager } from '../services/password-manager';
import { ToastService } from '../shared/toast';
import { PinPad } from '../shared/pin-pad';
import { CocktailBrowser } from './cocktail-browser';
import { LoadingSpinner } from '../shared/loading-spinner';

/** Alkoholische Cocktails – erst nach korrekter PIN freigeschaltet. */
@Component({
  selector: 'app-cocktails',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PinPad, CocktailBrowser, LoadingSpinner],
  templateUrl: './cocktails.html',
})
export class Cocktails {
  protected readonly passwordManager = inject(PasswordManager);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly unlocked = this.passwordManager.alcoholUnlocked;

  protected async onPin(pin: string): Promise<void> {
    try {
      const valid = await this.passwordManager.authenticate(pin, 'alcohol');
      if (valid) {
        return;
      } else {
        this.toasts.error('Zugriff verweigert', 'Die eingegebene PIN ist falsch.');
      }
    } catch {
      this.toasts.error('Serverfehler', 'PIN konnte nicht überprüft werden.');
    }
  }

  protected cancel(): void {
    this.router.navigate(['/home']);
  }
}
