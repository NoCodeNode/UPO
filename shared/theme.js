// shared/theme.js - Theme detection and switching logic

const THEME_KEY = 'upoTheme';
const THEMES = {
  AUTO: 'auto',
  LIGHT: 'light',
  DARK: 'dark'
};

class ThemeManager {
  constructor() {
    this.currentTheme = THEMES.AUTO;
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  }

  /**
   * Initialize theme system
   */
  async init() {
    // Load saved preference
    const { upoTheme = THEMES.AUTO } = await chrome.storage.sync.get([THEME_KEY]);
    this.currentTheme = upoTheme;
    
    // Apply theme
    this.apply();
    
    // Listen for system theme changes
    this.mediaQuery.addEventListener('change', () => {
      if (this.currentTheme === THEMES.AUTO) {
        this.apply();
      }
    });
  }

  /**
   * Get effective theme (resolving auto to actual theme)
   */
  getEffectiveTheme() {
    if (this.currentTheme === THEMES.AUTO) {
      return this.mediaQuery.matches ? THEMES.DARK : THEMES.LIGHT;
    }
    return this.currentTheme;
  }

  /**
   * Apply theme to document
   */
  apply() {
    const effectiveTheme = this.getEffectiveTheme();
    document.documentElement.setAttribute('data-theme', effectiveTheme);
    
    // Add transition class for smooth changes
    document.documentElement.classList.add('theme-transitioning');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 300);
  }

  /**
   * Set theme preference
   */
  async setTheme(theme) {
    if (!Object.values(THEMES).includes(theme)) {
      theme = THEMES.AUTO;
    }
    
    this.currentTheme = theme;
    await chrome.storage.sync.set({ [THEME_KEY]: theme });
    this.apply();
  }

  /**
   * Get current theme preference
   */
  getTheme() {
    return this.currentTheme;
  }

  /**
   * Toggle between light and dark (not auto)
   */
  async toggle() {
    const current = this.getEffectiveTheme();
    const newTheme = current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    await this.setTheme(newTheme);
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ThemeManager, THEMES };
}
