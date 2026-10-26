window.CmdMv = {
  execute: function(ctx) {
    var trimmed = ctx._cmd;
    var mvMatch = trimmed.match(/^mv\s+(.+)$/);
    if (!mvMatch) return;

    var args = mvMatch[1].split(/\s+/);
    if (args.length >= 2) {
      var src = ctx.resolvePath(args[0]);
      if (!src) {
        ctx.appendOutput('<span class="error">mv: cannot stat ' + ctx.escapeHtml(args[0]) + '\': No such file or directory</span>');
        ctx.saveToHistory(trimmed);
        return;
      }

      // Check if source and destination are the same
      var srcPath = ctx.currentPath;
      var srcParent = ctx.resolveParentPath(args[0]);
      var srcFull = srcParent.parentPath + '/' + srcParent.filename;
      var destParent = ctx.resolveParentPath(args[1]);
      var destFull = destParent.parentPath + '/' + destParent.filename;
      if (srcFull === destFull) {
        ctx.appendOutput('<span class="error">mv: ' + ctx.escapeHtml(args[0]) + ' and ' + ctx.escapeHtml(args[1]) + ' are the same file</span>');
        ctx.saveToHistory(trimmed);
        return;
      }

      if (!destParent.parent) {
        ctx.appendOutput('<span class="error">mv: cannot move to ' + ctx.escapeHtml(args[1]) + '\': No such file or directory</span>');
        ctx.saveToHistory(trimmed);
        return;
      }

      // Check if destination is an existing directory
      var existingDest = destParent.parent.children[destParent.filename];
      if (existingDest && existingDest.type === 'dir') {
        // Move source inside the destination directory
        var srcName = srcParent.filename;
        existingDest.children[srcName] = src;
        delete srcParent.parent.children[srcParent.filename];
        ctx.saveFS();
        ctx.saveToHistory(trimmed);
        return;
      }

      destParent.parent.children[destParent.filename] = src;
      if (srcParent.parent) delete srcParent.parent.children[srcParent.filename];
    }
    ctx.saveFS();
    ctx.saveToHistory(trimmed);
  }
};
