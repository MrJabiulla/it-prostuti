/**
 * Centralized Error Handler
 * Catches, parses, logs, and displays friendly error feedback to the user.
 */
import { AppError } from './AppError.js';
import { i18n } from '../localization/i18n.js';
import { eventBus } from '../core/eventBus.js';

class ErrorHandler {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Initialize global listeners for unhandled errors
   */
  initGlobalCatchers() {
    if (this.isInitialized) return;

    window.addEventListener('error', (event) => {
      this.handle(event.error || new AppError(event.message));
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.handle(event.reason || new AppError('Unhandled Promise Rejection'));
    });

    this.isInitialized = true;
  }

  /**
   * Handle an error object and notify the application
   * @param {Error|AppError|string} error 
   * @param {Object} [options]
   * @param {boolean} [options.silent=false] - If true, do not show UI feedback
   */
  handle(error, options = { silent: false }) {
    // Normalize to an AppError or standard structure
    let friendlyMessage = '';
    let errorCode = 'UNKNOWN';

    if (error instanceof AppError) {
      errorCode = error.code;
      friendlyMessage = error.message.includes('.') ? i18n.t(error.message) : error.message;
    } else if (error instanceof Error) {
      errorCode = error.name;
      friendlyMessage = error.message || i18n.t('errors.default');
    } else if (typeof error === 'string') {
      friendlyMessage = error.includes('.') ? i18n.t(error) : error;
    } else {
      friendlyMessage = i18n.t('errors.default');
    }

    // Safe console logging for developers
    console.error(`[ErrorHandler] [${errorCode}]`, error);

    // Broadcast error event so UI (like Snackbar or Dialog) can display it
    if (!options.silent) {
      eventBus.emit('app:error', {
        message: friendlyMessage,
        rawError: error,
        code: errorCode
      });
    }

    return {
      code: errorCode,
      message: friendlyMessage
    };
  }
}

export const errorHandler = new ErrorHandler();
