window.CmdBackupfs = {
  execute: function(ctx) {
    if (typeof ctx.resetFS === 'function') {
      if (ctx.resetFS()) {
        ctx.appendOutput('<span class="info">Filesystem restored to backup state.</span>');
      } else {
        ctx.appendOutput('<span class="error">backupfs: No backup available.</span>');
      }
    }
    ctx.saveToHistory('backupfs');
  }
};
