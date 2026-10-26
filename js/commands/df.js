window.CmdDf = {
  execute: function(ctx) {
    ctx.appendOutput('Filesystem      Size  Used Avail Use% Mounted on\nvda2           9.0G  2.5G  6.0G  30% /');
    ctx.saveToHistory('df');
  }
};
