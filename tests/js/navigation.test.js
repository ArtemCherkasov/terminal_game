/**
 * Tests for resolvePath, resolveParentPath, setCurrentPath, findPathForDir
 * 
 * Comprehensive tests for filesystem navigation logic matching terminal.js.
 */

// Mock filesystem
const createMockFs = () => ({
  '/': {
    type: 'dir', permissions: '755', owner: 'root', children: {
      bin: { type: 'dir', permissions: '755', owner: 'root', children: {
        bash: { type: 'file', permissions: '755', owner: 'root', content: '' }
      }},
      etc: {
        type: 'dir', permissions: '755', owner: 'root', children: {
          passwd: { type: 'file', permissions: '644', owner: 'root', content: 'root:x:0:0\n' },
          hosts: { type: 'file', permissions: '644', owner: 'root', content: '127.0.0.1 localhost\n' }
        }
      },
      home: {
        type: 'dir', permissions: '755', owner: 'root', children: {
          user: {
            type: 'dir', permissions: '755', owner: 'user', children: {
              documents: {
                type: 'dir', permissions: '755', owner: 'user', children: {
                  readme: { type: 'file', permissions: '644', owner: 'user', content: 'Hello\n' },
                  notes: { type: 'file', permissions: '644', owner: 'user', content: 'Notes\n' },
                  subfolder: {
                    type: 'dir', permissions: '755', owner: 'user', children: {
                      deep: { type: 'file', permissions: '644', owner: 'user', content: 'Deep file\n' }
                    }
                  }
                }
              },
              downloads: { type: 'dir', permissions: '755', owner: 'user', children: {} },
              '.hidden': {
                type: 'dir', permissions: '755', owner: 'user', children: {
                  secret: { type: 'file', permissions: '644', owner: 'user', content: 'Secret\n' }
                }
              },
              '.bashrc': { type: 'file', permissions: '644', owner: 'user', content: 'alias ll="ls -la"\n' }
            }
          },
          guest: {
            type: 'dir', permissions: '755', owner: 'guest', children: {
              documents: { type: 'dir', permissions: '755', owner: 'guest', children: {} }
            }
          }
        }
      },
      tmp: { type: 'dir', permissions: '777', owner: 'root', children: {} },
      var: {
        type: 'dir', permissions: '755', owner: 'root', children: {
          log: { type: 'dir', permissions: '755', owner: 'root', children: {} }
        }
      }
    }
  }
});

// resolvePath implementation (matches terminal.js)
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

// resolveParentPath implementation (matches terminal.js)
function resolveParentPath(path, fs, currentPath) {
  var resolvedPath = path;
  if (!path.startsWith('/')) { resolvedPath = currentPath + '/' + path; }
  var parts = resolvedPath.split('/').filter(Boolean);
  var filename = parts.pop();
  var parentPath = '/' + parts.join('/') || '/';
  return { parent: resolvePath(parentPath, fs, currentPath), filename: filename, parentPath: parentPath };
}

// setCurrentPath implementation (matches terminal.js)
function setCurrentPath(currentPath, p) {
  var normalized = (p || '').replace(/^\/+|\/+$/g, '');
  return normalized === '' ? '/' : '/' + normalized;
}

// findPathForDir implementation (matches terminal.js)
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

// ==================== resolvePath tests ====================
describe('resolvePath - basic path types', () => {
  let fs;
  const cp = '/home/user';

  beforeEach(() => { fs = createMockFs(); });

  test('should resolve root "/"', () => {
    var r = resolvePath('/', fs, cp);
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
  });

  test('should resolve current dir "."', () => {
    var r = resolvePath('.', fs, cp);
    expect(r).not.toBeNull();
  });

  test('should resolve parent ".."', () => {
    var r = resolvePath('..', fs, '/home/user/documents');
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
  });

  test('should resolve absolute path', () => {
    var r = resolvePath('/home/user/documents', fs, cp);
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
  });

  test('should resolve relative path', () => {
    var r = resolvePath('documents', fs, cp);
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
  });

  test('should resolve nested relative path', () => {
    var r = resolvePath('documents/readme', fs, cp);
    expect(r).not.toBeNull();
    expect(r.type).toBe('file');
    expect(r.content).toBe('Hello\n');
  });

  test('should resolve home directory ~/', () => {
    var r = resolvePath('~/documents', fs, '/tmp');
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
  });

  test('should resolve hidden file ~/.bashrc', () => {
    var r = resolvePath('~/.bashrc', fs, cp);
    expect(r).not.toBeNull();
    expect(r.type).toBe('file');
  });

  test('should resolve hidden directory', () => {
    var r = resolvePath('/home/user/.hidden', fs, cp);
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
  });

  test('should resolve file in hidden directory', () => {
    var r = resolvePath('/home/user/.hidden/secret', fs, cp);
    expect(r).not.toBeNull();
    expect(r.type).toBe('file');
    expect(r.content).toBe('Secret\n');
  });
});

