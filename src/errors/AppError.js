/**
 * Application Error Classes
 * Structured error hierarchy for predictable error handling across layers.
 */

export class AppError extends Error {
  /**
   * @param {string} message - Human-readable or translation-key error message
   * @param {string} [code] - Machine-readable error code
   * @param {number} [status] - HTTP or logical status code
   * @param {Object} [details] - Additional contextual data
   */
  constructor(message, code = 'APP_ERROR', status = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.details = details;
    this.timestamp = new Date().toISOString();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class NetworkError extends AppError {
  constructor(message = 'errors.network', details = null) {
    super(message, 'NETWORK_ERROR', 0, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'errors.validation', fieldErrors = {}) {
    super(message, 'VALIDATION_ERROR', 400, fieldErrors);
    this.fieldErrors = fieldErrors;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'errors.notFound', details = null) {
    super(message, 'NOT_FOUND', 404, details);
  }
}

export class AuthError extends AppError {
  constructor(message = 'errors.unauthorized', details = null) {
    super(message, 'UNAUTHORIZED', 401, details);
  }
}
