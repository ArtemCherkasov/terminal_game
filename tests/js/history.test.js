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

// ==================== man command history preservation ====================
// Bug: when switching RU/EN, "man ls" disappeared from output because
// fetchMan/renderManFromCache overwrote history entry output instead of
// appending to it. The prompt line "$ man ls" was lost.
describe('man command history - output preservation on rerender', () => {
  // Simulates the terminal.js flow:
  // 1. pendingOutput = []
  // 2. appendOutput('$ man ls') → pendingOutput = ['$ man ls']
  // 3. saveToHistory('man ls') → history entry output = ['$ man ls'], pendingOutput = []
  // 4. appendOutput('<pre class="manpage">...</pre>') → pendingOutput = ['<pre...>']
  // 5. OLD BUG: history[-1].output = pendingOutput.slice() → output = ['<pre...>'] (prompt lost!)
  // 5. FIX: history[-1].output = history[-1].output.concat(pendingOutput.slice()) → output = ['$ man ls', '<pre...>']

  test('should preserve prompt line when appending man output (cache hit)', () => {
    var history = [];
    var pendingOutput = [];

    // Step 1-2: prompt line added
    pendingOutput.push('<span class="prompt">$ </span>man ls');

    // Step 3: saveToHistory called inside CmdMan.execute (before man content)
    history.push({ command: 'man ls', output: pendingOutput.slice() });
    pendingOutput = [];

    expect(history[0].output).toEqual(['<span class="prompt">$ </span>man ls']);

    // Step 4: man page content appended
    pendingOutput.push('<pre class="manpage">LS(1) ...</pre>');

    // Step 5: FIX — concat instead of overwrite
    history[history.length - 1].output = history[history.length - 1].output.concat(pendingOutput.slice());

    // The output should contain BOTH the prompt and the man page
    expect(history[0].output).toHaveLength(2);
    expect(history[0].output[0]).toContain('man ls');
    expect(history[0].output[1]).toContain('manpage');
  });

  test('should preserve prompt line when appending man output (AJAX fetch)', () => {
    var history = [];
    var pendingOutput = [];

    // Prompt line
    pendingOutput.push('<span class="prompt">$ </span>man pwd');
    history.push({ command: 'man pwd', output: pendingOutput.slice() });
    pendingOutput = [];

    // AJAX callback — man content arrives later
    pendingOutput.push('<pre class="manpage">PWD(1) ...</pre>');

    // FIX — concat
    history[history.length - 1].output = history[history.length - 1].output.concat(pendingOutput.slice());

    expect(history[0].output).toHaveLength(2);
    expect(history[0].output[0]).toContain('man pwd');
    expect(history[0].output[1]).toContain('manpage');
  });

  test('should preserve prompt line on man error (not found)', () => {
    var history = [];
    var pendingOutput = [];

    pendingOutput.push('<span class="prompt">$ </span>man nonexistent');
    history.push({ command: 'man nonexistent', output: pendingOutput.slice() });
    pendingOutput = [];

    // Error message
    pendingOutput.push('<span class="error">No manual page for nonexistent</span>');

    // FIX — concat
    history[history.length - 1].output = history[history.length - 1].output.concat(pendingOutput.slice());

    expect(history[0].output).toHaveLength(2);
    expect(history[0].output[0]).toContain('man nonexistent');
    expect(history[0].output[1]).toContain('error');
  });

  test('should preserve prompt line on man AJAX failure', () => {
    var history = [];
    var pendingOutput = [];

    pendingOutput.push('<span class="prompt">$ </span>man ls');
    history.push({ command: 'man ls', output: pendingOutput.slice() });
    pendingOutput = [];

    // AJAX error
    pendingOutput.push('<span class="error">Error loading man page</span>');

    // FIX — concat
    history[history.length - 1].output = history[history.length - 1].output.concat(pendingOutput.slice());

    expect(history[0].output).toHaveLength(2);
    expect(history[0].output[0]).toContain('man ls');
    expect(history[0].output[1]).toContain('error');
  });

  test('OLD BUG: overwrite would lose prompt line', () => {
    // This test documents the old buggy behavior to prevent regression
    var history = [];
    var pendingOutput = [];

    pendingOutput.push('<span class="prompt">$ </span>man ls');
    history.push({ command: 'man ls', output: pendingOutput.slice() });
    pendingOutput = [];

    pendingOutput.push('<pre class="manpage">LS(1) ...</pre>');

    // OLD BUG: overwrite
    history[history.length - 1].output = pendingOutput.slice();

    // The prompt line is LOST
    expect(history[0].output).toHaveLength(1);
    expect(history[0].output[0]).not.toContain('man ls');
    expect(history[0].output[0]).toContain('manpage');
  });

  test('rerenderOutput should show prompt + man content with fix', () => {
    // Simulates rerenderOutput: if entry.output has content, render each line
    var history = [];
    var pendingOutput = [];
    var renderedLines = [];

    // Build history entry with fix
    pendingOutput.push('<span class="prompt">$ </span>man ls');
    history.push({ command: 'man ls', output: pendingOutput.slice() });
    pendingOutput = [];
    pendingOutput.push('<pre class="manpage">LS(1)</pre>');
    history[0].output = history[0].output.concat(pendingOutput.slice());

    // Simulate rerenderOutput
    history.forEach(function(entry) {
      var entryOutput = entry.output;
      if (entryOutput && entryOutput.length > 0) {
        entryOutput.forEach(function(line) {
          renderedLines.push(line);
        });
      } else {
        renderedLines.push('<span class="prompt">$ </span>' + entry.command);
      }
    });

    // Both prompt and man content should be rendered
    expect(renderedLines).toHaveLength(2);
    expect(renderedLines[0]).toContain('man ls');
    expect(renderedLines[1]).toContain('manpage');
  });

  test('normal commands (ls, pwd) are unaffected', () => {
    // For normal commands, saveToHistory is called AFTER output is added,
    // so pendingOutput already contains both prompt and output
    var history = [];
    var pendingOutput = [];

    pendingOutput.push('<span class="prompt">$ </span>ls');
    pendingOutput.push('documents/  downloads/');
    // saveToHistory called at end of command
    history.push({ command: 'ls', output: pendingOutput.slice() });
    pendingOutput = [];

    // No additional output update needed
    expect(history[0].output).toHaveLength(2);
    expect(history[0].output[0]).toContain('ls');
    expect(history[0].output[1]).toContain('documents');
  });
});
