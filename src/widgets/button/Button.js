/**
 * Reusable Button Widget
 * Supports variants (primary, secondary, outline, text, danger), sizes, loading state, and icons.
 */
import { createElement } from '../../core/dom.js';

export class Button {
  /**
   * @param {Object} options
   * @param {string} [options.label] - Button text
   * @param {'primary'|'secondary'|'outline'|'text'|'danger'} [options.variant='primary']
   * @param {'sm'|'md'|'lg'} [options.size='md']
   * @param {string} [options.iconLeft] - SVG or icon string
   * @param {string} [options.iconRight] - SVG or icon string
   * @param {boolean} [options.disabled=false]
   * @param {boolean} [options.loading=false]
   * @param {boolean} [options.fullWidth=false]
   * @param {string} [options.dataI18n] - i18n key for automatic translations
   * @param {string} [options.type='button']
   * @param {string} [options.className]
   * @param {Function} [options.onClick]
   */
  constructor(options = {}) {
    this.options = {
      variant: 'primary',
      size: 'md',
      type: 'button',
      disabled: false,
      loading: false,
      fullWidth: false,
      ...options
    };

    this.isLoading = this.options.loading;
    this.element = this.render();
  }

  render() {
    const { variant, size, fullWidth, disabled, type, className, onClick } = this.options;

    const classes = [
      'app-btn',
      `app-btn--${variant}`,
      `app-btn--${size}`,
      fullWidth ? 'app-btn--full' : '',
      className
    ];

    const btn = createElement('button', {
      className: classes,
      attributes: {
        type,
        ...(disabled ? { disabled: 'true' } : {})
      },
      on: {
        click: (e) => {
          if (!this.isLoading && !this.options.disabled && typeof onClick === 'function') {
            onClick(e, this);
          }
        }
      }
    });

    this.updateContent(btn);
    return btn;
  }

  updateContent(btn = this.element) {
    btn.innerHTML = '';

    if (this.isLoading) {
      btn.appendChild(createElement('span', { className: 'app-btn__spinner' }));
      btn.appendChild(document.createTextNode(' '));
    }

    if (this.options.iconLeft && !this.isLoading) {
      const iconSpan = createElement('span', { className: 'app-btn__icon', html: this.options.iconLeft });
      btn.appendChild(iconSpan);
    }

    if (this.options.label) {
      const textSpan = createElement('span', {
        className: 'app-btn__label',
        text: this.options.label,
        attributes: this.options.dataI18n ? { 'data-i18n': this.options.dataI18n } : {}
      });
      btn.appendChild(textSpan);
    }

    if (this.options.iconRight && !this.isLoading) {
      const iconSpan = createElement('span', { className: 'app-btn__icon', html: this.options.iconRight });
      btn.appendChild(iconSpan);
    }
  }

  setLoading(loading) {
    this.isLoading = loading;
    this.element.disabled = loading || this.options.disabled;
    this.updateContent();
  }

  setDisabled(disabled) {
    this.options.disabled = disabled;
    this.element.disabled = disabled || this.isLoading;
  }

  setLabel(text) {
    this.options.label = text;
    this.updateContent();
  }

  getElement() {
    return this.element;
  }
}
