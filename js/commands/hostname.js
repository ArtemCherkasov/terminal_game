window.CmdHostname = {
  execute: function(ctx) {
    ctx.appendOutput(ctx.currentHost);
    ctx.saveToHistory('hostname');
  }
};
