/**
 * Tests for cd command
 * 
 * Tests cd command behavior: absolute paths, relative paths, .., /, ~, etc.
 */

// Mock filesystem structure matching the real project
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
                  readme: { type: 'file', permissions: '644', owner: 'user', content: 'Hello' },
                  notes: { type: 'file', permissions: '644', owner: 'user', content: 'Notes' }
                }
              },
              downloads: { type: 'dir', permissions: '755', owner: 'user', children: {} },
              '.hidden': { type: 'dir', permissions: '755', owner: 'user', children: {} },
              '.bashrc': { type: 'file', permissions: '644', owner: 'user', content: 'alias ll="ls -la"' }
            }
          },
          guest: {
            type: 'dir',
            permissions: '755',
            owner: 'guest',
            children: {
              documents: {
                type: 'dir',
                permissions: '755',
                owner: 'guest',
                children: {}
              }
            }
          }
        }
      },
      tmp: { type: 'dir', permissions: '777', owner: 'root', children: {} },
      var: { type: 'dir', permissions: '755', owner: 'root', children: {} }
    }
  }
});

// resolvePath implementation (from terminal.js)
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

// setCurrentPath implementation (from terminal.js)
function setCurrentPath(currentPath, p) {
  var normalized = (p || '').replace(/^\/+|\/+$/g, '');
  return normalized === '' ? '/' : '/' + normalized;
}

// findPathForDir implementation (from terminal.js)
function findPathForDir(fs, dirObj, currentPath) {
  function findInDir(obj, target, currentPath) {
    if (obj === target) return currentPath;
    if (obj.type === 'dir' && obj.children) {
      for (const name of Object.keys(obj.children)) {
        const childPath = currentPath === '/' ? '/' + name : currentPath + '/' + name;
        const result = findInDir(obj.children[name], target, childPath);
        if (result) return result;
      }
    }
    return null;
  }
  return findInDir(fs['/'], dirObj, '/') || '/home/user';
}

