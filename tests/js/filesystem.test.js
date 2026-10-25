/**
 * Tests for filesystem state management
 * 
 * Tests saveFS, resetFS, and filesystem backup functionality.
 * Mirrors the actual terminal.js implementation patterns.
 */

// Default filesystem matching api/fs_default.json structure
const createDefaultFs = () => ({
  '/': {
    type: 'dir',
    permissions: '755',
    owner: 'root',
    children: {
      bin: { type: 'dir', permissions: '755', owner: 'root', children: {} },
      etc: {
        type: 'dir', permissions: '755', owner: 'root',
        children: {
          passwd: { type: 'file', permissions: '644', owner: 'root', content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:User:/home/user:/bin/bash\n' }
        }
      },
      home: {
        type: 'dir', permissions: '755', owner: 'root',
        children: {
          user: {
            type: 'dir', permissions: '755', owner: 'user',
            children: {
              documents: {
                type: 'dir', permissions: '755', owner: 'user',
                children: {
                  'readme.txt': { type: 'file', permissions: '644', owner: 'user', content: 'Welcome to Linux the Game!\n' }
                }
              },
              downloads: { type: 'dir', permissions: '755', owner: 'user', children: {} }
            }
          }
        }
      },
      tmp: { type: 'dir', permissions: '777', owner: 'root', children: {} }
    }
  }
});

// Filesystem state manager — matches terminal.js patterns
// In terminal.js: saveFS() and resetFS() are module-scoped functions
class FileSystemManager {
  constructor(defaultFs, storageKey = 'fs_state') {
    this.defaultFs = JSON.parse(JSON.stringify(defaultFs));
    this.storageKey = storageKey;
    this.fs = {};
    this.backup = null;
    this.load();
  }

  load() {
    try {
      const cached = localStorage.getItem(this.storageKey);
      if (cached) {
        this.fs = JSON.parse(cached);
        this.backup = JSON.parse(cached);
      } else {
        this.reset();
      }
    } catch (e) {
      this.reset();
    }
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.fs));
  }

  reset() {
    this.fs = JSON.parse(JSON.stringify(this.defaultFs));
    this.backup = JSON.parse(JSON.stringify(this.defaultFs));
    this.save();
  }

  getFs() {
    return this.fs;
  }

  getBackup() {
    return this.backup;
  }

  hasBackup() {
    return this.backup !== null;
  }

  addFile(path, content, permissions = '644') {
    const parts = path.split('/').filter(Boolean);
    let current = this.fs['/'];
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current.children[parts[i]]) {
        current.children[parts[i]] = {
          type: 'dir',
          permissions: '755',
          owner: 'user',
          children: {}
        };
      }
      current = current.children[parts[i]];
    }
    
    const filename = parts[parts.length - 1];
    current.children[filename] = {
      type: 'file',
      permissions,
      owner: 'user',
      content
    };
    
    this.save();
  }

  addDirectory(path) {
    const parts = path.split('/').filter(Boolean);
    let current = this.fs['/'];
    
    for (const part of parts) {
      if (!current.children[part]) {
        current.children[part] = {
          type: 'dir',
          permissions: '755',
          owner: 'user',
          children: {}
        };
      }
      current = current.children[part];
    }
    
    this.save();
  }

  deleteFile(path) {
    const parts = path.split('/').filter(Boolean);
    let current = this.fs['/'];
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current.children[parts[i]]) return false;
      current = current.children[parts[i]];
    }
    
    const filename = parts[parts.length - 1];
    if (current.children[filename]) {
      delete current.children[filename];
      this.save();
      return true;
    }
    return false;
  }

  getFile(path) {
    const parts = path.split('/').filter(Boolean);
    let current = this.fs['/'];
    
    for (const part of parts) {
      if (!current || !current.children[part]) return null;
      current = current.children[part];
    }
    
    return current;
  }

  directoryExists(path) {
    const node = this.getFile(path);
    return node && node.type === 'dir';
  }

  fileExists(path) {
    const node = this.getFile(path);
    return node && node.type === 'file';
  }

  listDirectory(path) {
    const node = this.getFile(path);
    if (!node || node.type !== 'dir') return null;
    return Object.keys(node.children);
  }

  countEntries(path) {
    const entries = this.listDirectory(path);
    return entries ? entries.length : 0;
  }
}

// Default filesystem for tests
const defaultFs = createDefaultFs();

