window.CmdMkdir = {
  execute: function(ctx) {
    var trimmed = ctx._cmd;
    var mkdirMatch = trimmed.match(/^mkdir\s+(-p\s+)?(.+)$/);
    if (!mkdirMatch) return;

    var createParents = mkdirMatch[1];
    var name = mkdirMatch[2];
    var parent = ctx.resolveParentPath(name);
    if (!parent.parent) {
      ctx.appendOutput('<span class="error">mkdir: cannot create directory ' + ctx.escapeHtml(name) + '\': No such file or directory</span>');
      ctx.saveToHistory(trimmed);
      return;
    }
    if (parent.parent.children[parent.filename]) {
      ctx.appendOutput('<span class="error">mkdir: cannot create directory ' + ctx.escapeHtml(name) + '\': File exists</span>');
      ctx.saveToHistory(trimmed);
      return;
    }

    if (createParents) {
      var parts = name.split('/').filter(Boolean);
      var current = parent.parent;
      for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        if (!current.children[part]) {
          current.children[part] = { type: 'dir', permissions: '755', owner: ctx.currentUser, children: {} };
        }
        current = current.children[part];
      }
    } else {
      parent.parent.children[parent.filename] = { type: 'dir', permissions: '755', owner: ctx.currentUser, children: {} };
    }
    ctx.saveFS();
    ctx.saveToHistory(trimmed);
  }
};
