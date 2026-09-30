/**
 * Reusable Chip Widget
 * Used for tags, filters, badges, and removable selections.
 */
import { createElement } from '../../core/dom.js';

export class Chip {
  /**
   * @param {Object} options
   * @param {string} options.label - Text label
   * @param {'default'|'primary'|'success'|'warning'|'error'|'info'} [options.variant='default']
   * @param {string} [options.icon] - Leading icon (svg or text)
   * @param {boolean} [options.selectable=false] - If true, toggles active/selected state
   * @param {boolean} [options.selected=false] - Initial selected state
   * @param {boolean} [options.removable=false] - Displays close icon
   * @param {string} [options.dataI18n] - i18n key for localization
   * @param {Function} [options.onClick] - (selected, chipInstance) => void
   * @param {Function} [options.onRemove] - (chipInstance) => void
   */
  constructor(options = {}) {
    this.options = {
      variant: 'default',
      selectable: false,
      selected: false,
      removable: false,
      ...options
    };

    this.isSelected = this.options.selected;
    this.element = this.render();
  }

  render() {
    const { variant, selectable, removable, icon, label, dataI18n, onClick, onRemove } = this.options;
    const isClickable = selectable || typeof onClick === 'function';

    const classes = [
      'app-chip',
      `app-chip--${variant}`,
      isClickable ? 'app-chip--clickable' : '',
      this.isSelected ? 'app-chip--selected' : ''
    ];

    const chip = createElement('div', {
      className: classes,
      on: {
        click: (e) => {
          // If click was on remove button, do not toggle selection
          if (e.target.closest('.app-chip__remove')) return;

          if (selectable) {
            this.toggle();
          }
          if (typeof onClick === 'function') {
            onClick(this.isSelected, this);
          }
        }
      }
    });

    // Icon
    if (icon) {
      chip.appendChild(createElement('span', { className: 'app-chip__icon', html: icon }));
    }

    // Label
    const labelEl = createElement('span', {
      className: 'app-chip__label',
      text: label,
      attributes: dataI18n ? { 'data-i18n': dataI18n } : {}
    });
    chip.appendChild(labelEl);

    // Remove button
    if (removable) {
      const removeBtn = createElement('button', {
        className: 'app-chip__remove',
        text: '✕',
        attributes: { type: 'button', 'aria-label': 'Remove' },
        on: {
          click: (e) => {
            e.stopPropagation();
            if (typeof onRemove === 'function') {
              onRemove(this);
            } else {
              this.remove();
            }
          }
        }
      });
      chip.appendChild(removeBtn);
    }

    return chip;
  }

  toggle() {
    this.isSelected = !this.isSelected;
    this.element.classList.toggle('app-chip--selected', this.isSelected);
    return this.isSelected;
  }

  setSelected(selected) {
    this.isSelected = selected;
    this.element.classList.toggle('app-chip--selected', selected);
  }

  remove() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }
}
