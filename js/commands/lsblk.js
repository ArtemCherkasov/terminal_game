window.CmdLsblk = {
  execute: function(ctx) {
    ctx.appendOutput('NAME   SIZE  TYPE\nvda    10G   disk\n├─vda1  1G   part [boot]\n└─vda2  9G   part');
    ctx.saveToHistory('lsblk');
  }
};
