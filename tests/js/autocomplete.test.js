/**
 * Tests for path autocomplete functionality
 * 
 * Tests autoCompletePath() and getFSMatches() — specifically
 * the cd ../<folder> case that was broken.
 */

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

// getFSMatches (matches fixed terminal.js)
function getFSMatches(prefix, fs, currentPath) {
  if (prefix.includes('/')) {
    var slashIdx = prefix.lastIndexOf('/');
    var dirPart = prefix.substring(0, slashIdx);
    var searchPrefix = prefix.substring(slashIdx + 1);
    var dir = dirPart === '' ? resolvePath('/', fs, currentPath) : resolvePath(dirPart, fs, currentPath);
    if (!dir || dir.type !== 'dir') return [];
    var matches = [];
    var children = dir.children || {};
    for (var name of Object.keys(children)) {
      if (name.startsWith(searchPrefix)) {
        var item = children[name];
        var suffix = item.type === 'dir' ? '/' : '';
        matches.push({ name: name + suffix, isDir: item.type === 'dir' });
      }
    }
    return matches;
  }
  var dir = resolvePath(currentPath, fs, currentPath);
  if (!dir || dir.type !== 'dir') return [];
  var matches = [];
  var children = dir.children || {};
  for (var name of Object.keys(children)) {
    if (name.startsWith(prefix)) {
      var item = children[name];
      var suffix = item.type === 'dir' ? '/' : '';
      matches.push({ name: name + suffix, isDir: item.type === 'dir' });
    }
  }
  return matches;
}

// pathAutocompleteCommands (matches terminal.js)
var pathAutocompleteCommands = new Set([
  'ls', 'cat', 'echo', 'rm', 'cp', 'mv', 'touch', 'mkdir', 'rmdir',
  'cd', 'head', 'tail', 'grep', 'find', 'chmod', 'chown', 'chgrp',
  'less', 'more', 'sort', 'uniq', 'cut', 'diff', 'comm', 'tee',
  'wc', 'sed', 'awk', 'xargs', 'rsync', 'scp', 'ssh', 'ping',
  'curl', 'wget', 'tar', 'zip', 'unzip', 'ln', 'du', 'stat',
  'file', 'basename', 'dirname', 'readlink'
]);

// autoCompletePath (matches fixed terminal.js)
function autoCompletePath(inputVal, fs, currentPath) {
  var trimmed = inputVal.replace(/\s+$/, '');
  var parts = trimmed.split(/\s+/);
  if (parts.length < 2) return null;
  var cmdName = parts[0].toLowerCase();
  if (!pathAutocompleteCommands.has(cmdName)) return null;
  var lastArg = parts[parts.length - 1];
  var prefix = '';
  var searchPath = currentPath;
  if (lastArg.startsWith('/')) {
    var slashIdx = lastArg.lastIndexOf('/');
    if (slashIdx === 0) {
      prefix = lastArg.substring(1);
      searchPath = '/';
    } else if (slashIdx > 0) {
      var dirPart = lastArg.substring(0, slashIdx);
      prefix = lastArg.substring(slashIdx + 1);
      searchPath = dirPart;
    } else {
      prefix = lastArg;
    }
  } else if (lastArg.startsWith('~/')) {
    var slashIdx = lastArg.lastIndexOf('/');
    if (slashIdx > 0) {
      var dirPart = lastArg.substring(0, slashIdx);
      prefix = lastArg.substring(slashIdx + 1);
      searchPath = '/home/user/' + dirPart.slice(2);
    } else {
      prefix = lastArg.slice(2);
      searchPath = '/home/user';
    }
  } else {
    var slashIdx = lastArg.lastIndexOf('/');
    if (slashIdx >= 0) {
      prefix = lastArg.substring(slashIdx + 1);
      var dirPart = lastArg.substring(0, slashIdx);
      var dir = resolvePath(dirPart, fs, currentPath);
      if (dir && dir.type === 'dir') {
        searchPath = dirPart;
      } else {
        return null;
      }
    } else {
      prefix = lastArg;
    }
  }
  var searchPrefix = (searchPath.endsWith('/') ? searchPath.slice(0, -1) : searchPath) + '/' + prefix;
  var matches = getFSMatches(searchPrefix, fs, currentPath);
  if (matches.length === 1) {
    var lastSlashIdx = lastArg.lastIndexOf('/');
    var completedName = matches[0].name;
    if (lastSlashIdx >= 0) {
      parts[parts.length - 1] = lastArg.substring(0, lastSlashIdx + 1) + completedName;
    } else {
      parts[parts.length - 1] = completedName;
    }
    var result = parts.join(' ');
    return result;
  }
  return null;
}

