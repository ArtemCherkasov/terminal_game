window.CmdGameinfo = {
  execute: function(ctx) {
    if (typeof ctx.showGameInfo === 'function') {
      ctx.showGameInfo();
    }
    ctx.saveToHistory('gameinfo');
  }
};
