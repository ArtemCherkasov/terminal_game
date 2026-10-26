window.CmdAdduser = {
  execute: function(ctx) {
    if (typeof window.CmdUseradd !== 'undefined' && typeof window.CmdUseradd.execute === 'function') {
      window.CmdUseradd.execute(ctx);
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