describe('resolvePath - .. traversal', () => {
  let fs;
  const cp = '/home/user';

  beforeEach(() => { fs = createMockFs(); });

  test('should go up one level from /home/user', () => {
    var r = resolvePath('..', fs, '/home/user');
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
  });

  test('should go up from deep path', () => {
    var r = resolvePath('..', fs, '/home/user/documents/subfolder');
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
  });

  test('should handle .. in middle of path', () => {
    var r = resolvePath('/home/user/documents/../downloads', fs, cp);
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
  });

  test('should handle multiple .. in path', () => {
    var r = resolvePath('/home/user/documents/subfolder/../../downloads', fs, cp);
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
  });

  test('should handle .. from root stays at root', () => {
    var r = resolvePath('..', fs, '/');
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
  });

  test('should handle ../../ from deep path', () => {
    var r = resolvePath('/home/user/documents/subfolder/../../..', fs, cp);
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
  });

  test('should resolve ../sibling correctly', () => {
    var r = resolvePath('../guest', fs, '/home/user');
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
  });

  test('should not traverse above root', () => {
    var r = resolvePath('/home/user/../../../../..', fs, cp);
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
  });
});

describe('resolvePath - edge cases', () => {
  let fs;
  const cp = '/home/user';

  beforeEach(() => { fs = createMockFs(); });

  test('should return null for non-existent path', () => {
    expect(resolvePath('/nonexistent', fs, cp)).toBeNull();
  });

  test('should return null for non-existent nested path', () => {
    expect(resolvePath('/home/user/nonexistent', fs, cp)).toBeNull();
  });

  test('should return null for non-existent deep path', () => {
    expect(resolvePath('/home/user/documents/nonexistent', fs, cp)).toBeNull();
  });

  test('should return null when intermediate dir missing', () => {
    expect(resolvePath('/home/nonexistent/file', fs, cp)).toBeNull();
  });

  test('should return null for empty filesystem', () => {
    expect(resolvePath('/bin', { '/': { type: 'dir', children: {} } }, cp)).toBeNull();
  });

  test('should return null when fs has no root', () => {
    expect(resolvePath('/bin', {}, cp)).toBeNull();
  });

  test('should handle trailing slash', () => {
    var r = resolvePath('/home/user/documents/', fs, cp);
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
  });

  test('should handle multiple trailing slashes', () => {
    var r = resolvePath('/home/user/documents///', fs, cp);
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
  });

  test('should handle multiple consecutive slashes', () => {
    var r = resolvePath('/home//user//documents', fs, cp);
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
  });

  test('should handle path with only slashes', () => {
    var r = resolvePath('///', fs, cp);
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
  });

  test('should handle . in path', () => {
    var r = resolvePath('/home/./user/./documents', fs, cp);
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
  });

  test('should resolve deeply nested file', () => {
    var r = resolvePath('/home/user/documents/subfolder/deep', fs, cp);
    expect(r).not.toBeNull();
    expect(r.type).toBe('file');
    expect(r.content).toBe('Deep file\n');
  });

  test('should resolve file in /etc', () => {
    var r = resolvePath('/etc/passwd', fs, cp);
    expect(r).not.toBeNull();
    expect(r.type).toBe('file');
  });

  test('should resolve /var/log', () => {
    var r = resolvePath('/var/log', fs, cp);
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
  });

  test('should resolve /bin/bash', () => {
    var r = resolvePath('/bin/bash', fs, cp);
    expect(r).not.toBeNull();
    expect(r.type).toBe('file');
  });
});

