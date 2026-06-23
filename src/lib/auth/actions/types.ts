/**
 * Result of a successful authentication or registration action.
 * Generic `T` allows attaching extra data (e.g. TOTP URI, backup codes).
 */
export interface AuthSuccessResult<T = undefined> {
  success: true;
  message?: string;
  data?: T;
}

/**
 * Result of a failed authentication or registration action.
 */
export interface AuthErrorResult {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/**
 * Union type for all auth action results.
 */
export type AuthActionResult<T = undefined> = AuthSuccessResult<T> | AuthErrorResult;
