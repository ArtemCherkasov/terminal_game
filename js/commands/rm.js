window.CmdRm = {
  execute: function(ctx) {
    var trimmed = ctx._cmd;
    // Match: rm -rf, -fr, -r -f, -f -r, -r, -f, or just rm <name>
    var rmMatch = trimmed.match(/^rm\s+(-[rf\s-]+)?\s*(.+)$/);
    if (!rmMatch) return;

    var flags = rmMatch[1] || '';
    var name = rmMatch[2];
    var recursive = flags.indexOf('r') !== -1 || flags.indexOf('R') !== -1;

    var target = ctx.resolvePath(name);
    if (!target) {
      ctx.appendOutput('<span class="error">rm: cannot remove ' + ctx.escapeHtml(name) + '\': No such file or directory</span>');
      ctx.saveToHistory(trimmed);
      return;
    }

    // Resolve the full path to check for protected directories
    var parent = ctx.resolveParentPath(name);
    var fullPath = parent.parentPath + '/' + parent.filename;

    // Protect root and home directories
    var protectedPaths = ['/'];
    if (ctx.currentUser) {
      protectedPaths.push('/home/' + ctx.currentUser);
    }
    protectedPaths.push('/home/user');

    for (var i = 0; i < protectedPaths.length; i++) {
      if (fullPath === protectedPaths[i] || fullPath === '/' || fullPath === '/home/user') {
        ctx.appendOutput('<span class="error">rm: cannot remove ' + ctx.escapeHtml(name) + '\': Operation not permitted</span>');
        ctx.saveToHistory(trimmed);
        return;
      }
    }

    if (target.type === 'dir' && !recursive) {
      ctx.appendOutput('<span class="error">rm: cannot remove ' + ctx.escapeHtml(name) + '\': Is a directory</span>');
      ctx.saveToHistory(trimmed);
      return;
    }
    if (parent.parent) delete parent.parent.children[parent.filename];
    ctx.saveFS();
    ctx.saveToHistory(trimmed);
  }
};