// Mock filesystem with pictures/ and downloads/ dirs
const createMockFs = () => ({
  '/': {
    type: 'dir', permissions: '755', owner: 'root', children: {
      bin: { type: 'dir', permissions: '755', owner: 'root', children: {} },
      etc: { type: 'dir', permissions: '755', owner: 'root', children: {} },
      home: {
        type: 'dir', permissions: '755', owner: 'root', children: {
          user: {
            type: 'dir', permissions: '755', owner: 'user', children: {
              documents: {
                type: 'dir', permissions: '755', owner: 'user', children: {
                  readme: { type: 'file', permissions: '644', owner: 'user', content: 'Hello\n' },
                  notes: { type: 'file', permissions: '644', owner: 'user', content: 'Notes\n' }
                }
              },
              downloads: { type: 'dir', permissions: '755', owner: 'user', children: {} },
              pictures: {
                type: 'dir', permissions: '755', owner: 'user', children: {
                  'photo1.jpg': { type: 'file', permissions: '644', owner: 'user', content: '' },
                  'photo2.jpg': { type: 'file', permissions: '644', owner: 'user', content: '' }
                }
              },
              '.bashrc': { type: 'file', permissions: '644', owner: 'user', content: 'alias ll="ls -la"\n' }
            }
          },
          guest: {
            type: 'dir', permissions: '755', owner: 'guest', children: {}
          }
        }
      },
      tmp: { type: 'dir', permissions: '777', owner: 'root', children: {} },
      var: { type: 'dir', permissions: '755', owner: 'root', children: {} }
    }
  }
});

// ==================== getFSMatches tests ====================
describe('getFSMatches', () => {
  let fs;

  beforeEach(() => { fs = createMockFs(); });

  test('should find children by prefix in current directory', () => {
    var matches = getFSMatches('doc', fs, '/home/user');
    expect(matches.length).toBe(1);
    expect(matches[0].name).toBe('documents/');
  });

  test('should find multiple matches', () => {
    var matches = getFSMatches('d', fs, '/home/user');
    expect(matches.length).toBe(2);
    var names = matches.map(m => m.name);
    expect(names).toContain('documents/');
    expect(names).toContain('downloads/');
  });

  test('should find files not directories', () => {
    var matches = getFSMatches('read', fs, '/home/user/documents');
    expect(matches.length).toBe(1);
    expect(matches[0].name).toBe('readme');
    expect(matches[0].isDir).toBe(false);
  });

  test('should mark directories with trailing slash', () => {
    var matches = getFSMatches('down', fs, '/home/user');
    expect(matches[0].name).toBe('downloads/');
    expect(matches[0].isDir).toBe(true);
  });

  test('should return empty for no matches', () => {
    var matches = getFSMatches('xyz', fs, '/home/user');
    expect(matches).toEqual([]);
  });

  test('should find hidden files with . prefix', () => {
    var matches = getFSMatches('.b', fs, '/home/user');
    expect(matches.length).toBe(1);
    expect(matches[0].name).toBe('.bashrc');
  });

  test('should search in absolute path directory', () => {
    var matches = getFSMatches('/home/user/pic', fs, '/tmp');
    expect(matches.length).toBe(1);
    expect(matches[0].name).toBe('pictures/');
  });

  test('should search in root with empty dirPart', () => {
    var matches = getFSMatches('/ho', fs, '/home/user');
    expect(matches.length).toBe(1);
    expect(matches[0].name).toBe('home/');
  });

  test('should search in .. directory', () => {
    var matches = getFSMatches('../pic', fs, '/home/user/downloads');
    expect(matches.length).toBe(1);
    expect(matches[0].name).toBe('pictures/');
  });

  test('should search in .. from documents', () => {
    var matches = getFSMatches('../down', fs, '/home/user/documents');
    expect(matches.length).toBe(1);
    expect(matches[0].name).toBe('downloads/');
  });
});

// ==================== autoCompletePath tests ====================
describe('autoCompletePath - absolute paths', () => {
  let fs;

  beforeEach(() => { fs = createMockFs(); });

  test('should complete absolute path', () => {
    var result = autoCompletePath('cd /home/user/doc', fs, '/home/user');
    expect(result).toBe('cd /home/user/documents/');
  });

  test('should complete from root', () => {
    var result = autoCompletePath('ls /ho', fs, '/home/user');
    expect(result).toBe('ls /home/');
  });

  test('should complete /home/user/pic', () => {
    var result = autoCompletePath('cd /home/user/pic', fs, '/tmp');
    expect(result).toBe('cd /home/user/pictures/');
  });

  test('should complete file path', () => {
    var result = autoCompletePath('cat /home/user/documents/rea', fs, '/home/user');
    expect(result).toBe('cat /home/user/documents/readme');
  });

  test('should return null for non-existent path', () => {
    var result = autoCompletePath('cd /nonexist/fo', fs, '/home/user');
    expect(result).toBeNull();
  });

  test('should return null for command not in pathAutocompleteCommands', () => {
    var result = autoCompletePath('man /home/user/doc', fs, '/home/user');
    expect(result).toBeNull();
  });
});

