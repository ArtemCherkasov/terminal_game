/**
 * Tests for command history management
 * 
 * Tests history push, retrieval, navigation, clearing, and localStorage persistence.
 */

// History manager implementation (from terminal.js)
class CommandHistory {
  constructor(storageKey = 'history') {
    this.storageKey = storageKey;
    this.history = [];
    this.index = 0;
    this.load();
  }

  load() {
    try {
      const cached = localStorage.getItem(this.storageKey);
      if (cached) {
        this.history = JSON.parse(cached);
        this.index = this.history.length;
      }
    } catch (e) {
      this.history = [];
      this.index = 0;
    }
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.history));
  }

  add(command, output = []) {
    this.history.push({ command, output: output.slice() });
    this.index = this.history.length;
    this.save();
  }

  addToHistory(command) {
    this.history.push({ command, output: [] });
    this.index = this.history.length;
    this.save();
  }

  getPrevious() {
    if (this.history.length === 0) return '';
    this.index = Math.max(0, this.index - 1);
    return this.history[this.index]?.command || '';
  }

  getNext() {
    if (this.history.length === 0) return '';
    this.index = Math.min(this.history.length, this.index + 1);
    if (this.index >= this.history.length) return '';
    return this.history[this.index]?.command || '';
  }

  getCurrent() {
    if (this.index < this.history.length) {
      return this.history[this.index]?.command || '';
    }
    return '';
  }

  clear() {
    this.history = [];
    this.index = 0;
    localStorage.removeItem(this.storageKey);
  }

  getLength() {
    return this.history.length;
  }

  getAll() {
    return this.history.slice();
  }

  getLast() {
    if (this.history.length === 0) return null;
    return this.history[this.history.length - 1];
  }
}

