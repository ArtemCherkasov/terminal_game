window.CmdExit = {
  execute: function(ctx) {
    ctx.appendOutput('<span class="warn">' + ctx.i18n[ctx.currentLang].exitMsg + '</span>');
    ctx.saveToHistory('exit');
  }
};
