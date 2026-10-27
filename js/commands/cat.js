window.CmdCat = {
  execute: function(ctx) {
    var trimmed = ctx._cmd;
    var catMatch = trimmed.match(/^cat\s+(.+)$/);
    if (!catMatch) return;

    var args = catMatch[1];

    // Check for append redirect first (>> before >)
    if (/\s*>>\s*/.test(args)) {
      this._handleCatRedirect(ctx, args, 'append');
    } else if (/\s*>\s*/.test(args)) {
      this._handleCatRedirect(ctx, args, 'overwrite');
    } else {
      // Normal cat
      var files = args.split(/\s+/);
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var f = ctx.resolvePath(file);
        if (!f) {
          ctx.appendOutput('<span class="error">cat: ' + ctx.escapeHtml(file) + ': No such file or directory</span>');
        } else if (f.type === 'dir') {
          ctx.appendOutput('<span class="error">cat: ' + ctx.escapeHtml(file) + ': Is a directory</span>');
        } else {
          ctx.appendOutput(ctx.escapeHtml(f.content || ''));
        }
      }
    }
    ctx.saveToHistory(trimmed);
  },

  _handleCatRedirect: function(ctx, args, operation) {
    var redirectMatch;
    if (operation === 'append') {
      redirectMatch = args.match(/^(.+)\s*>>\s*(.+)$/);
    } else {
      redirectMatch = args.match(/^(.+)\s*>\s*(.+)$/);
    }

    if (redirectMatch) {
      var content = redirectMatch[1];
      var filename = redirectMatch[2].trim();
      var parent = ctx.resolveParentPath(filename);
      if (!parent.parent) {
        ctx.appendOutput('<span class="error">cat: ' + filename + ': No such file or directory</span>');
        return;
      }
      var existing = parent.parent.children[parent.filename];
      if (existing && existing.type === 'dir') {
        ctx.appendOutput('<span class="error">cat: ' + filename + ': Is a directory</span>');
        return;
      }
      var newContent = operation === 'append'
        ? (existing ? existing.content : '') + content + '\n'
        : content + '\n';
      parent.parent.children[parent.filename] = {
        type: 'file',
        permissions: '644',
        owner: ctx.currentUser,
        content: newContent
      };
      ctx.saveFS();
    }
  }
};