describe('autoCompletePath - tilde paths', () => {
  let fs;

  beforeEach(() => { fs = createMockFs(); });

  test('should complete ~/ path', () => {
    var result = autoCompletePath('cd ~/doc', fs, '/tmp');
    expect(result).toBe('cd ~/documents/');
  });

  test('should complete ~/pic', () => {
    var result = autoCompletePath('cd ~/pic', fs, '/tmp');
    expect(result).toBe('cd ~/pictures/');
  });
});

describe('autoCompletePath - relative paths', () => {
  let fs;

  beforeEach(() => { fs = createMockFs(); });

  test('should complete relative path in current dir', () => {
    var result = autoCompletePath('cd doc', fs, '/home/user');
    expect(result).toBe('cd documents/');
  });

  test('should complete relative file path', () => {
    var result = autoCompletePath('cat documents/rea', fs, '/home/user');
    expect(result).toBe('cat documents/readme');
  });
});

// ==================== THE BUG FIX: cd ../<folder> ====================
describe('autoCompletePath - ../ relative paths (the bug fix)', () => {
  let fs;

  beforeEach(() => { fs = createMockFs(); });

  test('should complete cd ../pic from /home/user/downloads', () => {
    var result = autoCompletePath('cd ../pic', fs, '/home/user/downloads');
    expect(result).toBe('cd ../pictures/');
  });

  test('should complete cd ../down from /home/user/documents', () => {
    var result = autoCompletePath('cd ../down', fs, '/home/user/documents');
    expect(result).toBe('cd ../downloads/');
  });

  test('should complete cd ../documents/rea from /home/user/downloads', () => {
    var result = autoCompletePath('cat ../documents/rea', fs, '/home/user/downloads');
    expect(result).toBe('cat ../documents/readme');
  });

  test('should complete cd ../../user/doc from /home/user/downloads', () => {
    var result = autoCompletePath('cd ../../user/doc', fs, '/home/user/downloads');
    expect(result).toBe('cd ../../user/documents/');
  });

  test('should complete ls ../pic from /home/user/downloads', () => {
    var result = autoCompletePath('ls ../pic', fs, '/home/user/downloads');
    expect(result).toBe('ls ../pictures/');
  });

  test('should complete cp ../pic from /home/user/downloads', () => {
    var result = autoCompletePath('cp ../pic', fs, '/home/user/downloads');
    expect(result).toBe('cp ../pictures/');
  });

  test('should complete rm ../documents/rea from /home/user/downloads', () => {
    var result = autoCompletePath('rm ../documents/rea', fs, '/home/user/downloads');
    expect(result).toBe('rm ../documents/readme');
  });

  test('should return null for non-existent ../ path', () => {
    var result = autoCompletePath('cd ../xyz', fs, '/home/user/downloads');
    expect(result).toBeNull();
  });

  test('should complete cd ../ from /home/user/documents (multiple matches)', () => {
    // ../ matches multiple dirs in /home/user, so no single completion
    var result = autoCompletePath('cd ../d', fs, '/home/user/documents');
    // Should match both documents/ and downloads/ → no single match → null
    // Actually 'd' matches 'documents' and 'downloads' → 2 matches → null
    expect(result).toBeNull();
  });

  test('should complete cd ../pi from /home/user/downloads → pictures/', () => {
    var result = autoCompletePath('cd ../pi', fs, '/home/user/downloads');
    expect(result).toBe('cd ../pictures/');
  });

  test('should handle cd .. with no prefix', () => {
    // cd ..  → just '..' with empty prefix → multiple matches → null
    var result = autoCompletePath('cd ..', fs, '/home/user/downloads');
    // '..' has no slash in the lastArg beyond the one at position 1
    // Actually '..' has no slash at all → prefix = '..' → searches current dir
    // This should find nothing matching '..' in current dir
    expect(result).toBeNull();
  });
});

// ==================== Edge cases ====================
describe('autoCompletePath - edge cases', () => {
  let fs;

  beforeEach(() => { fs = createMockFs(); });

  test('should return null for single word (no args)', () => {
    expect(autoCompletePath('cd', fs, '/home/user')).toBeNull();
  });

  test('should return null for empty input', () => {
    expect(autoCompletePath('', fs, '/home/user')).toBeNull();
  });

  test('should return null for command not in path set', () => {
    expect(autoCompletePath('help /home', fs, '/home/user')).toBeNull();
  });

  test('should return null when no matches', () => {
    expect(autoCompletePath('cd /zzz', fs, '/home/user')).toBeNull();
  });

  test('should return null for multiple matches (ambiguous)', () => {
    // 'd' matches both documents/ and downloads/ → 2 matches → null
    expect(autoCompletePath('cd /home/user/d', fs, '/tmp')).toBeNull();
  });

  test('should complete with trailing slash for directories', () => {
    var result = autoCompletePath('cd /home/user/doc', fs, '/tmp');
    expect(result).toContain('/');
  });

  test('should not add trailing slash for files', () => {
    var result = autoCompletePath('cat /home/user/documents/rea', fs, '/tmp');
    expect(result).toBe('cat /home/user/documents/readme');
    expect(result).not.toMatch(/readme\/$/);
  });
});
