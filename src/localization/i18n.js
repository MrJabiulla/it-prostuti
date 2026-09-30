/**
 * Localization (i18n) Manager
 * Handles multi-language switching, key interpolation, and automatic DOM translation.
 */
import { eventBus } from '../core/eventBus.js';
import en from './languages/en.js';
import bn from './languages/bn.js';

class I18nManager {
  constructor() {
    this.STORAGE_KEY = 'app_language';
    this.languages = { en, bn };
    this.currentLanguage = this.getSavedLanguage() || 'bn'; // default to Bengali
  }

  getSavedLanguage() {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  getLanguage() {
    return this.currentLanguage;
  }

  setLanguage(lang) {
    if (!this.languages[lang]) {
      console.warn(`[i18n] Language "${lang}" is not supported.`);
      return;
    }

    this.currentLanguage = lang;
    localStorage.setItem(this.STORAGE_KEY, lang);
    document.documentElement.setAttribute('lang', lang);

    // Update all static i18n markers in DOM
    this.updateDom();

    eventBus.emit('language:changed', { language: lang });
  }

  /**
   * Translate a dotted key e.g. "dialog.confirmTitle"
   * @param {string} key 
   * @param {Object} [params] - Key-value replacements e.g. { name: 'John' }
   * @returns {string}
   */
  t(key, params = {}) {
    const keys = key.split('.');
    let result = this.languages[this.currentLanguage];

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        // Fallback to English if translation is missing in active language
        let fallback = this.languages.en;
        for (const fk of keys) {
          fallback = fallback?.[fk];
        }
        result = fallback || key;
        break;
      }
    }

    if (typeof result !== 'string') {
      return key;
    }

    // Replace {paramName} in string
    return result.replace(/\{(\w+)\}/g, (_, placeholder) => {
      return params[placeholder] !== undefined ? params[placeholder] : `{${placeholder}}`;
    });
  }

  /**
   * Automatically translate all DOM elements with [data-i18n="key"]
   * @param {HTMLElement|Document} [root]
   */
  updateDom(root = document) {
    const elements = root.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = this.t(key);
      }
    });

    const placeholders = root.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.setAttribute('placeholder', this.t(key));
      }
    });
  }
}

export const i18n = new I18nManager();