// ==================== resolveParentPath tests ====================
describe('resolveParentPath', () => {
  let fs;
  const cp = '/home/user';

  beforeEach(() => { fs = createMockFs(); });

  test('should resolve parent of absolute file path', () => {
    var r = resolveParentPath('/home/user/documents/readme', fs, cp);
    expect(r.parent).not.toBeNull();
    expect(r.filename).toBe('readme');
    expect(r.parentPath).toBe('/home/user/documents');
  });

  test('should resolve parent of root-level file', () => {
    var r = resolveParentPath('/etc/passwd', fs, cp);
    expect(r.parent).not.toBeNull();
    expect(r.filename).toBe('passwd');
    expect(r.parentPath).toBe('/etc');
  });

  test('should resolve parent of relative path', () => {
    var r = resolveParentPath('documents/readme', fs, cp);
    expect(r.parent).not.toBeNull();
    expect(r.filename).toBe('readme');
  });

  test('should resolve parent of file in current dir', () => {
    var r = resolveParentPath('test.txt', fs, cp);
    expect(r.parent).not.toBeNull();
    expect(r.filename).toBe('test.txt');
  });

  test('should return null parent for non-existent path', () => {
    var r = resolveParentPath('/nonexistent/file', fs, cp);
    expect(r.parent).toBeNull();
    expect(r.filename).toBe('file');
  });

  test('should resolve parent of deeply nested path', () => {
    var r = resolveParentPath('/home/user/documents/subfolder/deep', fs, cp);
    expect(r.parent).not.toBeNull();
    expect(r.filename).toBe('deep');
    expect(r.parentPath).toBe('/home/user/documents/subfolder');
  });

  test('should handle path at root level', () => {
    var r = resolveParentPath('/bin', fs, cp);
    expect(r.parent).not.toBeNull();
    expect(r.filename).toBe('bin');
    expect(r.parentPath).toBe('/');
  });
});

// ==================== setCurrentPath tests ====================
describe('setCurrentPath normalization', () => {
  test('should normalize path with leading slash', () => {
    expect(setCurrentPath('/home/user', '/home/user')).toBe('/home/user');
  });

  test('should normalize path without leading slash', () => {
    expect(setCurrentPath('/home/user', 'home/user')).toBe('/home/user');
  });

  test('should remove trailing slash', () => {
    expect(setCurrentPath('/home/user', '/home/user/')).toBe('/home/user');
  });

  test('should remove multiple trailing slashes', () => {
    expect(setCurrentPath('/home/user', '/home/user///')).toBe('/home/user');
  });

  test('should remove leading and trailing slashes', () => {
    expect(setCurrentPath('/home/user', '/home/user/')).toBe('/home/user');
  });

  test('should handle root path', () => {
    expect(setCurrentPath('/home/user', '/')).toBe('/');
  });

  test('should handle empty string', () => {
    expect(setCurrentPath('/home/user', '')).toBe('/');
  });

  test('should handle null', () => {
    expect(setCurrentPath('/home/user', null)).toBe('/');
  });

  test('should handle undefined', () => {
    expect(setCurrentPath('/home/user', undefined)).toBe('/');
  });

  test('should handle double leading slash', () => {
    expect(setCurrentPath('/home/user', '//home/user')).toBe('/home/user');
  });

  test('should preserve inner slashes', () => {
    expect(setCurrentPath('/home/user', '/home/user/documents')).toBe('/home/user/documents');
  });

  test('should handle single segment', () => {
    expect(setCurrentPath('/home/user', 'tmp')).toBe('/tmp');
  });

  test('should handle path with only slashes', () => {
    expect(setCurrentPath('/home/user', '///')).toBe('/');
  });
});

