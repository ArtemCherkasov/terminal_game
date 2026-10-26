window.CmdPwd = {
  execute: function(ctx) {
    ctx.appendOutput(ctx.currentPath);
    ctx.saveToHistory('pwd');
  }
};
