window.CmdPs = {
  execute: function(ctx) {
    ctx.appendOutput('PID   TTY    TIME    CMD\n1     ?      0:00    /sbin/init\n500     ?      0:01    /usr/lib/systemd/systemd-journald\n800     ?      0:00    /usr/sbin/sshd\n1200    pts/0  0:00    bash\n1500    pts/0  0:00    ps aux');
    ctx.saveToHistory('ps');
  }
};
