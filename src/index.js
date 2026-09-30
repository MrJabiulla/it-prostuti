/**
 * Clean Architecture UI Kit & Framework
 * Master barrel export for easy importing.
 */

// Core
export { createElement, qs, qsa } from './core/dom.js';
export { eventBus } from './core/eventBus.js';

// Theme
export { colors } from './theme/colors.js';
export { typography } from './theme/typography.js';
export { themeManager } from './theme/themeManager.js';

// Localization (i18n)
export { i18n } from './localization/i18n.js';

// Widgets
export { Container } from './widgets/container/Container.js';
export { Button } from './widgets/button/Button.js';
export { Chip } from './widgets/chip/Chip.js';
export { Dialog } from './widgets/dialog/Dialog.js';
export { Snackbar } from './widgets/snackbar/Snackbar.js';

// Error Handling
export {
  AppError,
  NetworkError,
  ValidationError,
  NotFoundError,
  AuthError
} from './errors/AppError.js';
export { errorHandler } from './errors/errorHandler.js';
