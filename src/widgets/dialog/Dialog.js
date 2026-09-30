/**
 * Reusable Dialog (Modal) Widget
 * Provides modal dialogs with backdrop blur, custom actions, keyboard ESC dismissal,
 * and convenient static helpers.
 */
import { createElement } from '../../core/dom.js';
import { Button } from '../button/Button.js';
import { i18n } from '../../localization/i18n.js';

export class Dialog {
  /**
   * @param {Object} options
   * @param {string} [options.title] - Dialog title
   * @param {string|HTMLElement} [options.content] - Dialog content (text, HTML, or element)
   * @param {Array<Object|Button>} [options.actions] - Array of action button configurations
   * @param {boolean} [options.dismissible=true] - Close on outside click or ESC
   * @param {Function} [options.onClose] - Callback when closed
   */
  constructor(options = {}) {
    this.options = {
      title: '',
      dismissible: true,
      ...options
    };

    this.isOpen = false;
    this.keydownHandler = this.handleKeydown.bind(this);
    this.render();
  }

  render() {
    // Backdrop Overlay
    this.overlay = createElement('div', {
      className: 'app-dialog-overlay',
      attributes: { role: 'dialog', 'aria-modal': 'true' },
      on: {
        click: (e) => {
          if (this.options.dismissible && e.target === this.overlay) {
            this.close();
          }
        }
      }
    });

    // Dialog Box
    this.box = createElement('div', { className: 'app-dialog' });

    // Header
    const header = createElement('div', { className: 'app-dialog__header' });
    const title = createElement('h2', { className: 'app-dialog__title', text: this.options.title });
    header.appendChild(title);

    if (this.options.dismissible) {
      const closeBtn = createElement('button', {
        className: 'app-dialog__close',
        text: '✕',
        attributes: { type: 'button', 'aria-label': 'Close dialog' },
        on: { click: () => this.close() }
      });
      header.appendChild(closeBtn);
    }
    this.box.appendChild(header);

    // Body
    this.body = createElement('div', { className: 'app-dialog__body' });
    if (this.options.content) {
      if (this.options.content instanceof HTMLElement) {
        this.body.appendChild(this.options.content);
      } else {
        this.body.innerHTML = this.options.content;
      }
    }
    this.box.appendChild(this.body);

    // Footer Actions
    if (this.options.actions && this.options.actions.length > 0) {
      const footer = createElement('div', { className: 'app-dialog__footer' });
      this.options.actions.forEach(actionConfig => {
        if (actionConfig instanceof Button) {
          footer.appendChild(actionConfig.getElement());
        } else {
          const btn = new Button({
            label: actionConfig.label,
            variant: actionConfig.variant || 'outline',
            onClick: () => {
              if (typeof actionConfig.onClick === 'function') {
                actionConfig.onClick(this);
              } else {
                this.close();
              }
            }
          });
          footer.appendChild(btn.getElement());
        }
      });
      this.box.appendChild(footer);
    }

    this.overlay.appendChild(this.box);
  }

  handleKeydown(e) {
    if (e.key === 'Escape' && this.options.dismissible) {
      this.close();
    }
  }

  open() {
    if (this.isOpen) return;
    document.body.appendChild(this.overlay);

    // Force layout reflow for animation
    void this.overlay.offsetWidth;
    this.overlay.classList.add('app-dialog-overlay--visible');

    window.addEventListener('keydown', this.keydownHandler);
    this.isOpen = true;
  }

  close() {
    if (!this.isOpen) return;
    this.overlay.classList.remove('app-dialog-overlay--visible');
    window.removeEventListener('keydown', this.keydownHandler);

    setTimeout(() => {
      if (this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
      }
      this.isOpen = false;
      if (typeof this.options.onClose === 'function') {
        this.options.onClose();
      }
    }, 200);
  }

  /**
   * Static helper: Confirm Dialog
   * @param {Object} options
   * @returns {Promise<boolean>}
   */
  static confirm({ title, message, confirmText, cancelText, variant = 'primary' }) {
    return new Promise((resolve) => {
      const dialog = new Dialog({
        title: title || i18n.t('dialog.confirmTitle'),
        content: message || i18n.t('dialog.confirmMessage'),
        actions: [
          {
            label: cancelText || i18n.t('common.cancel'),
            variant: 'outline',
            onClick: (d) => {
              d.close();
              resolve(false);
            }
          },
          {
            label: confirmText || i18n.t('common.confirm'),
            variant: variant,
            onClick: (d) => {
              d.close();
              resolve(true);
            }
          }
        ],
        onClose: () => resolve(false)
      });
      dialog.open();
    });
  }

  /**
   * Static helper: Alert Dialog
   * @param {Object} options
   * @returns {Promise<void>}
   */
  static alert({ title, message, buttonText = i18n.t('common.close') }) {
    return new Promise((resolve) => {
      const dialog = new Dialog({
        title: title || i18n.t('dialog.alertTitle'),
        content: message,
        actions: [
          {
            label: buttonText,
            variant: 'primary',
            onClick: (d) => {
              d.close();
              resolve();
            }
          }
        ],
        onClose: () => resolve()
      });
      dialog.open();
    });
  }
}
