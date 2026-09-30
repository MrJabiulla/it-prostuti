/**
 * Reusable Snackbar (Toast) Widget
 * Notification message system with auto-dismissal, icons, actions, and global container.
 */
import { createElement } from '../../core/dom.js';
import { eventBus } from '../../core/eventBus.js';

class SnackbarManager {
  constructor() {
    this.container = null;
    this.initListeners();
  }

  ensureContainer() {
    if (!this.container || !document.body.contains(this.container)) {
      this.container = createElement('div', {
        className: 'app-snackbar-container',
        attributes: { 'aria-live': 'polite', 'aria-atomic': 'true' }
      });
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  initListeners() {
    // Automatically display error snackbars when any AppError is broadcasted
    eventBus.on('app:error', ({ message }) => {
      this.show({ message, type: 'error' });
    });
  }

  getIcon(type) {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '⚠';
      case 'warning':
        return '⚡';
      case 'info':
        return 'ℹ';
      default:
        return '●';
    }
  }

  /**
   * Show a snackbar message
   * @param {Object} options
   * @param {string} options.message - The text message
   * @param {'default'|'success'|'error'|'warning'|'info'} [options.type='default']
   * @param {number} [options.duration=4000] - Duration in ms (0 for persistent)
   * @param {Object} [options.action] - Optional action { label, onClick }
   * @returns {HTMLElement}
   */
  show(options) {
    const {
      message,
      type = 'default',
      duration = 4000,
      action
    } = typeof options === 'string' ? { message: options } : options;

    const container = this.ensureContainer();

    const snackbar = createElement('div', {
      className: ['app-snackbar', `app-snackbar--${type}`]
    });

    // Icon
    const iconEl = createElement('span', {
      className: 'app-snackbar__icon',
      text: this.getIcon(type)
    });
    snackbar.appendChild(iconEl);

    // Message
    const msgEl = createElement('div', {
      className: 'app-snackbar__message',
      text: message
    });
    snackbar.appendChild(msgEl);

    // Action button
    if (action && action.label) {
      const actionBtn = createElement('button', {
        className: 'app-snackbar__action',
        text: action.label,
        attributes: { type: 'button' },
        on: {
          click: () => {
            if (typeof action.onClick === 'function') {
              action.onClick();
            }
            dismiss();
          }
        }
      });
      snackbar.appendChild(actionBtn);
    }

    // Dismiss 'x' button
    const closeBtn = createElement('button', {
      className: 'app-snackbar__close',
      text: '✕',
      attributes: { type: 'button', 'aria-label': 'Dismiss' },
      on: { click: () => dismiss() }
    });
    snackbar.appendChild(closeBtn);

    container.appendChild(snackbar);

    // Animation entry
    requestAnimationFrame(() => {
      snackbar.classList.add('app-snackbar--visible');
    });

    let timer = null;

    const dismiss = () => {
      if (timer) clearTimeout(timer);
      snackbar.classList.remove('app-snackbar--visible');
      setTimeout(() => {
        if (snackbar.parentNode) {
          snackbar.parentNode.removeChild(snackbar);
        }
      }, 250);
    };

    if (duration > 0) {
      timer = setTimeout(dismiss, duration);

      // Pause on hover
      snackbar.addEventListener('mouseenter', () => clearTimeout(timer));
      snackbar.addEventListener('mouseleave', () => {
        timer = setTimeout(dismiss, 1500);
      });
    }

    return snackbar;
  }

  success(message, duration) {
    return this.show({ message, type: 'success', duration });
  }

  error(message, duration) {
    return this.show({ message, type: 'error', duration });
  }

  warning(message, duration) {
    return this.show({ message, type: 'warning', duration });
  }

  info(message, duration) {
    return this.show({ message, type: 'info', duration });
  }
}

export const Snackbar = new SnackbarManager();
