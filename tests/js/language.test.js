/**
 * Tests for language switching functionality
 * 
 * Tests i18n translations, language persistence, and content updates.
 */

// i18n translations from terminal.js
const i18n = {
  ru: {
    welcome: '~ Добро пожаловать в Linux the Game ~',
    helpHint: 'Введите help для списка команд или man <команда>',
    noCommands: 'Список команд ещё не загружен. Подождите...',
    commandsTitle: '=== Доступные команды (',
    commandsCount: ' шт.) ===',
    manHint: 'Используйте: man <команда> для справки',
    unknownCmd: 'команда не найдена',
    helpAvailable: 'Введите help для списка доступных команд.',
    exitMsg: 'Выход невозможен — это симулятор. Нажмите F5 чтобы перезагрузить.',
    manNotFound: 'Нет справочной страницы для',
    manError: 'Ошибка загрузки man-страницы',
    loadError: 'Ошибка загрузки списка команд',
    exitHint: 'Выход невозможен — это симулятор.',
    gameinfoTitle: '═══ Linux the Game — Информация ═══'
  },
  en: {
    welcome: '~ Welcome to Linux the Game ~',
    helpHint: 'Type help for command list or man <command>',
    noCommands: 'Command list not loaded yet. Please wait...',
    commandsTitle: '=== Available Commands (',
    commandsCount: ') ===',
    manHint: 'Use: man <command> for help',
    unknownCmd: 'command not found',
    helpAvailable: 'Type help for available commands.',
    exitMsg: 'Exit not possible — this is a simulator. Press F5 to reload.',
    manNotFound: 'No manual page for',
    manError: 'Error loading man page',
    loadError: 'Error loading command list',
    exitHint: 'Exit not possible — this is a simulator.',
    gameinfoTitle: '═══ Linux the Game — Info ═══'
  }
};

// Language manager implementation (matches terminal.js)
// Note: setLanguage does NOT validate language — it accepts any value
// This matches the actual terminal.js implementation
class LanguageManager {
  constructor(storageKey = 'lang') {
    this.storageKey = storageKey;
    this.currentLang = this.load() || 'ru';
  }

  load() {
    try {
      return localStorage.getItem(this.storageKey);
    } catch (e) {
      return null;
    }
  }

  save(lang) {
    localStorage.setItem(this.storageKey, lang);
  }

  setLanguage(lang) {
    // No validation — matches actual terminal.js behavior
    this.currentLang = lang;
    this.save(lang);
    return lang;
  }

  getLanguage() {
    return this.currentLang;
  }

  getTranslation(key) {
    return i18n[this.currentLang]?.[key] || i18n.ru[key] || key;
  }

  toggleLanguage() {
    const newLang = this.currentLang === 'ru' ? 'en' : 'ru';
    return this.setLanguage(newLang);
  }

  getAvailableLanguages() {
    return Object.keys(i18n);
  }

  hasTranslation(key) {
    return i18n[this.currentLang]?.[key] !== undefined;
  }
}

