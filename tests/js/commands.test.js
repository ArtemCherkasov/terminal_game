/**
 * Integration tests for ls, cat, rm, cp, echo commands
 * 
 * Tests actual command implementations loaded from js/commands/*.js
 * against a mock filesystem and context.
 */

// Load actual command files
loadCommandFile('ls.js');
loadCommandFile('cat.js');
loadCommandFile('rm.js');
loadCommandFile('cp.js');
loadCommandFile('echo.js');

// Mock filesystem
const createMockFs = () => ({
  '/': {
    type: 'dir', permissions: '755', owner: 'root', children: {
      bin: { type: 'dir', permissions: '755', owner: 'root', children: {} },
      etc: {
        type: 'dir', permissions: '755', owner: 'root', children: {
          passwd: { type: 'file', permissions: '644', owner: 'root', content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:User:/home/user:/bin/bash\n' }
        }
      },
      home: {
        type: 'dir', permissions: '755', owner: 'root', children: {
          user: {
            type: 'dir', permissions: '755', owner: 'user', children: {
              documents: {
                type: 'dir', permissions: '755', owner: 'user', children: {
                  readme: { type: 'file', permissions: '644', owner: 'user', content: 'Hello World\n' },
                  notes: { type: 'file', permissions: '644', owner: 'user', content: 'Notes here\n' }
                }
              },
              downloads: { type: 'dir', permissions: '755', owner: 'user', children: {} },
              '.bashrc': { type: 'file', permissions: '644', owner: 'user', content: 'alias ll="ls -la"\n' },
              'test.txt': { type: 'file', permissions: '644', owner: 'user', content: 'Test content\n' }
            }
          },
          guest: {
            type: 'dir', permissions: '755', owner: 'guest', children: {
              '.bashrc': { type: 'file', permissions: '644', owner: 'guest', content: '# guest bashrc\n' }
            }
          }
        }
      },
      tmp: { type: 'dir', permissions: '777', owner: 'root', children: {} },
      var: { type: 'dir', permissions: '755', owner: 'root', children: {} }
    }
  }
});

// escapeHtml
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// resolvePath (matches fixed terminal.js)
function resolvePath(path, fs, currentPath) {
  if (!fs['/']) return null;
  if (!path) return null;
  path = String(path).trim();
  if (path === '/') return fs['/'];
  if (path === '~' || path === '~/') path = '/home/user';
  if (path.startsWith('~/')) path = '/home/user/' + path.slice(2);
  if (!path.startsWith('/')) path = currentPath + '/' + path;
  path = path.replace(/\/+$/, '');
  if (!path) return fs['/'];
  var segs = path.split('/');
  var resolved = [];
  for (var i = 0; i < segs.length; i++) {
    if (segs[i] === '..') { if (resolved.length > 0) resolved.pop(); }
    else if (segs[i] !== '' && segs[i] !== '.') { resolved.push(segs[i]); }
  }
  path = '/' + resolved.join('/');
  if (path === '') return fs['/'];
  var parts = path.split('/').filter(Boolean);
  var current = fs['/'];
  for (var p of parts) {
    if (!current || current.type !== 'dir' || !current.children[p]) return null;
    current = current.children[p];
  }
  return current;
}

// resolveParentPath (from terminal.js)
function resolveParentPath(path, fs, currentPath) {
  var resolvedPath = path;
  if (!path.startsWith('/')) { resolvedPath = currentPath + '/' + path; }
  var parts = resolvedPath.split('/').filter(Boolean);
  var filename = parts.pop();
  var parentPath = '/' + parts.join('/') || '/';
  return { parent: resolvePath(parentPath, fs, currentPath), filename: filename, parentPath: parentPath };
}

// findPathForDir (from terminal.js)
function findPathForDir(fs, dirObj) {
  function findInDir(obj, target, currentPath) {
    if (obj === target) return currentPath;
    if (obj.type === 'dir' && obj.children) {
      for (var name of Object.keys(obj.children)) {
        var childPath = currentPath === '/' ? '/' + name : currentPath + '/' + name;
        var result = findInDir(obj.children[name], target, childPath);
        if (result) return result;
      }
    }
    return null;
  }
  return findInDir(fs['/'], dirObj, '/') || '/home/user';
}

// Create mock context
function createMockCtx(fs) {
  var currentPath = '/home/user';
  var currentUser = 'user';
  var output = [];
  var history = [];
  var saveFSCalled = false;

  return {
    _cmd: '',
    fs: fs,
    currentPath: currentPath,
    currentUser: currentUser,
    appendOutput: function(text) { output.push(text); },
    getOutput: function() { return output; },
    clearOutput: function() { output = []; },
    saveToHistory: function(cmd) { history.push(cmd); },
    getHistory: function() { return history; },
    escapeHtml: escapeHtml,
    resolvePath: function(path) { return resolvePath(path, fs, currentPath); },
    resolveParentPath: function(path) { return resolveParentPath(path, fs, currentPath); },
    findPathForDir: function(dirObj) { return findPathForDir(fs, dirObj); },
    setCurrentPath: function(p) {
      var normalized = (p || '').replace(/^\/+|\/+$/g, '');
      currentPath = normalized === '' ? '/' : '/' + normalized;
      this.currentPath = currentPath;
    },
    setCurrentUser: function(u) { currentUser = u; this.currentUser = u; },
    saveFS: function() { saveFSCalled = true; },
    wasSaveFSCalled: function() { return saveFSCalled; },
    resetSaveFS: function() { saveFSCalled = false; },
    updatePrompt: function() {},
    // Redirect helpers — delegate to command objects
    _handleCatRedirect: function(ctx, args, op) { window.CmdCat._handleCatRedirect(ctx, args, op); },
    _handleEchoRedirect: function(text, op) { window.CmdEcho._handleEchoRedirect(this, text, op); }
  };
}

// ==================== ls COMMAND TESTS ====================
describe('ls command', () => {
  let ctx, fs;

  beforeEach(() => {
    fs = createMockFs();
    ctx = createMockCtx(fs);
  });

  test('should list current directory contents', () => {
    ctx._cmd = 'ls';
    ctx.clearOutput();
    window.CmdLs.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('documents/');
    expect(out).toContain('downloads/');
    expect(out).toContain('test.txt');
  });

  test('should not show hidden files by default', () => {
    ctx._cmd = 'ls';
    ctx.clearOutput();
    window.CmdLs.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).not.toContain('.bashrc');
  });

  test('should show hidden files with -a flag', () => {
    ctx._cmd = 'ls -a';
    ctx.clearOutput();
    window.CmdLs.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('.bashrc');
    expect(out).toContain('documents/');
  });

  test('should list specific directory', () => {
    ctx._cmd = 'ls /home/user/documents';
    ctx.clearOutput();
    window.CmdLs.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('readme');
    expect(out).toContain('notes');
  });

  test('should list root directory', () => {
    ctx._cmd = 'ls /';
    ctx.clearOutput();
    window.CmdLs.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('bin/');
    expect(out).toContain('home/');
    expect(out).toContain('etc/');
    expect(out).toContain('tmp/');
  });

  test('should show long format with -l flag', () => {
    ctx._cmd = 'ls -l';
    ctx.clearOutput();
    window.CmdLs.execute(ctx);
    var out = ctx.getOutput().join('\n');
    expect(out).toContain('user');
    expect(out).toContain('documents');
  });

  test('should combine -a and -l flags', () => {
    ctx._cmd = 'ls -la';
    ctx.clearOutput();
    window.CmdLs.execute(ctx);
    var out = ctx.getOutput().join('\n');
    expect(out).toContain('.bashrc');
    expect(out).toContain('documents');
  });

  test('should output file name for file target', () => {
    ctx._cmd = 'ls /home/user/test.txt';
    ctx.clearOutput();
    window.CmdLs.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('test.txt');
  });

  test('should error for non-existent path', () => {
    ctx._cmd = 'ls /nonexistent';
    ctx.clearOutput();
    window.CmdLs.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('No such file or directory');
  });

  test('should list relative path', () => {
    ctx._cmd = 'ls ./documents';
    ctx.clearOutput();
    window.CmdLs.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('readme');
    expect(out).toContain('notes');
  });

  test('should save to history', () => {
    ctx._cmd = 'ls';
    window.CmdLs.execute(ctx);
    expect(ctx.getHistory()).toContain('ls');
  });

  test('should mark directories with trailing slash', () => {
    ctx._cmd = 'ls';
    ctx.clearOutput();
    window.CmdLs.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('documents/');
    expect(out).toContain('downloads/');
  });
});

