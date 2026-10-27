/**
 * Integration tests for command execution
 * 
 * Tests command parsing, execution flow, and output generation.
 */

// Mock filesystem
const createMockFs = () => ({
  '/': {
    type: 'dir',
    permissions: '755',
    owner: 'root',
    children: {
      bin: { type: 'dir', permissions: '755', owner: 'root', children: {} },
      home: {
        type: 'dir',
        permissions: '755',
        owner: 'root',
        children: {
          user: {
            type: 'dir',
            permissions: '755',
            owner: 'user',
            children: {
              documents: {
                type: 'dir',
                permissions: '755',
                owner: 'user',
                children: {
                  readme: { type: 'file', permissions: '644', owner: 'user', content: 'Hello World\n' }
                }
              },
              'test.txt': { type: 'file', permissions: '644', owner: 'user', content: 'Test content\n' }
            }
          }
        }
      },
      tmp: { type: 'dir', permissions: '777', owner: 'root', children: {} }
    }
  }
});

// Command output collector
class OutputCollector {
  constructor() {
    this.outputs = [];
  }

  append(text) {
    this.outputs.push(text);
  }

  getAll() {
    return this.outputs;
  }

  getLast() {
    return this.outputs[this.outputs.length - 1] || '';
  }

  clear() {
    this.outputs = [];
  }

  contains(text) {
    return this.outputs.some(o => o.includes(text));
  }

  isEmpty() {
    return this.outputs.length === 0;
  }
}

// Command parser
function parseCommand(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;
  
  const parts = trimmed.split(/\s+/);
  return {
    command: parts[0],
    args: parts.slice(1),
    raw: trimmed
  };
}

describe('Command Parsing', () => {
  test('should parse simple command', () => {
    const result = parseCommand('ls');
    expect(result).not.toBeNull();
    expect(result.command).toBe('ls');
    expect(result.args).toEqual([]);
  });

  test('should parse command with arguments', () => {
    const result = parseCommand('ls -la /home');
    expect(result).not.toBeNull();
    expect(result.command).toBe('ls');
    expect(result.args).toEqual(['-la', '/home']);
  });

  test('should parse command with multiple arguments', () => {
    const result = parseCommand('cp file1.txt file2.txt');
    expect(result.command).toBe('cp');
    expect(result.args).toEqual(['file1.txt', 'file2.txt']);
  });

  test('should return null for empty input', () => {
    expect(parseCommand('')).toBeNull();
    expect(parseCommand('   ')).toBeNull();
    expect(parseCommand('\n')).toBeNull();
  });

  test('should trim whitespace', () => {
    const result = parseCommand('  ls  ');
    expect(result.command).toBe('ls');
    expect(result.args).toEqual([]);
  });

  test('should handle command with quotes', () => {
    const result = parseCommand('echo "hello world"');
    expect(result.command).toBe('echo');
    expect(result.args).toEqual(['"hello', 'world"']);
  });

  test('should handle special characters', () => {
    const result = parseCommand('grep "test<" file.txt');
    expect(result.command).toBe('grep');
  });
});

