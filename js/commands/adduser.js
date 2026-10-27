window.CmdAdduser = {
  execute: function(ctx) {
    if (typeof window.CmdUseradd !== 'undefined' && typeof window.CmdUseradd.execute === 'function') {
      var originalCmd = ctx._cmd;
      ctx._cmd = ctx._cmd.replace(/^adduser/, 'useradd');
      window.CmdUseradd.execute(ctx);
      ctx._cmd = originalCmd;
    }
  },
  handleState: function(ctx) {
    if (typeof window.CmdUseradd !== 'undefined' && typeof window.CmdUseradd.handleState === 'function') {
      window.CmdUseradd.handleState(ctx);
    }
  },
  _registerUser: function(ctx, login, email, pass1, pass2) {
    if (typeof window.CmdUseradd !== 'undefined' && typeof window.CmdUseradd._registerUser === 'function') {
      window.CmdUseradd._registerUser(ctx, login, email, pass1, pass2);
    }
  }
};
