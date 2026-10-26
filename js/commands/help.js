window.CmdHelp = {
  execute: function(ctx) {
    if (typeof ctx.showHelp === 'function') {
      ctx.showHelp();
    }
    ctx.saveToHistory(ctx._cmd);
  }
};
