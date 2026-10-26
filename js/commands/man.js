window.CmdMan = {
  execute: function(ctx) {
    var trimmed = ctx._cmd;
    var mMatch = trimmed.match(/^man\s+(.+)/);
    if (!mMatch) return;

    var cmdArg = 'man ' + mMatch[1].trim();
    var cmdName = mMatch[1].trim();

    // Save command to history
    if (typeof ctx.saveToHistory === 'function') {
      ctx.saveToHistory(cmdArg);
    }

    if (typeof ctx.renderManFromCache === 'function') {
      if (!ctx.renderManFromCache(cmdName)) {
        if (typeof ctx.fetchMan === 'function') {
          ctx.fetchMan(cmdName);
        }
      }
    } else if (typeof ctx.fetchMan === 'function') {
      ctx.fetchMan(cmdName);
    }
  }
};
