window.CmdLogin = {
  execute: function(ctx) {
    var trimmed = ctx._cmd;
    var state = ctx.getAuthState();

    // --- State: waiting for password ---
    if (state === 'waiting_for_password') {
      var pass = trimmed;
      var loginName = ctx.getAuthLogin();

      $.ajax({
        url: '/api/auth.php',
        type: 'POST',
        data: { action: 'login', login: loginName, pass: pass, lang: ctx.currentLang },
        dataType: 'json',
        success: function(response) {
          if (response.status === 'ok') {
            ctx.appendOutput('<span class="info">' + response.message + '</span>');
            ctx.appendOutput('<span class="info">' + ctx.i18n[ctx.currentLang].welcomeUser + ', ' + ctx.escapeHtml(response.login) + '!</span>');
            ctx.currentUserData = { id: response.user_id, login: response.login };
            ctx.setCurrentUser(response.login);
            ctx.setCurrentHost('linux-game');
            ctx.setCurrentPath('/home/' + response.login);
            if (typeof ctx.loadUserFilesystem === 'function') {
              ctx.loadUserFilesystem(response.user_id);
            }
            ctx.setAuthState('idle');
            ctx.setAuthLogin('');
            ctx.updatePrompt();
          } else {
            ctx.appendOutput('<span class="error">' + response.message + '</span>');
            ctx.setAuthState('idle');
            ctx.setAuthLogin('');
          }
        },
        error: function() {
          ctx.appendOutput('<span class="error">Authentication service unavailable</span>');
          ctx.setAuthState('idle');
          ctx.setAuthLogin('');
        }
      });

      ctx.saveToHistory('login ' + loginName);
      return;
    }

    // --- State: waiting for username ---
    if (state === 'waiting_for_username') {
      var uname = trimmed.trim();
      if (uname.length === 0) {
        ctx.appendOutput('<span class="error">Login cannot be empty</span>');
        ctx.setAuthState('idle');
        return;
      }
      ctx.setAuthLogin(uname);
      ctx.setAuthState('waiting_for_password');
      ctx.appendOutput('<span class="info">Password: </span>');
      return;
    }

    // --- Normal login command execution ---
    if (ctx.currentUserData) {
      ctx.appendOutput('<span class="error">login: You are already logged in as "' + ctx.currentUser + '"</span>');
      ctx.appendOutput('<span class="info">Use "logout" to switch accounts</span>');
      ctx.saveToHistory(trimmed);
      return;
    }

    var loginMatch = trimmed.match(/^login\s+(.+)$/);
    if (loginMatch) {
      // login <username> — skip username prompt, ask password directly
      var specifiedLogin = loginMatch[1].trim();
      if (specifiedLogin.length === 0) {
        ctx.appendOutput('<span class="error">Login cannot be empty</span>');
        ctx.saveToHistory(trimmed);
        return;
      }
      ctx.setAuthLogin(specifiedLogin);
      ctx.setAuthState('waiting_for_password');
      ctx.appendOutput('<span class="info">Password: </span>');
      return;
    }

    // login (no arguments) — prompt for username first
    ctx.setAuthState('waiting_for_username');
    ctx.appendOutput('<span class="info">Login: </span>');
    return;
  }
};
