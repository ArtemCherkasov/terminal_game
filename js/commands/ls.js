window.CmdLs = {
  execute: function(ctx) {
    var trimmed = ctx._cmd;
    var lsMatch = trimmed.match(/^(ls)(\s+([a-zA-Z-]*))?\s*(.*)?$/);
    if (!lsMatch) return;

    var target = lsMatch[4] || ctx.currentPath;
    var dir = ctx.resolvePath(target);
    if (!dir) {
      ctx.appendOutput('<span class="error">ls: cannot access ' + ctx.escapeHtml(target) + '\': No such file or directory</span>');
      ctx.saveToHistory(trimmed);
      return;
    } else if (dir.type !== 'dir') {
      ctx.appendOutput(ctx.escapeHtml(target));
      ctx.saveToHistory(trimmed);
      return;
    }

    var items = Object.keys(dir.children).map(function(name) {
      var item = dir.children[name];
      var isDir = item.type === 'dir';
      return { name: name + (isDir ? '/' : ''), isDir: isDir, item: item };
    });
    var showAll = lsMatch[3] && lsMatch[3].includes('a');
    var longFormat = lsMatch[3] && lsMatch[3].includes('l');
    var filtered = showAll ? items : items.filter(function(i) { return !i.name.startsWith('.'); });

    if (longFormat) {
      filtered.forEach(function(item) {
        var perm = item.item.permissions;
        var owner = item.item.owner;
        var size = item.item.type === 'file' ? (item.item.content || '').length : 4096;
        var typeChar = item.isDir ? 'd' : '-';
        var permStr = typeChar + perm.slice(1).replace(/7/g, 'rwx').replace(/6/g, 'rw-').replace(/5/g, 'r-x').replace(/4/g, 'r--').replace(/0/g, '---');
        ctx.appendOutput(permStr + ' ' + owner + ' ' + String(size).padStart(8) + ' ' + ctx.escapeHtml(item.name));
      });
    } else {
      var line = filtered.map(function(i) { return ctx.escapeHtml(i.name); }).join('  ');
      ctx.appendOutput(line || '');
    }
    ctx.saveToHistory(trimmed);
  }
};