// ==================== cat COMMAND TESTS ====================
describe('cat command', () => {
  let ctx, fs;

  beforeEach(() => {
    fs = createMockFs();
    ctx = createMockCtx(fs);
  });

  test('should display file content', () => {
    ctx._cmd = 'cat /home/user/documents/readme';
    ctx.clearOutput();
    window.CmdCat.execute(ctx);
    expect(ctx.getOutput()).toContain('Hello World\n');
  });

  test('should display content of test.txt', () => {
    ctx._cmd = 'cat /home/user/test.txt';
    ctx.clearOutput();
    window.CmdCat.execute(ctx);
    expect(ctx.getOutput()).toContain('Test content\n');
  });

  test('should display relative file content', () => {
    ctx._cmd = 'cat documents/readme';
    ctx.clearOutput();
    window.CmdCat.execute(ctx);
    expect(ctx.getOutput()).toContain('Hello World\n');
  });

  test('should error for non-existent file', () => {
    ctx._cmd = 'cat /nonexistent';
    ctx.clearOutput();
    window.CmdCat.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('No such file or directory');
  });

  test('should error for directory', () => {
    ctx._cmd = 'cat /home/user/documents';
    ctx.clearOutput();
    window.CmdCat.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('Is a directory');
  });

  test('should cat multiple files', () => {
    ctx._cmd = 'cat /home/user/documents/readme /home/user/documents/notes';
    ctx.clearOutput();
    window.CmdCat.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('Hello World');
    expect(out).toContain('Notes here');
  });

  test('should handle hidden file', () => {
    ctx._cmd = 'cat /home/user/.bashrc';
    ctx.clearOutput();
    window.CmdCat.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('alias ll');
  });

  test('should save to history', () => {
    ctx._cmd = 'cat /home/user/test.txt';
    window.CmdCat.execute(ctx);
    expect(ctx.getHistory()).toContain('cat /home/user/test.txt');
  });

  test('should escape HTML in file content', () => {
    fs['/']['children']['home']['children']['user']['children']['xss.txt'] = {
      type: 'file', permissions: '644', owner: 'user', content: '<script>alert(1)</script>'
    };
    ctx._cmd = 'cat /home/user/xss.txt';
    ctx.clearOutput();
    window.CmdCat.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('&lt;script&gt;');
    expect(out).not.toContain('<script>');
  });

  test('should handle empty file', () => {
    fs['/']['children']['home']['children']['user']['children']['empty.txt'] = {
      type: 'file', permissions: '644', owner: 'user', content: ''
    };
    ctx._cmd = 'cat /home/user/empty.txt';
    ctx.clearOutput();
    window.CmdCat.execute(ctx);
    expect(ctx.getOutput()).toContain('');
  });
});