describe('LanguageManager', () => {
  let langManager;

  beforeEach(() => {
    localStorage.clear();
    langManager = new LanguageManager();
  });

  // ==================== Initialization Tests ====================

  test('should default to Russian when no language is set', () => {
    expect(langManager.getLanguage()).toBe('ru');
  });

  test('should load language from localStorage', () => {
    localStorage.setItem('lang', 'en');
    const newManager = new LanguageManager();
    expect(newManager.getLanguage()).toBe('en');
  });

  test('should handle invalid localStorage data', () => {
    localStorage.setItem('lang', 'invalid_data');
    const newManager = new LanguageManager();
    // Should default to Russian
    expect(newManager.getLanguage()).toBe('ru');
  });

  // ==================== setLanguage Tests ====================

  test('should set language to Russian', () => {
    langManager.setLanguage('en');
    langManager.setLanguage('ru');
    expect(langManager.getLanguage()).toBe('ru');
  });

  test('should set language to English', () => {
    langManager.setLanguage('en');
    expect(langManager.getLanguage()).toBe('en');
  });

  test('should accept any language without validation', () => {
    // Actual setLanguage does NOT validate — matches terminal.js
    langManager.setLanguage('fr');
    expect(langManager.getLanguage()).toBe('fr');
  });

  test('should save language to localStorage', () => {
    langManager.setLanguage('en');
    expect(localStorage.setItem).toHaveBeenCalledWith('lang', 'en');
  });

  test('should return the set language', () => {
    const result = langManager.setLanguage('en');
    expect(result).toBe('en');
  });

  // ==================== toggleLanguage Tests ====================

  test('should toggle from Russian to English', () => {
    const result = langManager.toggleLanguage();
    expect(result).toBe('en');
    expect(langManager.getLanguage()).toBe('en');
  });

  test('should toggle from English to Russian', () => {
    langManager.setLanguage('en');
    const result = langManager.toggleLanguage();
    expect(result).toBe('ru');
    expect(langManager.getLanguage()).toBe('ru');
  });

  test('should toggle multiple times', () => {
    langManager.toggleLanguage(); // en
    langManager.toggleLanguage(); // ru
    langManager.toggleLanguage(); // en
    
    expect(langManager.getLanguage()).toBe('en');
  });

  // ==================== Translation Tests ====================

  test('should get Russian welcome message', () => {
    langManager.setLanguage('ru');
    expect(langManager.getTranslation('welcome')).toBe('~ Добро пожаловать в Linux the Game ~');
  });

  test('should get English welcome message', () => {
    langManager.setLanguage('en');
    expect(langManager.getTranslation('welcome')).toBe('~ Welcome to Linux the Game ~');
  });

  test('should get Russian help hint', () => {
    langManager.setLanguage('ru');
    expect(langManager.getTranslation('helpHint')).toBe('Введите help для списка команд или man <команда>');
  });

  test('should get English help hint', () => {
    langManager.setLanguage('en');
    expect(langManager.getTranslation('helpHint')).toBe('Type help for command list or man <command>');
  });

  test('should get Russian unknown command message', () => {
    langManager.setLanguage('ru');
    expect(langManager.getTranslation('unknownCmd')).toBe('команда не найдена');
  });

  test('should get English unknown command message', () => {
    langManager.setLanguage('en');
    expect(langManager.getTranslation('unknownCmd')).toBe('command not found');
  });

  test('should get Russian man not found message', () => {
    langManager.setLanguage('ru');
    expect(langManager.getTranslation('manNotFound')).toBe('Нет справочной страницы для');
  });

  test('should get English man not found message', () => {
    langManager.setLanguage('en');
    expect(langManager.getTranslation('manNotFound')).toBe('No manual page for');
  });

  test('should get Russian exit message', () => {
    langManager.setLanguage('ru');
    expect(langManager.getTranslation('exitMsg')).toBe('Выход невозможен — это симулятор. Нажмите F5 чтобы перезагрузить.');
  });

  test('should get English exit message', () => {
    langManager.setLanguage('en');
    expect(langManager.getTranslation('exitMsg')).toBe('Exit not possible — this is a simulator. Press F5 to reload.');
  });

  // ==================== Translation Key Tests ====================

  test('should check if translation exists', () => {
    langManager.setLanguage('ru');
    expect(langManager.hasTranslation('welcome')).toBe(true);
    expect(langManager.hasTranslation('helpHint')).toBe(true);
    expect(langManager.hasTranslation('nonexistent')).toBe(false);
  });

  test('should return key for nonexistent translation', () => {
    langManager.setLanguage('ru');
    expect(langManager.getTranslation('nonexistent')).toBe('nonexistent');
  });

  test('should have all required Russian translations', () => {
    langManager.setLanguage('ru');
    const requiredKeys = ['welcome', 'helpHint', 'unknownCmd', 'exitMsg', 'manNotFound', 'manError', 'loadError'];
    
    for (const key of requiredKeys) {
      expect(langManager.hasTranslation(key)).toBe(true);
    }
  });

  test('should have all required English translations', () => {
    langManager.setLanguage('en');
    const requiredKeys = ['welcome', 'helpHint', 'unknownCmd', 'exitMsg', 'manNotFound', 'manError', 'loadError'];
    
    for (const key of requiredKeys) {
      expect(langManager.hasTranslation(key)).toBe(true);
    }
  });

  // ==================== Available Languages Tests ====================

  test('should return available languages', () => {
    const langs = langManager.getAvailableLanguages();
    expect(langs).toContain('ru');
    expect(langs).toContain('en');
    expect(langs).toHaveLength(2);
  });

  // ==================== Persistence Tests ====================

  test('should persist language across instances', () => {
    langManager.setLanguage('en');
    
    const newManager = new LanguageManager();
    expect(newManager.getLanguage()).toBe('en');
  });

  test('should persist Russian language', () => {
    langManager.setLanguage('ru');
    
    const newManager = new LanguageManager();
    expect(newManager.getLanguage()).toBe('ru');
  });

  test('should use custom storage key', () => {
    const customManager = new LanguageManager('my_lang');
    customManager.setLanguage('en');
    
    expect(localStorage.setItem).toHaveBeenCalledWith('my_lang', 'en');
    
    const newCustomManager = new LanguageManager('my_lang');
    expect(newCustomManager.getLanguage()).toBe('en');
  });

  // ==================== Edge Cases ====================

  test('should handle empty string language', () => {
    // No validation — stores whatever is passed
    langManager.setLanguage('');
    expect(langManager.getLanguage()).toBe('');
  });

  test('should handle null language', () => {
    langManager.setLanguage(null);
    expect(langManager.getLanguage()).toBe(null);
  });

  test('should handle undefined language', () => {
    langManager.setLanguage(undefined);
    expect(langManager.getLanguage()).toBe(undefined);
  });

  test('translations should not be empty', () => {
    langManager.setLanguage('ru');
    const requiredKeys = ['welcome', 'helpHint', 'unknownCmd', 'exitMsg'];
    
    for (const key of requiredKeys) {
      const translation = langManager.getTranslation(key);
      expect(translation.length).toBeGreaterThan(0);
    }
  });

  test('translations should differ between languages', () => {
    const keys = ['welcome', 'helpHint', 'unknownCmd', 'exitMsg', 'manNotFound'];
    
    for (const key of keys) {
      langManager.setLanguage('ru');
      const ruText = langManager.getTranslation(key);
      
      langManager.setLanguage('en');
      const enText = langManager.getTranslation(key);
      
      expect(ruText).not.toBe(enText);
    }
  });

  test('should handle localStorage setItem failure', () => {
    // Mock localStorage.setItem to throw
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = jest.fn(() => {
      throw new Error('Storage full');
    });
    
    expect(() => langManager.setLanguage('en')).not.toThrow();
    
    localStorage.setItem = originalSetItem;
  });
});

