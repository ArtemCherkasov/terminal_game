window.CmdCd = {
  execute: function(ctx) {
    var trimmed = ctx._cmd;
    var cdMatch = trimmed.match(/^cd(\s+(.*))?$/);
    if (!cdMatch) return;

    var target = cdMatch[2] || '~';
    // Trim whitespace
    target = target.trim();
    if (target === '' || target === '~') target = '/home/' + ctx.currentUser;

    // Убрать trailing slash (но не сам '/')
    if (target !== '/') target = target.replace(/\/+$/, '');

    // Handle cd /
    if (target === '/') {
      ctx.setCurrentPath('/');
      ctx.updatePrompt();
      ctx.saveToHistory(trimmed);
      return;
    }

    // Handle .. and ../
    if (target === '..' || target === '../') {
      var parts = ctx.currentPath.split('/').filter(Boolean);
      parts.pop();
      var parentPath = '/' + parts.join('/') || '/';
      ctx.setCurrentPath(parentPath);
      ctx.updatePrompt();
      ctx.saveToHistory(trimmed);
      return;
    }

    var dir = ctx.resolvePath(target);
    if (!dir) {
      ctx.appendOutput('<span class="error">bash: cd: ' + ctx.escapeHtml(target) + ': No such file or directory</span>');
    } else if (dir.type !== 'dir') {
      ctx.appendOutput('<span class="error">bash: cd: ' + ctx.escapeHtml(target) + ': Not a directory</span>');
    } else {
      var newPath = null;
      if (typeof ctx.findPathForDir === 'function') {
        newPath = ctx.findPathForDir(dir);
      }
      if (newPath) ctx.setCurrentPath(newPath);
      ctx.updatePrompt();
    }
    ctx.saveToHistory(trimmed);
  }
};
