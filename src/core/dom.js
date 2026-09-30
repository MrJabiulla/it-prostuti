/**
 * DOM Utility Helper
 * Simplifies element creation, queries, and event bindings in a clean, readable way.
 */

/**
 * Create a DOM element with attributes, classes, styles, and children
 * @param {string} tag - HTML tag name
 * @param {Object} options - Configuration options
 * @param {string|string[]} [options.className] - CSS class name(s)
 * @param {Object} [options.attributes] - Element attributes (e.g. { id, role, type })
 * @param {Object} [options.style] - Inline styles
 * @param {string} [options.text] - Inner text
 * @param {string} [options.html] - Inner HTML
 * @param {Array<HTMLElement|string>} [options.children] - Child elements
 * @param {Object} [options.on] - Event listeners (e.g. { click: (e) => {} })
 * @returns {HTMLElement}
 */
export function createElement(tag, options = {}) {
  const el = document.createElement(tag);

  // Apply CSS classes
  if (options.className) {
    if (Array.isArray(options.className)) {
      el.classList.add(...options.className.filter(Boolean));
    } else if (typeof options.className === 'string') {
      options.className.split(' ').filter(Boolean).forEach(c => el.classList.add(c));
    }
  }

  // Apply HTML attributes
  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        el.setAttribute(key, val);
      }
    });
  }

  // Apply inline styles
  if (options.style) {
    Object.assign(el.style, options.style);
  }

  // Apply text content safely
  if (options.text !== undefined) {
    el.textContent = options.text;
  }

  // Apply raw HTML if explicitly passed
  if (options.html !== undefined) {
    el.innerHTML = options.html;
  }

  // Append children
  if (options.children && Array.isArray(options.children)) {
    options.children.forEach(child => {
      if (child instanceof HTMLElement) {
        el.appendChild(child);
      } else if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      }
    });
  }

  // Bind event listeners
  if (options.on) {
    Object.entries(options.on).forEach(([event, handler]) => {
      if (typeof handler === 'function') {
        el.addEventListener(event, handler);
      }
    });
  }

  return el;
}

/**
 * Shorthand query selector
 * @param {string} selector 
 * @param {HTMLElement|Document} scope 
 * @returns {HTMLElement|null}
 */
export function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

/**
 * Shorthand query selector all (returns array)
 * @param {string} selector 
 * @param {HTMLElement|Document} scope 
 * @returns {HTMLElement[]}
 */
export function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}
