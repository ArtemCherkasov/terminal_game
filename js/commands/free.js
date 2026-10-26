window.CmdFree = {
  execute: function(ctx) {
    ctx.appendOutput('              total    used    free    shared  buff/cache   available\nMem:          2048MB   512MB   1024MB   64MB     512MB       1536MB\nSwap:         512MB    0MB     512MB');
    ctx.saveToHistory('free');
  }
};