// ==================== findPathForDir tests ====================
describe('findPathForDir', () => {
  let fs;

  beforeEach(() => { fs = createMockFs(); });

  test('should find path for root directory', () => {
    var path = findPathForDir(fs, fs['/']);
    expect(path).toBe('/');
  });

  test('should find path for /home/user', () => {
    var dir = fs['/']['children']['home']['children']['user'];
    expect(findPathForDir(fs, dir)).toBe('/home/user');
  });

  test('should find path for /home/guest', () => {
    var dir = fs['/']['children']['home']['children']['guest'];
    expect(findPathForDir(fs, dir)).toBe('/home/guest');
  });

  test('should find path for nested directory', () => {
    var dir = fs['/']['children']['home']['children']['user']['children']['documents'];
    expect(findPathForDir(fs, dir)).toBe('/home/user/documents');
  });

  test('should find path for deeply nested directory', () => {
    var dir = fs['/']['children']['home']['children']['user']['children']['documents']['children']['subfolder'];
    expect(findPathForDir(fs, dir)).toBe('/home/user/documents/subfolder');
  });

  test('should find path for hidden directory', () => {
    var dir = fs['/']['children']['home']['children']['user']['children']['.hidden'];
    expect(findPathForDir(fs, dir)).toBe('/home/user/.hidden');
  });

  test('should find path for /tmp', () => {
    var dir = fs['/']['children']['tmp'];
    expect(findPathForDir(fs, dir)).toBe('/tmp');
  });

  test('should find path for /var/log', () => {
    var dir = fs['/']['children']['var']['children']['log'];
    expect(findPathForDir(fs, dir)).toBe('/var/log');
  });

  test('should return /home/user for unknown dir object', () => {
    var unknown = { type: 'dir', children: {} };
    expect(findPathForDir(fs, unknown)).toBe('/home/user');
  });

  test('should return /home/user for null', () => {
    expect(findPathForDir(fs, null)).toBe('/home/user');
  });
});

// ==================== Integration: cd-like navigation ====================
describe('Navigation integration', () => {
  let fs;
  var currentPath = '/home/user';

  beforeEach(() => {
    fs = createMockFs();
    currentPath = '/home/user';
  });

  test('cd to documents then resolve relative', () => {
    currentPath = '/home/user/documents';
    var r = resolvePath('readme', fs, currentPath);
    expect(r).not.toBeNull();
    expect(r.type).toBe('file');
  });

  test('cd to documents then cd .. back', () => {
    currentPath = '/home/user/documents';
    var r = resolvePath('..', fs, currentPath);
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
    // After cd .., currentPath should be /home/user
    var newPath = setCurrentPath(currentPath, '/');
    var parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    newPath = '/' + parts.join('/') || '/';
    expect(newPath).toBe('/home/user');
  });

  test('cd to subfolder then resolve deep file', () => {
    currentPath = '/home/user/documents/subfolder';
    var r = resolvePath('deep', fs, currentPath);
    expect(r).not.toBeNull();
    expect(r.type).toBe('file');
  });

  test('cd to .hidden then resolve secret', () => {
    currentPath = '/home/user/.hidden';
    var r = resolvePath('secret', fs, currentPath);
    expect(r).not.toBeNull();
    expect(r.type).toBe('file');
    expect(r.content).toBe('Secret\n');
  });

  test('cd / → resolve absolute paths', () => {
    currentPath = '/';
    expect(resolvePath('/home/user', fs, currentPath).type).toBe('dir');
    expect(resolvePath('/etc/passwd', fs, currentPath).type).toBe('file');
    expect(resolvePath('/bin/bash', fs, currentPath).type).toBe('file');
  });

  test('cd to guest home → resolve guest files', () => {
    currentPath = '/home/guest';
    var r = resolvePath('documents', fs, currentPath);
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
  });

  test('cross-directory navigation with ..', () => {
    currentPath = '/home/user/documents';
    var r = resolvePath('../../guest/documents', fs, currentPath);
    expect(r).not.toBeNull();
    expect(r.type).toBe('dir');
  });

  test('multiple cd operations', () => {
    // cd /home/user/documents
    currentPath = setCurrentPath(currentPath, '/home/user/documents');
    expect(currentPath).toBe('/home/user/documents');

    // cd subfolder
    var dir = resolvePath('subfolder', fs, currentPath);
    expect(dir).not.toBeNull();
    expect(dir.type).toBe('dir');
    currentPath = '/home/user/documents/subfolder';

    // cd ..
    var parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    currentPath = '/' + parts.join('/') || '/';
    expect(currentPath).toBe('/home/user/documents');

    // cd ../..
    parts = currentPath.split('/').filter(Boolean);
    parts.pop(); parts.pop();
    currentPath = '/' + parts.join('/') || '/';
    expect(currentPath).toBe('/home');
  });
});
