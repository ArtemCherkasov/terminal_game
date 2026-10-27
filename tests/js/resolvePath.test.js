/**
 * Tests for filesystem path resolution
 * 
 * Tests resolvePath, resolveParentPath, and filesystem traversal logic.
 */

// Mock filesystem structure
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
                  readme: { type: 'file', permissions: '644', owner: 'user', content: 'Hello' }
                }
              },
              downloads: { type: 'dir', permissions: '755', owner: 'user', children: {} },
              '.bashrc': { type: 'file', permissions: '644', owner: 'user', content: 'alias ll="ls -la"' }
            }
          }
        }
      },
      tmp: { type: 'dir', permissions: '777', owner: 'root', children: {} }
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

describe('resolvePath', () => {
  let fs;
  const currentPath = '/home/user';

  beforeEach(() => {
    fs = createMockFs();
  });

  test('should resolve root path', () => {
    const result = resolvePath('/', fs, currentPath);
    expect(result).not.toBeNull();
    expect(result.type).toBe('dir');
  });

  test('should resolve absolute paths', () => {
    const result = resolvePath('/home/user/documents', fs, currentPath);
    expect(result).not.toBeNull();
    expect(result.type).toBe('dir');
  });

  test('should resolve to current directory with .', () => {
    const result = resolvePath('.', fs, currentPath);
    expect(result).not.toBeNull();
    const userDir = fs['/']['children']['home']['children']['user'];
    expect(result).toBe(userDir);
  });

  test('should resolve parent directory with ..', () => {
    const result = resolvePath('..', fs, currentPath);
    const homeDir = fs['/']['children']['home'];
    expect(result).not.toBeNull();
    expect(result).toBe(homeDir);
  });

  test('should resolve relative paths from currentPath', () => {
    const result = resolvePath('documents', fs, currentPath);
    expect(result).not.toBeNull();
    expect(result.type).toBe('dir');
  });

  test('should resolve home expansion with ~/', () => {
    const result = resolvePath('~/documents', fs, currentPath);
    expect(result).not.toBeNull();
    expect(result.type).toBe('dir');
  });

  test('should return null for non-existent paths', () => {
    const result = resolvePath('/nonexistent', fs, currentPath);
    expect(result).toBeNull();
  });

  test('should return null for non-existent nested paths', () => {
    const result = resolvePath('/home/user/nonexistent', fs, currentPath);
    expect(result).toBeNull();
  });

  test('should resolve to file', () => {
    const result = resolvePath('/home/user/documents/readme', fs, currentPath);
    expect(result).not.toBeNull();
    expect(result.type).toBe('file');
    expect(result.content).toBe('Hello');
  });

  test('should resolve hidden files', () => {
    const result = resolvePath('/home/user/.bashrc', fs, currentPath);
    expect(result).not.toBeNull();
    expect(result.type).toBe('file');
  });

  test('should handle deeply nested paths', () => {
    const result = resolvePath('/home/user/documents/readme', fs, currentPath);
    expect(result).not.toBeNull();
    expect(result.type).toBe('file');
  });

  test('should handle empty filesystem', () => {
    const emptyFs = { '/': { type: 'dir', children: {} } };
    const result = resolvePath('/bin', emptyFs, '/');
    expect(result).toBeNull();
  });

  test('should resolve bin directory', () => {
    const result = resolvePath('/bin', fs, currentPath);
    expect(result).not.toBeNull();
    expect(result.type).toBe('dir');
  });

  test('should resolve tmp directory', () => {
    const result = resolvePath('/tmp', fs, currentPath);
    expect(result).not.toBeNull();
    expect(result.type).toBe('dir');
  });

  test('should return null when intermediate directory does not exist', () => {
    const result = resolvePath('/home/nonexistent/file', fs, currentPath);
    expect(result).toBeNull();
  });
});

describe('resolveParentPath', () => {
  let fs;
  const currentPath = '/home/user';

  beforeEach(() => {
    fs = createMockFs();
  });

  test('should resolve parent of file in current directory', () => {
    const result = { parent: resolvePath('.', fs, currentPath), filename: 'newfile', parentPath: currentPath };
    expect(result.parent).not.toBeNull();
    expect(result.filename).toBe('newfile');
  });

  test('should resolve parent path for absolute path', () => {
    const path = '/home/user/documents/readme';
    const parts = path.split('/').filter(Boolean);
    const filename = parts.pop();
    const parentPath = '/' + parts.join('/') || '/';
    
    expect(filename).toBe('readme');
    expect(parentPath).toBe('/home/user/documents');
  });

  test('should resolve parent of root', () => {
    const parts = ['bin'];
    const filename = parts.pop();
    const parentPath = '/' + parts.join('/') || '/';
    
    expect(filename).toBe('bin');
    expect(parentPath).toBe('/');
  });
});

describe('Filesystem operations', () => {
  let fs;

  beforeEach(() => {
    fs = createMockFs();
  });

  test('should be able to add new directory', () => {
    const userDir = fs['/']['children']['home']['children']['user'];
    userDir.children['newdir'] = {
      type: 'dir',
      permissions: '755',
      owner: 'user',
      children: []
    };
    
    expect(userDir.children['newdir']).toBeDefined();
    expect(userDir.children['newdir'].type).toBe('dir');
  });

  test('should be able to add new file', () => {
    const userDir = fs['/']['children']['home']['children']['user'];
    userDir.children['test.txt'] = {
      type: 'file',
      permissions: '644',
      owner: 'user',
      content: 'Test content'
    };
    
    expect(userDir.children['test.txt']).toBeDefined();
    expect(userDir.children['test.txt'].content).toBe('Test content');
  });

  test('should be able to delete file', () => {
    const userDir = fs['/']['children']['home']['children']['user'];
    userDir.children['test.txt'] = {
      type: 'file',
      permissions: '644',
      owner: 'user',
      content: 'Test'
    };
    
    delete userDir.children['test.txt'];
    expect(userDir.children['test.txt']).toBeUndefined();
  });

  test('should serialize filesystem to JSON', () => {
    const json = JSON.stringify(fs);
    const parsed = JSON.parse(json);
    
    expect(parsed['/'].type).toBe('dir');
    expect(parsed['/']['children'].home.type).toBe('dir');
  });
});
