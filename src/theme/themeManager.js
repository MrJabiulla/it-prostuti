/**
 * Theme Manager
 * Manages light/dark themes, handles system preference, persists user choice,
 * and notifies listeners on change.
 */
import { eventBus } from '../core/eventBus.js';

class ThemeManager {
  constructor() {
    this.STORAGE_KEY = 'app_theme_mode';
    this.currentTheme = this.getSavedTheme() || 'light';
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);

    // Watch system color-scheme changes if user chose 'system'
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.currentTheme === 'system') {
          this.applyTheme('system');
        }
      });
    }
  }

  getSavedTheme() {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  setTheme(theme) {
    if (!['light', 'dark', 'system'].includes(theme)) {
      console.warn(`[ThemeManager] Unknown theme: ${theme}`);
      return;
    }

    this.currentTheme = theme;
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.applyTheme(theme);
    eventBus.emit('theme:changed', { theme, effectiveTheme: this.getEffectiveTheme() });
  }

  toggleTheme() {
    const next = this.getEffectiveTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  }

  getEffectiveTheme() {
    if (this.currentTheme === 'system') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return this.currentTheme;
  }

  applyTheme(theme) {
    const effective = theme === 'system'
      ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;

    document.documentElement.setAttribute('data-theme', effective);
  }
}

export const themeManager = new ThemeManager();