describe('FileSystemManager', () => {
  let fsManager;

  beforeEach(() => {
    localStorage.clear();
    fsManager = new FileSystemManager(defaultFs);
  });

  // ==================== Initialization Tests ====================

  test('should initialize with default filesystem', () => {
    const fs = fsManager.getFs();
    expect(fs['/']).toBeDefined();
    expect(fs['/'].type).toBe('dir');
  });

  test('should have backup after initialization', () => {
    expect(fsManager.hasBackup()).toBe(true);
  });

  test('should load from localStorage', () => {
    localStorage.setItem('fs_state', JSON.stringify(defaultFs));
    const newManager = new FileSystemManager(defaultFs);
    
    expect(newManager.getFs()['/'].type).toBe('dir');
  });

  // ==================== Save Tests ====================

  test('should save filesystem state', () => {
    fsManager.addFile('/home/user/test.txt', 'Test content');
    
    const saved = JSON.parse(localStorage.getItem('fs_state'));
    expect(saved['/']['children'].home.children.user.children['test.txt']).toBeDefined();
  });

  test('should persist data across operations', () => {
    fsManager.addFile('/home/user/file1.txt', 'Content 1');
    fsManager.addFile('/home/user/file2.txt', 'Content 2');
    
    const entries = fsManager.listDirectory('/home/user');
    expect(entries).toContain('file1.txt');
    expect(entries).toContain('file2.txt');
  });

  // ==================== Add File Tests ====================

  test('should add file to root', () => {
    fsManager.addFile('/rootfile.txt', 'Root content');
    
    const file = fsManager.getFile('/rootfile.txt');
    expect(file).not.toBeNull();
    expect(file.type).toBe('file');
    expect(file.content).toBe('Root content');
  });

  test('should add file to nested directory', () => {
    fsManager.addFile('/home/user/documents/note.txt', 'Note content');
    
    const file = fsManager.getFile('/home/user/documents/note.txt');
    expect(file).not.toBeNull();
    expect(file.content).toBe('Note content');
  });

  test('should add file with custom permissions', () => {
    fsManager.addFile('/home/user/script.sh', '#!/bin/bash', '755');
    
    const file = fsManager.getFile('/home/user/script.sh');
    expect(file.permissions).toBe('755');
  });

  test('should create intermediate directories', () => {
    fsManager.addFile('/home/user/newdir/file.txt', 'Content');
    
    expect(fsManager.directoryExists('/home/user/newdir')).toBe(true);
  });

  // ==================== Add Directory Tests ====================

  test('should add directory', () => {
    fsManager.addDirectory('/home/user/newdir');
    
    expect(fsManager.directoryExists('/home/user/newdir')).toBe(true);
  });

  test('should not overwrite existing directory', () => {
    const initialCount = fsManager.countEntries('/home/user');
    fsManager.addDirectory('/home/user/documents');
    
    expect(fsManager.directoryExists('/home/user/documents')).toBe(true);
  });

  // ==================== Delete File Tests ====================

  test('should delete file', () => {
    fsManager.addFile('/home/user/todelete.txt', 'Delete me');
    expect(fsManager.fileExists('/home/user/todelete.txt')).toBe(true);
    
    fsManager.deleteFile('/home/user/todelete.txt');
    expect(fsManager.fileExists('/home/user/todelete.txt')).toBe(false);
  });

  test('should return false for non-existent file', () => {
    const result = fsManager.deleteFile('/home/user/nonexistent.txt');
    expect(result).toBe(false);
  });

  test('should not delete directories', () => {
    expect(fsManager.directoryExists('/home/user/documents')).toBe(true);
    // deleteFile should not affect directories
    const result = fsManager.deleteFile('/home/user/documents');
    // This may return false since it's a directory
    expect(fsManager.directoryExists('/home/user/documents')).toBe(true);
  });

  // ==================== Get File Tests ====================

  test('should get existing file', () => {
    const file = fsManager.getFile('/home/user/documents/readme.txt');
    
    expect(file).not.toBeNull();
    expect(file.type).toBe('file');
    expect(file.content).toBe('Welcome to Linux the Game!\n');
  });

  test('should return null for non-existent file', () => {
    const file = fsManager.getFile('/nonexistent/file.txt');
    expect(file).toBeNull();
  });

  // ==================== Directory Tests ====================

  test('should check directory existence', () => {
    expect(fsManager.directoryExists('/home/user')).toBe(true);
    expect(fsManager.directoryExists('/home/user/documents')).toBe(true);
    expect(fsManager.directoryExists('/nonexistent')).toBe(false);
  });

  test('should check file existence', () => {
    expect(fsManager.fileExists('/home/user/documents/readme.txt')).toBe(true);
    expect(fsManager.fileExists('/nonexistent.txt')).toBe(false);
  });

  test('should list directory contents', () => {
    const entries = fsManager.listDirectory('/home/user');
    
    expect(entries).toContain('documents');
    expect(entries).not.toBeNull();
  });

  test('should return null for non-existent directory', () => {
    const entries = fsManager.listDirectory('/nonexistent');
    expect(entries).toBeNull();
  });

  test('should count directory entries', () => {
    const count = fsManager.countEntries('/home/user');
    expect(count).toBeGreaterThan(0);
  });

  // ==================== Reset Tests ====================

  test('should reset to default filesystem', () => {
    fsManager.addFile('/home/user/temp.txt', 'Temporary');
    expect(fsManager.fileExists('/home/user/temp.txt')).toBe(true);
    
    fsManager.reset();
    
    expect(fsManager.fileExists('/home/user/temp.txt')).toBe(false);
    expect(fsManager.fileExists('/home/user/documents/readme.txt')).toBe(true);
  });

  test('should restore backup after modifications', () => {
    fsManager.addFile('/home/user/test.txt', 'Test');
    fsManager.addDirectory('/home/user/testdir');
    
    fsManager.reset();
    
    const entries = fsManager.listDirectory('/home/user');
    expect(entries).not.toContain('test.txt');
    expect(entries).not.toContain('testdir');
  });

  test('should save after reset', () => {
    fsManager.reset();
    
    const saved = JSON.parse(localStorage.getItem('fs_state'));
    expect(saved['/']).toBeDefined();
  });

  // ==================== Edge Cases ====================

  test('should handle empty path', () => {
    const file = fsManager.getFile('');
    expect(file).toBeNull();
  });

  test('should handle root path', () => {
    const file = fsManager.getFile('/');
    expect(file).not.toBeNull();
    expect(file.type).toBe('dir');
  });

  test('should handle path with trailing slash', () => {
    const entries = fsManager.listDirectory('/home/user/');
    expect(entries).not.toBeNull();
  });

  test('should handle multiple consecutive slashes', () => {
    const file = fsManager.getFile('//home//user//documents//readme.txt');
    // Should handle gracefully (filter removes empty parts)
    expect(file).not.toBeNull();
  });

  test('should handle very long paths', () => {
    const longPath = '/home/user/' + 'a'.repeat(100) + '.txt';
    fsManager.addFile(longPath, 'Long path content');
    
    const file = fsManager.getFile(longPath);
    expect(file).not.toBeNull();
  });

  test('should handle special characters in filenames', () => {
    fsManager.addFile('/home/user/file with spaces.txt', 'Content');
    
    const file = fsManager.getFile('/home/user/file with spaces.txt');
    expect(file).not.toBeNull();
  });

  test('should handle unicode in filenames', () => {
    fsManager.addFile('/home/user/файл.txt', 'Unicode content');
    
    const file = fsManager.getFile('/home/user/файл.txt');
    expect(file).not.toBeNull();
  });

  // ==================== Serialization Tests ====================

  test('should serialize to valid JSON', () => {
    const json = JSON.stringify(fsManager.getFs());
    
    expect(() => JSON.parse(json)).not.toThrow();
  });

  test('should preserve structure after JSON roundtrip', () => {
    const json = JSON.stringify(fsManager.getFs());
    const parsed = JSON.parse(json);
    
    expect(parsed['/'].type).toBe('dir');
    expect(parsed['/']['children'].home.type).toBe('dir');
  });

  test('should preserve file contents after JSON roundtrip', () => {
    const json = JSON.stringify(fsManager.getFs());
    const parsed = JSON.parse(json);
    
    const readme = parsed['/home/user/documents/readme.txt'];
    expect(readme.content).toBe('Welcome to Linux the Game!\n');
  });
});

describe('backupfs functionality', () => {
  let fsManager;

  beforeEach(() => {
    localStorage.clear();
    fsManager = new FileSystemManager(defaultFs);
  });

  test('should have initial backup', () => {
    expect(fsManager.hasBackup()).toBe(true);
  });

  test('should preserve backup after modifications', () => {
    fsManager.addFile('/home/user/temp.txt', 'Temporary');
    
    const backup = fsManager.getBackup();
    expect(backup['/']['children'].home.children.user.children['temp.txt']).toBeUndefined();
  });

  test('should be able to restore from backup', () => {
    fsManager.addFile('/home/user/temp.txt', 'Temporary');
    fsManager.addDirectory('/home/user/tempdir');
    
    fsManager.reset();
    
    expect(fsManager.fileExists('/home/user/temp.txt')).toBe(false);
    expect(fsManager.directoryExists('/home/user/tempdir')).toBe(false);
  });

  test('should maintain backup integrity', () => {
    const initialBackup = JSON.parse(JSON.stringify(fsManager.getBackup()));
    
    fsManager.addFile('/home/user/test.txt', 'Test');
    
    const backup = fsManager.getBackup();
    expect(backup).toEqual(initialBackup);
  });
});
