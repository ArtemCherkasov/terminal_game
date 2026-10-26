window.CmdTouch = {
  execute: function(ctx) {
    var trimmed = ctx._cmd;
    var touchMatch = trimmed.match(/^touch\s+(.+)$/);
    if (!touchMatch) return;

    var name = touchMatch[1];
    var parent = ctx.resolveParentPath(name);
    if (!parent.parent) {
      ctx.appendOutput('<span class="error">touch: cannot touch ' + ctx.escapeHtml(name) + '\': No such file or directory</span>');
      ctx.saveToHistory(trimmed);
      return;
    }
    parent.parent.children[parent.filename] = parent.parent.children[parent.filename] || {
      type: 'file',
      permissions: '644',
      owner: ctx.currentUser,
      content: ''
    };
    ctx.saveFS();
    ctx.saveToHistory(trimmed);
  }
};
