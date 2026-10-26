window.CmdTop = {
  execute: function(ctx) {
    ctx.appendOutput('PID USER      PR  NI  VIRT  RES  SHR S  %CPU %MEM    TIME+ COMMAND\n1200 user      20   0  4500 3200 2100 S   0.0  0.2   0:00.05 bash\n1501 user      20   0  1500 1000  800 R   0.0  0.1   0:00.01 top');
    ctx.saveToHistory('top');
  }
};
