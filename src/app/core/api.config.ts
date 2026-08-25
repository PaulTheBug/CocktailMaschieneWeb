import { InjectionToken } from '@angular/core';

/** Basis-URL der Flask-REST-API (siehe Cocktailmixer_LF12a/py/scripts/backend). */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => 'http://127.0.0.1:5000/api',
});
