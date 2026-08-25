export type PinPurpose = 'alcohol' | 'admin';

/** Antwort von `POST /api/check-pin`. */
export interface PinCheckResponse {
  valid: boolean;
  message: string;
}

/** Antwort von `POST /api/change-pin`. */
export interface PinChangeResponse {
  success: boolean;
  message: string;
}
