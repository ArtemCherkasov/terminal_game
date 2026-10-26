window.CmdWhoami = {
  execute: function(ctx) {
    ctx.appendOutput(ctx.currentUser);
    ctx.saveToHistory('whoami');
  }
};
