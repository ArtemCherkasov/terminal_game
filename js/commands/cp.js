window.CmdCp = {
  execute: function(ctx) {
    var trimmed = ctx._cmd;
    var cpMatch = trimmed.match(/^cp\s+(.+)$/);
    if (!cpMatch) return;

    var args = cpMatch[1].split(/\s+/);
    if (args.length >= 2) {
      var src = ctx.resolvePath(args[0]);
      var dest = args[1];
      if (!src) {
        ctx.appendOutput('<span class="error">cp: cannot stat ' + ctx.escapeHtml(args[0]) + '\': No such file or directory</span>');
        ctx.saveToHistory(trimmed);
        return;
      }
      if (src.type === 'file') {
        var destParent = ctx.resolveParentPath(dest);
        if (!destParent.parent) {
          ctx.appendOutput('<span class="error">cp: cannot create regular file ' + ctx.escapeHtml(dest) + '\': No such file or directory</span>');
          ctx.saveToHistory(trimmed);
          return;
        }
        destParent.parent.children[destParent.filename] = {
          type: 'file',
          permissions: '644',
          owner: ctx.currentUser,
          content: src.content
        };
        ctx.saveFS();
      } else if (src.type === 'dir') {
        ctx.appendOutput('<span class="error">cp: omitting directory ' + ctx.escapeHtml(args[0]) + '\'</span>');
      }
    }
    ctx.saveToHistory(trimmed);
  }
};