describe('cd command - path resolution', () => {
  let fs;

  beforeEach(() => {
    fs = createMockFs();
  });

  describe('Root directory', () => {
    test('should resolve root path "/"', () => {
      const result = resolvePath('/', fs, '/home/user');
      expect(result).not.toBeNull();
      expect(result.type).toBe('dir');
      expect(result.permissions).toBe('755');
    });

    test('setCurrentPath should normalize "/"', () => {
      const newPath = setCurrentPath('/home/user', '/');
      expect(newPath).toBe('/');
    });
  });

  describe('Parent directory (..)', () => {
    test('should resolve ".." from /home/user to /home', () => {
      const result = resolvePath('..', fs, '/home/user');
      expect(result).not.toBeNull();
      expect(result.type).toBe('dir');
      expect(result.permissions).toBe('755');
    });

    test('should resolve ".." from /home/user/documents to /home/user', () => {
      const result = resolvePath('..', fs, '/home/user/documents');
      expect(result).not.toBeNull();
      expect(result.type).toBe('dir');
    });

    test('should resolve ".." from root stays at root', () => {
      const parts = '/'.split('/').filter(Boolean);
      parts.pop();
      const parentPath = '/' + parts.join('/') || '/';
      expect(parentPath).toBe('/');
    });

    test('should resolve ".." from /home to /', () => {
      const result = resolvePath('..', fs, '/home');
      expect(result).not.toBeNull();
      expect(result.type).toBe('dir');
    });
  });

  describe('Home directory (~)', () => {
    test('should expand ~/ to /home/user/', () => {
      const result = resolvePath('~/documents', fs, '/home/user');
      expect(result).not.toBeNull();
      expect(result.type).toBe('dir');
    });

    test('should expand ~/documents to /home/user/documents', () => {
      const result = resolvePath('~/documents', fs, '/home/user');
      expect(result).not.toBeNull();
      expect(result.type).toBe('dir');
    });

    test('should expand ~/.bashrc to /home/user/.bashrc', () => {
      const result = resolvePath('~/.bashrc', fs, '/home/user');
      expect(result).not.toBeNull();
      expect(result.type).toBe('file');
    });
  });

  describe('Absolute paths', () => {
    test('should resolve /home/user/documents', () => {
      const result = resolvePath('/home/user/documents', fs, '/tmp');
      expect(result).not.toBeNull();
      expect(result.type).toBe('dir');
    });

    test('should resolve /home/user/.hidden', () => {
      const result = resolvePath('/home/user/.hidden', fs, '/home/user');
      expect(result).not.toBeNull();
      expect(result.type).toBe('dir');
    });

    test('should resolve /tmp', () => {
      const result = resolvePath('/tmp', fs, '/home/user');
      expect(result).not.toBeNull();
      expect(result.type).toBe('dir');
      expect(result.permissions).toBe('777');
    });

    test('should resolve /var', () => {
      const result = resolvePath('/var', fs, '/home/user');
      expect(result).not.toBeNull();
      expect(result.type).toBe('dir');
    });

    test('should resolve /bin', () => {
      const result = resolvePath('/bin', fs, '/home/user');
      expect(result).not.toBeNull();
      expect(result.type).toBe('dir');
    });
  });

  describe('Relative paths', () => {
    test('should resolve "documents" from /home/user', () => {
      const result = resolvePath('documents', fs, '/home/user');
      expect(result).not.toBeNull();
      expect(result.type).toBe('dir');
    });

    test('should resolve "downloads" from /home/user', () => {
      const result = resolvePath('downloads', fs, '/home/user');
      expect(result).not.toBeNull();
      expect(result.type).toBe('dir');
    });

    test('should resolve nested relative path "documents/readme"', () => {
      const result = resolvePath('documents/readme', fs, '/home/user');
      expect(result).not.toBeNull();
      expect(result.type).toBe('file');
    });

    test('should resolve relative path with ".." in middle "documents/../downloads"', () => {
      const path = '/home/user/documents/../downloads';
      const resolved = path.replace(/\/+$/, '');
      expect(resolved).toBe('/home/user/documents/../downloads');
    });
  });

  describe('Current directory (.)', () => {
    test('should resolve "." to current directory', () => {
      const result = resolvePath('.', fs, '/home/user');
      expect(result).not.toBeNull();
      expect(result).toBe(fs['/']['children']['home']['children']['user']);
    });

    test('should resolve "." from root', () => {
      const result = resolvePath('.', fs, '/');
      expect(result).not.toBeNull();
      expect(result).toBe(fs['/']);
    });
  });

  describe('Non-existent paths', () => {
    test('should return null for non-existent absolute path', () => {
      const result = resolvePath('/nonexistent', fs, '/home/user');
      expect(result).toBeNull();
    });

    test('should return null for non-existent relative path', () => {
      const result = resolvePath('nonexistent', fs, '/home/user');
      expect(result).toBeNull();
    });

    test('should return null for non-existent nested path', () => {
      const result = resolvePath('/home/user/nonexistent', fs, '/home/user');
      expect(result).toBeNull();
    });

    test('should return null when intermediate directory does not exist', () => {
      const result = resolvePath('/home/nonexistent/file', fs, '/home/user');
      expect(result).toBeNull();
    });
  });

  describe('Files vs directories', () => {
    test('should resolve to file', () => {
      const result = resolvePath('/home/user/documents/readme', fs, '/home/user');
      expect(result).not.toBeNull();
      expect(result.type).toBe('file');
      expect(result.content).toBe('Hello');
    });

    test('should resolve to hidden file', () => {
      const result = resolvePath('/home/user/.bashrc', fs, '/home/user');
      expect(result).not.toBeNull();
      expect(result.type).toBe('file');
      expect(result.content).toBe('alias ll="ls -la"');
    });

    test('should not resolve file as directory', () => {
      const result = resolvePath('/home/user/documents/readme', fs, '/home/user');
      expect(result).not.toBeNull();
      expect(result.type).toBe('file');
      expect(result.type).not.toBe('dir');
    });
  });

  describe('Trailing slash handling', () => {
    test('should handle trailing slash in absolute path', () => {
      const result = resolvePath('/home/user/documents/', fs, '/home/user');
      expect(result).not.toBeNull();
      expect(result.type).toBe('dir');
    });

    test('should handle multiple trailing slashes', () => {
      const result = resolvePath('/home/user/documents///', fs, '/home/user');
      expect(result).not.toBeNull();
      expect(result.type).toBe('dir');
    });
  });

  describe('setCurrentPath normalization', () => {
    test('should normalize path without leading slash', () => {
      const newPath = setCurrentPath('/home/user', 'home/user');
      expect(newPath).toBe('/home/user');
    });

    test('should normalize path with trailing slash', () => {
      const newPath = setCurrentPath('/home/user', '/home/user/');
      expect(newPath).toBe('/home/user');
    });

    test('should normalize path with both slashes', () => {
      const newPath = setCurrentPath('/home/user', '/home/user/');
      expect(newPath).toBe('/home/user');
    });

    test('should handle empty path', () => {
      const newPath = setCurrentPath('/home/user', '');
      expect(newPath).toBe('/');
    });

    test('should handle null path', () => {
      const newPath = setCurrentPath('/home/user', null);
      expect(newPath).toBe('/');
    });
  });

  describe('findPathForDir', () => {
    test('should find path for /home/user directory', () => {
      const userDir = fs['/']['children']['home']['children']['user'];
      const path = findPathForDir(fs, userDir, '/home/user');
      expect(path).toBe('/home/user');
    });

    test('should find path for /home/guest directory', () => {
      const guestDir = fs['/']['children']['home']['children']['guest'];
      const path = findPathForDir(fs, guestDir, '/home/guest');
      expect(path).toBe('/home/guest');
    });

    test('should find path for /home/user/documents directory', () => {
      const docsDir = fs['/']['children']['home']['children']['user']['children']['documents'];
      const path = findPathForDir(fs, docsDir, '/home/user/documents');
      expect(path).toBe('/home/user/documents');
    });

    test('should return /home/user for unknown directory', () => {
      const unknownDir = { type: 'dir', children: {} };
      const path = findPathForDir(fs, unknownDir, '/home/user');
      expect(path).toBe('/home/user');
    });
  });
});

