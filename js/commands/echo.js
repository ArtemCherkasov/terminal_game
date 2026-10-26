window.CmdEcho = {
  execute: function(ctx) {
    var trimmed = ctx._cmd;
    var echoMatch = trimmed.match(/^echo\s+(.+)$/);
    if (!echoMatch) return;

    var text = echoMatch[1];
    if (text.startsWith('"') && text.endsWith('"')) text = text.slice(1, -1);
    else if (text.startsWith("'") && text.endsWith("'")) text = text.slice(1, -1);

    // Check for append redirect first (>> before >)
    if (/\s*>>\s*/.test(text)) {
      ctx._handleEchoRedirect(text, 'append');
    } else if (/\s*>\s*/.test(text)) {
      ctx._handleEchoRedirect(text, 'overwrite');
    } else {
      ctx.appendOutput(ctx.escapeHtml(text));
    }
    ctx.saveToHistory(trimmed);
  },

  _handleEchoRedirect: function(ctx, text, operation) {
    var redirectMatch;
    if (operation === 'append') {
      redirectMatch = text.match(/^(.+?)\s*>>\s*(.+)$/);
    } else {
      redirectMatch = text.match(/^(.+?)\s*>\s*(.+)$/);
    }

    if (redirectMatch) {
      var content = redirectMatch[1];
      var filename = redirectMatch[2].trim();
      var parent = ctx.resolveParentPath(filename);
      if (!parent.parent) {
        ctx.appendOutput('<span class="error">bash: ' + filename + ': No such file or directory</span>');
        return;
      }
      var existing = parent.parent.children[parent.filename];
      if (existing && existing.type === 'dir') {
        ctx.appendOutput('<span class="error">bash: ' + filename + ': Is a directory</span>');
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