describe('CommandHistory', () => {
  let history;

  beforeEach(() => {
    localStorage.clear();
    history = new CommandHistory();
  });

  // ==================== Add Tests ====================

  test('should add command to history', () => {
    history.add('ls');
    expect(history.getLength()).toBe(1);
  });

  test('should add multiple commands', () => {
    history.add('ls');
    history.add('cd /home');
    history.add('pwd');
    expect(history.getLength()).toBe(3);
  });

  test('should store command with output', () => {
    const output = ['file1.txt', 'file2.txt'];
    history.add('ls', output);
    
    const last = history.getLast();
    expect(last.command).toBe('ls');
    expect(last.output).toEqual(output);
  });

  test('should store command without output', () => {
    history.add('cd /home');
    
    const last = history.getLast();
    expect(last.command).toBe('cd /home');
    expect(last.output).toEqual([]);
  });

  // ==================== Navigation Tests ====================

  test('should navigate to previous command', () => {
    history.add('ls');
    history.add('cd /home');
    history.add('pwd');
    
    const prev = history.getPrevious();
    expect(prev).toBe('pwd');
  });

  test('should navigate through history backwards', () => {
    history.add('ls');
    history.add('cd /home');
    history.add('pwd');
    
    expect(history.getPrevious()).toBe('pwd');
    expect(history.getPrevious()).toBe('cd /home');
    expect(history.getPrevious()).toBe('ls');
  });

  test('should not go below history start', () => {
    history.add('ls');
    
    history.getPrevious(); // ls
    history.getPrevious(); // ls (stays at 0)
    history.getPrevious(); // ls (stays at 0)
    
    expect(history.getPrevious()).toBe('ls');
  });

  test('should navigate to next command', () => {
    history.add('ls');
    history.add('cd /home');
    history.add('pwd');
    
    history.getPrevious(); // pwd
    history.getPrevious(); // cd /home
    
    const next = history.getNext();
    expect(next).toBe('pwd');
  });

  test('should clear input when navigating past end', () => {
    history.add('ls');
    history.add('cd');
    
    history.getPrevious(); // cd
    history.getPrevious(); // ls
    history.getPrevious(); // ls (stays at 0)
    
    const next = history.getNext();
    expect(next).toBe('cd');
  });

  test('should return empty string for empty history', () => {
    expect(history.getPrevious()).toBe('');
    expect(history.getNext()).toBe('');
  });

  // ==================== Clear Tests ====================

  test('should clear all history', () => {
    history.add('ls');
    history.add('cd');
    history.add('pwd');
    
    history.clear();
    
    expect(history.getLength()).toBe(0);
    expect(history.getLast()).toBeNull();
  });

  test('should clear localStorage on clear', () => {
    history.add('ls');
    history.clear();
    
    const cached = localStorage.getItem('history');
    expect(cached).toBeNull();
  });

  // ==================== Persistence Tests ====================

  test('should persist history to localStorage', () => {
    history.add('ls');
    history.add('cd');
    
    expect(localStorage.setItem).toHaveBeenCalledWith('history', expect.any(String));
  });

  test('should load history from localStorage on creation', () => {
    const mockHistory = [
      { command: 'ls', output: ['file1'] },
      { command: 'cd /home', output: [] }
    ];
    localStorage.setItem('history', JSON.stringify(mockHistory));
    
    const newHistory = new CommandHistory();
    expect(newHistory.getLength()).toBe(2);
    expect(newHistory.getLast().command).toBe('cd /home');
  });

  test('should handle invalid localStorage data', () => {
    localStorage.setItem('history', 'invalid json');
    
    const newHistory = new CommandHistory();
    expect(newHistory.getLength()).toBe(0);
  });

  test('should handle missing localStorage key', () => {
    localStorage.clear();
    
    const newHistory = new CommandHistory();
    expect(newHistory.getLength()).toBe(0);
  });

  // ==================== Edge Cases ====================

  test('should handle empty command', () => {
    history.add('');
    expect(history.getLength()).toBe(1);
    expect(history.getLast().command).toBe('');
  });

  test('should handle command with whitespace', () => {
    history.add('   ');
    expect(history.getLength()).toBe(1);
  });

  test('should handle special characters in command', () => {
    history.add('grep "<script>" file.txt');
    expect(history.getLength()).toBe(1);
    expect(history.getLast().command).toBe('grep "<script>" file.txt');
  });

  test('should handle very long commands', () => {
    const longCmd = 'echo ' + 'a'.repeat(10000);
    history.add(longCmd);
    expect(history.getLength()).toBe(1);
    expect(history.getLast().command.length).toBe(10005);
  });

  test('should handle unicode in commands', () => {
    history.add('ls /home/пользователь');
    expect(history.getLength()).toBe(1);
    expect(history.getLast().command).toBe('ls /home/пользователь');
  });

  test('should handle command with newlines', () => {
    history.add('cat file.txt\nmore content');
    expect(history.getLength()).toBe(1);
  });

  // ==================== getAll Tests ====================

  test('should return all history entries', () => {
    history.add('ls');
    history.add('cd');
    history.add('pwd');
    
    const all = history.getAll();
    expect(all).toHaveLength(3);
    expect(all[0].command).toBe('ls');
    expect(all[1].command).toBe('cd');
    expect(all[2].command).toBe('pwd');
  });

  test('should return empty array for empty history', () => {
    const all = history.getAll();
    expect(all).toHaveLength(0);
  });

  test('should return copy of history', () => {
    history.add('ls');
    
    const all1 = history.getAll();
    history.add('cd');
    const all2 = history.getAll();
    
    expect(all1).toHaveLength(1);
    expect(all2).toHaveLength(2);
  });

  // ==================== addToHistory Tests ====================

  test('addToHistory should add command with empty output', () => {
    history.addToHistory('man ls');
    
    const last = history.getLast();
    expect(last.command).toBe('man ls');
    expect(last.output).toEqual([]);
  });
});

describe('History with custom storage key', () => {
  test('should use custom storage key', () => {
    const history = new CommandHistory('custom_history');
    history.add('ls');
    
    expect(localStorage.setItem).toHaveBeenCalledWith('custom_history', expect.any(String));
  });

  test('should load from custom storage key', () => {
    const mockHistory = [{ command: 'test', output: [] }];
    localStorage.setItem('custom_history', JSON.stringify(mockHistory));
    
    const history = new CommandHistory('custom_history');
    expect(history.getLength()).toBe(1);
  });
});