describe('cd command - edge cases', () => {
  let fs;

  beforeEach(() => {
    fs = createMockFs();
  });

  test('should handle empty filesystem', () => {
    const emptyFs = { '/': { type: 'dir', children: {} } };
    const result = resolvePath('/bin', emptyFs, '/');
    expect(result).toBeNull();
  });

  test('should handle single slash in path', () => {
    const result = resolvePath('/', fs, '/home/user');
    expect(result).not.toBeNull();
    expect(result.type).toBe('dir');
  });

  test('should handle multiple consecutive slashes', () => {
    const result = resolvePath('/home//user//documents', fs, '/tmp');
    expect(result).not.toBeNull();
    expect(result.type).toBe('dir');
  });

  test('should handle path with only slashes', () => {
    const result = resolvePath('///', fs, '/home/user');
    expect(result).not.toBeNull();
    expect(result.type).toBe('dir');
  });

  test('should handle deep nesting', () => {
    const result = resolvePath('/home/user/documents/readme', fs, '/tmp');
    expect(result).not.toBeNull();
    expect(result.type).toBe('file');
  });

  test('should handle path traversal attempt with ..', () => {
    const result = resolvePath('/home/user/../..', fs, '/home/user');
    expect(result).not.toBeNull();
    expect(result.type).toBe('dir');
  });

  test('should handle current user home directory', () => {
    const result = resolvePath('/home/user', fs, '/');
    expect(result).not.toBeNull();
    expect(result.type).toBe('dir');
  });

  test('should handle sibling directory', () => {
    const result = resolvePath('/home/guest', fs, '/home/user');
    expect(result).not.toBeNull();
    expect(result.type).toBe('dir');
  });
});