// ==================== rm COMMAND TESTS ====================
describe('rm command', () => {
  let ctx, fs;

  beforeEach(() => {
    fs = createMockFs();
    ctx = createMockCtx(fs);
  });

  test('should remove file', () => {
    ctx._cmd = 'rm /home/user/test.txt';
    window.CmdRm.execute(ctx);
    expect(fs['/']['children']['home']['children']['user']['children']['test.txt']).toBeUndefined();
  });

  test('should call saveFS on successful removal', () => {
    ctx._cmd = 'rm /home/user/test.txt';
    ctx.resetSaveFS();
    window.CmdRm.execute(ctx);
    expect(ctx.wasSaveFSCalled()).toBe(true);
  });

  test('should error for non-existent file', () => {
    ctx._cmd = 'rm /nonexistent';
    ctx.clearOutput();
    window.CmdRm.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('No such file or directory');
  });

  test('should error for directory without -r flag', () => {
    ctx._cmd = 'rm /home/user/documents';
    ctx.clearOutput();
    window.CmdRm.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('Is a directory');
  });

  test('should remove directory with -r flag', () => {
    ctx._cmd = 'rm -r /home/user/documents';
    window.CmdRm.execute(ctx);
    expect(fs['/']['children']['home']['children']['user']['children']['documents']).toBeUndefined();
  });

  test('should remove directory with -rf flag', () => {
    ctx._cmd = 'rm -rf /home/user/downloads';
    window.CmdRm.execute(ctx);
    expect(fs['/']['children']['home']['children']['user']['children']['downloads']).toBeUndefined();
  });

  test('should protect root directory', () => {
    ctx._cmd = 'rm -rf /home/user';
    ctx.clearOutput();
    window.CmdRm.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('Operation not permitted');
  });

  test('should protect /home/user', () => {
    ctx._cmd = 'rm -rf /home/user';
    ctx.clearOutput();
    window.CmdRm.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('Operation not permitted');
  });

  test('should remove relative path file', () => {
    ctx._cmd = 'rm test.txt';
    window.CmdRm.execute(ctx);
    expect(fs['/']['children']['home']['children']['user']['children']['test.txt']).toBeUndefined();
  });

  test('should save to history', () => {
    ctx._cmd = 'rm /home/user/test.txt';
    window.CmdRm.execute(ctx);
    expect(ctx.getHistory()).toContain('rm /home/user/test.txt');
  });

  test('should not call saveFS on error', () => {
    ctx._cmd = 'rm /nonexistent';
    ctx.resetSaveFS();
    window.CmdRm.execute(ctx);
    expect(ctx.wasSaveFSCalled()).toBe(false);
  });
});

