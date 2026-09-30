/**
 * Reusable Container Widget
 * A versatile surface component for wrapping content, cards, panels, and sections.
 */
import { createElement } from '../../core/dom.js';

export class Container {
  /**
   * @param {Object} options
   * @param {'surface'|'elevated'|'outlined'|'flat'} [options.variant='surface']
   * @param {'none'|'sm'|'md'|'lg'} [options.padding='md']
   * @param {'none'|'sm'|'md'|'lg'} [options.radius='md']
   * @param {string} [options.title]
   * @param {string} [options.subtitle]
   * @param {HTMLElement|string} [options.headerAction]
   * @param {HTMLElement|string|Array<HTMLElement|string>} [options.content]
   * @param {HTMLElement|string} [options.footer]
   * @param {string} [options.className]
   * @param {Object} [options.style]
   * @param {Object} [options.attributes]
   */
  constructor(options = {}) {
    this.options = {
      variant: 'surface',
      padding: 'md',
      radius: 'md',
      ...options
    };

    this.element = this.render();
  }

  render() {
    const { variant, padding, radius, title, subtitle, headerAction, content, footer, className, style, attributes } = this.options;

    const classes = [
      'app-container',
      `app-container--${variant}`,
      `app-container--p-${padding}`,
      `app-container--r-${radius}`,
      className
    ];

    const containerEl = createElement('div', {
      className: classes,
      style,
      attributes
    });

    // Render Header if title or subtitle or action exists
    if (title || subtitle || headerAction) {
      const headerEl = createElement('div', { className: 'app-container__header' });
      const titleGroup = createElement('div', { className: 'app-container__title-group' });

      if (title) {
        titleGroup.appendChild(createElement('h3', { className: 'app-container__title', text: title }));
      }
      if (subtitle) {
        titleGroup.appendChild(createElement('p', { className: 'app-container__subtitle', text: subtitle }));
      }

      headerEl.appendChild(titleGroup);

      if (headerAction) {
        if (headerAction instanceof HTMLElement) {
          headerEl.appendChild(headerAction);
        } else {
          headerEl.appendChild(createElement('div', { html: headerAction }));
        }
      }

      containerEl.appendChild(headerEl);
    }

    // Render Body
    const bodyEl = createElement('div', { className: 'app-container__body' });
    if (content) {
      if (Array.isArray(content)) {
        content.forEach(c => {
          if (c instanceof HTMLElement) bodyEl.appendChild(c);
          else bodyEl.appendChild(createElement('div', { html: c }));
        });
      } else if (content instanceof HTMLElement) {
        bodyEl.appendChild(content);
      } else {
        bodyEl.innerHTML = content;
      }
    }
    containerEl.appendChild(bodyEl);

    // Render Footer if provided
    if (footer) {
      const footerEl = createElement('div', { className: 'app-container__footer' });
      if (footer instanceof HTMLElement) {
        footerEl.appendChild(footer);
      } else {
        footerEl.innerHTML = footer;
      }
      containerEl.appendChild(footerEl);
    }

    return containerEl;
  }

  /**
   * Append content dynamically
   * @param {HTMLElement|string} child 
   */
  append(child) {
    const body = this.element.querySelector('.app-container__body');
    if (body) {
      if (child instanceof HTMLElement) {
        body.appendChild(child);
      } else {
        body.insertAdjacentHTML('beforeend', child);
      }
    }
  }

  /**
   * Get the generated DOM element
   * @returns {HTMLElement}
   */
  getElement() {
    return this.element;
  }
}
