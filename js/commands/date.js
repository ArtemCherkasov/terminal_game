window.CmdDate = {
  execute: function(ctx) {
    ctx.appendOutput(new Date().toString());
    ctx.saveToHistory('date');
  }
};
