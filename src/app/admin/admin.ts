import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CocktailApi } from '../services/cocktail-api';
import { PasswordManager } from '../services/password-manager';
import { ToastService } from '../shared/toast';
import { PinPad } from '../shared/pin-pad';
import { LoadingSpinner } from '../shared/loading-spinner';

type AdminTab = 'levels' | 'settings' | 'pumps';

/** Admin-Panel: Füllstände, PIN-Verwaltung und Pumpen-Priming. */
@Component({
  selector: 'app-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PinPad, LoadingSpinner],
  templateUrl: './admin.html',
})
export class Admin {
  private readonly api = inject(CocktailApi);
  protected readonly passwordManager = inject(PasswordManager);
  private readonly toasts = inject(ToastService);

  protected readonly unlocked = this.passwordManager.adminAuthenticated;
  protected readonly tab = signal<AdminTab>('levels');
  protected readonly ingredients = this.api.ingredientsResource();

  protected readonly refillControl = new FormControl(2000, { nonNullable: true });
  protected readonly pinForm = new FormGroup({
    oldPin: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{4}$/)],
    }),
    newPin: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{4}$/)],
    }),
  });
  protected readonly adminPinForm = new FormGroup({
    oldPin: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{4}$/)],
    }),
    newPin: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{4}$/)],
    }),
  });

  protected readonly pumpIds = Array.from({ length: 16 }, (_, i) => i);
  protected readonly activePump = signal<number | null>(null);

  protected async onAdminPin(pin: string): Promise<void> {
    try {
      const valid = await this.passwordManager.authenticate(pin, 'admin');
      if (valid) {
        return;
      } else {
        this.toasts.error('Zugriff verweigert', 'Admin-PIN ist falsch.');
      }
    } catch {
      this.toasts.error('Serverfehler', 'PIN konnte nicht überprüft werden.');
    }
  }

  protected async setLevel(ingredientId: number, level: number): Promise<void> {
    try {
      await this.api.setIngredientLevel(ingredientId, level);
      this.toasts.success('Gespeichert', `Zutat ${ingredientId} auf ${level} ml gesetzt.`);
      this.ingredients.reload();
    } catch {
      this.toasts.error('Fehler', 'Füllstand konnte nicht gesetzt werden.');
    }
  }

  protected async refillAll(): Promise<void> {
    const level = this.refillControl.value;
    try {
      await this.api.refillAll(level);
      this.toasts.success('Aufgefüllt', `Alle Zutaten auf ${level} ml gesetzt.`);
      this.ingredients.reload();
    } catch {
      this.toasts.error('Fehler', 'Auffüllen fehlgeschlagen.');
    }
  }

  protected async savePin(): Promise<void> {
    if (this.pinForm.invalid) {
      this.toasts.error('Ungültig', 'Beide PINs müssen aus genau 4 Ziffern bestehen.');
      return;
    }
    const { oldPin, newPin } = this.pinForm.getRawValue();
    try {
      const res = await this.api.changePin(oldPin, newPin);
      if (res.success) {
        this.toasts.success('PIN geändert', res.message);
        this.pinForm.reset();
      } else {
        this.toasts.error('Fehler', res.message);
      }
    } catch {
      this.toasts.error('Fehler', 'PIN konnte nicht geändert werden.');
    }
  }

  protected async saveAdminPin(): Promise<void> {
    if (this.adminPinForm.invalid) {
      this.toasts.error('Ungültig', 'Beide Admin-PINs müssen aus genau 4 Ziffern bestehen.');
      return;
    }
    const { oldPin, newPin } = this.adminPinForm.getRawValue();
    try {
      const response = await this.api.changeAdminPin(oldPin, newPin);
      if (response.success) {
        this.toasts.success('Admin-PIN geändert', response.message);
        this.adminPinForm.reset();
      } else {
        this.toasts.error('Fehler', response.message);
      }
    } catch {
      this.toasts.error('Fehler', 'Admin-PIN konnte nicht geändert werden.');
    }
  }

  protected async startPump(pumpId: number): Promise<void> {
    this.activePump.set(pumpId);
    try {
      await this.api.startPump(pumpId);
    } catch {
      this.activePump.set(null);
      this.toasts.error('Fehler', `Pumpe ${pumpId} konnte nicht gestartet werden.`);
    }
  }

  protected async stopPump(pumpId: number): Promise<void> {
    if (this.activePump() !== pumpId) return;
    this.activePump.set(null);
    try {
      await this.api.stopPump(pumpId);
    } catch {
      this.toasts.error('Fehler', `Pumpe ${pumpId} konnte nicht gestoppt werden.`);
    }
  }
}
