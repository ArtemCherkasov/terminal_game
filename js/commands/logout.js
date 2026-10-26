window.CmdLogout = {
  execute: function(ctx) {
    var trimmed = ctx._cmd;
    if (ctx.currentUser !== 'user' || ctx.currentPath !== '/home/user') {
      ctx.appendOutput('<span class="warn">Logout successful. Session ended.</span>');
      ctx.appendOutput('<span class="info">You can now login with another account using "login"</span>');
      ctx.setUserData(null);
      ctx.setCurrentUser('user');
      ctx.setCurrentPath('/home/user');
      ctx.setCurrentHost('linux-game');
      ctx.updatePrompt();
      if (ctx.defaultFs) {
        ctx.setFs(JSON.parse(JSON.stringify(ctx.defaultFs)));
        localStorage.setItem('fs_state', JSON.stringify(ctx.fs));
      }
    } else {
      ctx.appendOutput('<span class="error">logout: You are not logged in</span>');
      ctx.appendOutput('<span class="info">Use "useradd" to create an account or "login" to authenticate</span>');
    }
    ctx.saveToHistory(trimmed);
  }
};