describe('i18n translations completeness', () => {
  test('should have same keys in both languages', () => {
    const ruKeys = Object.keys(i18n.ru);
    const enKeys = Object.keys(i18n.en);
    
    expect(ruKeys).toEqual(enKeys);
  });

  test('should have all expected translation keys', () => {
    const expectedKeys = [
      'welcome',
      'helpHint',
      'noCommands',
      'commandsTitle',
      'commandsCount',
      'manHint',
      'unknownCmd',
      'helpAvailable',
      'exitMsg',
      'manNotFound',
      'manError',
      'loadError',
      'exitHint',
      'gameinfoTitle'
    ];
    
    for (const key of expectedKeys) {
      expect(i18n.ru).toHaveProperty(key);
      expect(i18n.en).toHaveProperty(key);
    }
  });

  test('Russian translations should contain Cyrillic', () => {
    const cyrillicPattern = /[а-яА-ЯёЁ]/;
    
    expect(cyrillicPattern.test(i18n.ru.welcome)).toBe(true);
    expect(cyrillicPattern.test(i18n.ru.helpHint)).toBe(true);
    expect(cyrillicPattern.test(i18n.ru.unknownCmd)).toBe(true);
  });

  test('English translations should not contain Cyrillic', () => {
    const cyrillicPattern = /[а-яА-ЯёЁ]/;
    
    expect(cyrillicPattern.test(i18n.en.welcome)).toBe(false);
    expect(cyrillicPattern.test(i18n.en.helpHint)).toBe(false);
    expect(cyrillicPattern.test(i18n.en.unknownCmd)).toBe(false);
  });
});