// ==================== cp COMMAND TESTS ====================
describe('cp command', () => {
  let ctx, fs;

  beforeEach(() => {
    fs = createMockFs();
    ctx = createMockCtx(fs);
  });

  test('should copy file to new name', () => {
    ctx._cmd = 'cp /home/user/test.txt /home/user/copy.txt';
    window.CmdCp.execute(ctx);
    var copy = fs['/']['children']['home']['children']['user']['children']['copy.txt'];
    expect(copy).toBeDefined();
    expect(copy.type).toBe('file');
    expect(copy.content).toBe('Test content\n');
  });

  test('should preserve file content', () => {
    ctx._cmd = 'cp /home/user/documents/readme /home/user/copied_readme';
    window.CmdCp.execute(ctx);
    var copy = fs['/']['children']['home']['children']['user']['children']['copied_readme'];
    expect(copy.content).toBe('Hello World\n');
  });

  test('should error for non-existent source', () => {
    ctx._cmd = 'cp /nonexistent /home/user/copy.txt';
    ctx.clearOutput();
    window.CmdCp.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('No such file or directory');
  });

  test('should error for directory source', () => {
    ctx._cmd = 'cp /home/user/documents /home/user/copy';
    ctx.clearOutput();
    window.CmdCp.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('omitting directory');
  });

  test('should call saveFS on successful copy', () => {
    ctx._cmd = 'cp /home/user/test.txt /home/user/copy.txt';
    ctx.resetSaveFS();
    window.CmdCp.execute(ctx);
    expect(ctx.wasSaveFSCalled()).toBe(true);
  });

  test('should not call saveFS on error', () => {
    ctx._cmd = 'cp /nonexistent /home/user/copy.txt';
    ctx.resetSaveFS();
    window.CmdCp.execute(ctx);
    expect(ctx.wasSaveFSCalled()).toBe(false);
  });

  test('should copy using relative paths', () => {
    ctx._cmd = 'cp test.txt backup.txt';
    window.CmdCp.execute(ctx);
    var copy = fs['/']['children']['home']['children']['user']['children']['backup.txt'];
    expect(copy).toBeDefined();
    expect(copy.content).toBe('Test content\n');
  });

  test('should set correct owner on copied file', () => {
    ctx._cmd = 'cp /home/user/test.txt /home/user/copy.txt';
    window.CmdCp.execute(ctx);
    var copy = fs['/']['children']['home']['children']['user']['children']['copy.txt'];
    expect(copy.owner).toBe('user');
  });

  test('should set correct permissions on copied file', () => {
    ctx._cmd = 'cp /home/user/test.txt /home/user/copy.txt';
    window.CmdCp.execute(ctx);
    var copy = fs['/']['children']['home']['children']['user']['children']['copy.txt'];
    expect(copy.permissions).toBe('644');
  });

  test('should save to history', () => {
    ctx._cmd = 'cp /home/user/test.txt /home/user/copy.txt';
    window.CmdCp.execute(ctx);
    expect(ctx.getHistory()).toContain('cp /home/user/test.txt /home/user/copy.txt');
  });

  test('should overwrite existing file', () => {
    fs['/']['children']['home']['children']['user']['children']['dest.txt'] = {
      type: 'file', permissions: '644', owner: 'user', content: 'OLD\n'
    };
    ctx._cmd = 'cp /home/user/test.txt /home/user/dest.txt';
    window.CmdCp.execute(ctx);
    var copy = fs['/']['children']['home']['children']['user']['children']['dest.txt'];
    expect(copy.content).toBe('Test content\n');
  });
});