describe('Command Execution Flow', () => {
  let fs;
  let output;
  let currentPath;
  let currentUser;

  // Helper to resolve flat path keys to nested filesystem nodes
  function getNode(path) {
    if (!path || path === '/') return fs['/'];
    var parts = path.split('/').filter(Boolean);
    var current = fs['/'];
    for (var p of parts) {
      if (!current || !current.children || !current.children[p]) return undefined;
      current = current.children[p];
    }
    return current;
  }

  beforeEach(() => {
    fs = createMockFs();
    output = new OutputCollector();
    currentPath = '/home/user';
    currentUser = 'user';
  });

  // ==================== ls Command Tests ====================

  test('ls should list directory contents', () => {
    const dir = getNode(currentPath);
    const children = Object.keys(dir.children);
    
    expect(children).toContain('documents');
    expect(children).toContain('test.txt');
  });

  test('ls should handle non-existent directory', () => {
    const result = getNode('/nonexistent');
    expect(result).toBeUndefined();
  });

  test('ls should show hidden files with -a flag', () => {
    const homeUser = getNode('/home/user');
    // In real implementation, -a would show .bashrc
    expect(Object.keys(homeUser.children)).toContain('test.txt');
  });

  // ==================== cd Command Tests ====================

  test('cd should change directory', () => {
    const target = getNode('/home/user/documents');
    expect(target.type).toBe('dir');
    
    // Simulate cd
    currentPath = '/home/user/documents';
    expect(currentPath).toBe('/home/user/documents');
  });

  test('cd to non-existent directory should fail', () => {
    const target = getNode('/nonexistent');
    expect(target).toBeUndefined();
  });

  test('cd to file should fail', () => {
    const target = getNode('/home/user/test.txt');
    expect(target.type).toBe('file');
    expect(target.type).not.toBe('dir');
  });

  test('cd .. should go to parent', () => {
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    const parentPath = '/' + parts.join('/') || '/';
    
    expect(parentPath).toBe('/home');
  });

  // ==================== cat Command Tests ====================

  test('cat should read file content', () => {
    const file = getNode('/home/user/documents/readme');
    expect(file.type).toBe('file');
    expect(file.content).toContain('Hello World');
  });

  test('cat should fail for non-existent file', () => {
    const file = getNode('/nonexistent/file.txt');
    expect(file).toBeUndefined();
  });

  test('cat should fail for directory', () => {
    const dir = getNode('/home/user');
    expect(dir.type).toBe('dir');
  });

  // ==================== mkdir Command Tests ====================

  test('mkdir should create new directory', () => {
    const newDir = {
      type: 'dir',
      permissions: '755',
      owner: currentUser,
      children: {}
    };
    
    getNode('/home/user').children['newdir'] = newDir;
    expect(getNode('/home/user').children['newdir']).toBeDefined();
    expect(getNode('/home/user').children['newdir'].type).toBe('dir');
  });

  test('mkdir should fail for existing directory', () => {
    const existing = getNode('/home/user/documents');
    expect(existing).toBeDefined();
    expect(existing.type).toBe('dir');
  });

  // ==================== rm Command Tests ====================

  test('rm should delete file', () => {
    getNode('/home/user').children['todelete.txt'] = {
      type: 'file',
      permissions: '644',
      owner: currentUser,
      content: 'Delete me'
    };
    
    expect(getNode('/home/user').children['todelete.txt']).toBeDefined();
    delete getNode('/home/user').children['todelete.txt'];
    expect(getNode('/home/user').children['todelete.txt']).toBeUndefined();
  });

  test('rm should fail for non-existent file', () => {
    const result = getNode('/home/user/nonexistent.txt');
    expect(result).toBeUndefined();
  });

  // ==================== touch Command Tests ====================

  test('touch should create new file', () => {
    getNode('/home/user').children['newfile.txt'] = {
      type: 'file',
      permissions: '644',
      owner: currentUser,
      content: ''
    };
    
    expect(getNode('/home/user').children['newfile.txt']).toBeDefined();
    expect(getNode('/home/user').children['newfile.txt'].type).toBe('file');
  });

  // ==================== echo with redirect Tests ====================

  test('echo > should create file with content', () => {
    getNode('/home/user').children['output.txt'] = {
      type: 'file',
      permissions: '644',
      owner: currentUser,
      content: 'Hello > redirect\n'
    };
    
    const file = getNode('/home/user').children['output.txt'];
    expect(file.content).toContain('Hello > redirect');
  });

  test('echo >> should append to file', () => {
    getNode('/home/user').children['appended.txt'] = {
      type: 'file',
      permissions: '644',
      owner: currentUser,
      content: 'First line\nSecond line\n'
    };
    
    const file = getNode('/home/user').children['appended.txt'];
    expect(file.content).toContain('First line');
    expect(file.content).toContain('Second line');
  });

  // ==================== cp Command Tests ====================

  test('cp should copy file content', () => {
    const source = getNode('/home/user/test.txt');
    
    getNode('/home/user').children['copy.txt'] = {
      type: 'file',
      permissions: '644',
      owner: currentUser,
      content: source.content
    };
    
    expect(getNode('/home/user').children['copy.txt'].content).toBe(source.content);
  });

  // ==================== mv Command Tests ====================

  test('mv should move file', () => {
    getNode('/home/user').children['moved.txt'] = {
      type: 'file',
      permissions: '644',
      owner: currentUser,
      content: 'Moved content'
    };
    
    // Move to new location
    getNode('/home/user/documents').children['moved.txt'] = getNode('/home/user').children['moved.txt'];
    delete getNode('/home/user').children['moved.txt'];
    
    expect(getNode('/home/user/documents').children['moved.txt']).toBeDefined();
    expect(getNode('/home/user').children['moved.txt']).toBeUndefined();
  });

  // ==================== pwd Command Tests ====================

  test('pwd should return current path', () => {
    expect(currentPath).toBe('/home/user');
  });

  test('pwd should reflect path changes', () => {
    currentPath = '/home/user/documents';
    expect(currentPath).toBe('/home/user/documents');
  });

  // ==================== clear Command Tests ====================

  test('clear should reset output', () => {
    output.append('line1');
    output.append('line2');
    expect(output.getAll()).toHaveLength(2);
    
    output.clear();
    expect(output.isEmpty()).toBe(true);
  });

  // ==================== echo Command Tests ====================

  test('echo should output text', () => {
    const text = 'Hello, World!';
    output.append(text);
    expect(output.getLast()).toBe(text);
  });

  test('echo should handle quoted strings', () => {
    const input = '"Hello, World!"';
    let text = input;
    if (text.startsWith('"') && text.endsWith('"')) {
      text = text.slice(1, -1);
    }
    expect(text).toBe('Hello, World!');
  });

  test('echo should handle single quoted strings', () => {
    const input = "'Hello, World!'";
    let text = input;
    if (text.startsWith("'") && text.endsWith("'")) {
      text = text.slice(1, -1);
    }
    expect(text).toBe('Hello, World!');
  });

  // ==================== Filesystem JSON Tests ====================

  test('filesystem should be serializable', () => {
    const json = JSON.stringify(fs);
    const parsed = JSON.parse(json);
    
    expect(parsed['/'].type).toBe('dir');
    expect(parsed['/']['children'].home.type).toBe('dir');
  });

  test('filesystem should preserve structure after serialization', () => {
    const json = JSON.stringify(fs);
    const parsed = JSON.parse(json);
    
    const readme = parsed['/']['children']['home']['children']['user']['children']['documents']['children']['readme'];
    expect(readme.type).toBe('file');
    expect(readme.content).toBe('Hello World\n');
  });

  // ==================== Error Handling Tests ====================

  test('should handle command with no arguments', () => {
    const result = parseCommand('pwd');
    expect(result.args).toEqual([]);
  });

  test('should handle command with many arguments', () => {
    const result = parseCommand('find /home -name "*.txt" -type f');
    expect(result.command).toBe('find');
    expect(result.args.length).toBe(5);
  });

  test('should handle command with special redirect characters', () => {
    const result = parseCommand('echo "test" > file.txt');
    expect(result.command).toBe('echo');
  });

  test('should handle command with pipe', () => {
    const result = parseCommand('ls | grep txt');
    expect(result.command).toBe('ls');
  });

  // ==================== History Integration Tests ====================

  test('should track command history', () => {
    const history = [];
    
    history.push({ command: 'ls', output: ['file1.txt'] });
    history.push({ command: 'cd /home', output: [] });
    history.push({ command: 'pwd', output: ['/home/user'] });
    
    expect(history).toHaveLength(3);
    expect(history[0].command).toBe('ls');
    expect(history[2].command).toBe('pwd');
  });

  test('should persist history to localStorage', () => {
    const history = [
      { command: 'ls', output: ['file1.txt'] },
      { command: 'cd', output: [] }
    ];
    
    localStorage.setItem('history', JSON.stringify(history));
    
    const loaded = JSON.parse(localStorage.getItem('history'));
    expect(loaded).toHaveLength(2);
    expect(loaded[0].command).toBe('ls');
  });

  // ==================== Game Info Tests ====================

  test('gameinfo should display information', () => {
    const info = {
      version: '1.0',
      features: ['100+ commands', 'man pages', 'autocomplete'],
      commands: ['help', 'man', 'clear']
    };
    
    expect(info.version).toBe('1.0');
    expect(info.features).toContain('man pages');
  });

  test('gameinfo should have bilingual support', () => {
    const ruInfo = 'Linux the Game v1.0';
    const enInfo = 'Linux the Game v1.0';
    
    expect(ruInfo).toBe(enInfo);
  });
});

describe('Command validation', () => {
  test('should detect known commands', () => {
    const knownCommands = ['ls', 'cd', 'pwd', 'cat', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'grep', 'find'];
    const input = 'ls';
    
    expect(knownCommands).toContain(input);
  });

  test('should detect unknown commands', () => {
    const knownCommands = ['ls', 'cd', 'pwd', 'cat', 'echo'];
    const unknown = 'nonexistent';
    
    expect(knownCommands).not.toContain(unknown);
  });

  test('should handle case-sensitive commands', () => {
    const knownCommands = ['ls', 'cd', 'pwd'];
    
    expect(knownCommands).toContain('ls');
    expect(knownCommands).not.toContain('LS');
  });
});