// ==================== echo COMMAND TESTS ====================
describe('echo command', () => {
  let ctx, fs;

  beforeEach(() => {
    fs = createMockFs();
    ctx = createMockCtx(fs);
  });

  test('should output plain text', () => {
    ctx._cmd = 'echo Hello World';
    ctx.clearOutput();
    window.CmdEcho.execute(ctx);
    expect(ctx.getOutput()).toContain('Hello World');
  });

  test('should output text with double quotes', () => {
    ctx._cmd = 'echo "Hello World"';
    ctx.clearOutput();
    window.CmdEcho.execute(ctx);
    expect(ctx.getOutput()).toContain('Hello World');
  });

  test('should output text with single quotes', () => {
    ctx._cmd = "echo 'Hello World'";
    ctx.clearOutput();
    window.CmdEcho.execute(ctx);
    expect(ctx.getOutput()).toContain('Hello World');
  });

  test('should handle empty string', () => {
    ctx._cmd = 'echo ""';
    ctx.clearOutput();
    window.CmdEcho.execute(ctx);
    expect(ctx.getOutput()).toContain('');
  });

  test('should handle special characters', () => {
    ctx._cmd = 'echo test&lt;&amp;';
    ctx.clearOutput();
    window.CmdEcho.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('test');
  });

  test('should escape HTML in output', () => {
    ctx._cmd = 'echo "test & \'quotes\'"';
    ctx.clearOutput();
    window.CmdEcho.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('&amp;');
    expect(out).toContain('&#039;');
  });

  test('should handle unicode text', () => {
    ctx._cmd = 'echo Привет мир';
    ctx.clearOutput();
    window.CmdEcho.execute(ctx);
    expect(ctx.getOutput()).toContain('Привет мир');
  });

  test('should handle numbers', () => {
    ctx._cmd = 'echo 12345';
    ctx.clearOutput();
    window.CmdEcho.execute(ctx);
    expect(ctx.getOutput()).toContain('12345');
  });

  test('should save to history', () => {
    ctx._cmd = 'echo Hello';
    window.CmdEcho.execute(ctx);
    expect(ctx.getHistory()).toContain('echo Hello');
  });

  test('should handle multiple words', () => {
    ctx._cmd = 'echo one two three four five';
    ctx.clearOutput();
    window.CmdEcho.execute(ctx);
    expect(ctx.getOutput()).toContain('one two three four five');
  });

  test('should not match echo without args', () => {
    ctx._cmd = 'echo';
    ctx.clearOutput();
    window.CmdEcho.execute(ctx);
    // echo without args should not match the regex, so nothing happens
    expect(ctx.getOutput()).toEqual([]);
  });
});
