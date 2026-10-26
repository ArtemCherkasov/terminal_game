window.CmdUseradd = {
  execute: function(ctx) {
    var trimmed = ctx._cmd;

    if (ctx.currentUserData) {
      ctx.appendOutput('<span class="error">useradd: Cannot create user while logged in</span>');
      ctx.appendOutput('<span class="info">Use "logout" first</span>');
      ctx.saveToHistory(trimmed);
      return;
    }

    var useraddMatch = trimmed.match(/^useradd\s+(.+)$/);
    if (useraddMatch) {
      var args = useraddMatch[1].split(/\s+/);
      if (args.length >= 4) {
        var login = args[0];
        var email = args[1];
        var pass1 = args[2];
        var pass2 = args[3];

        if (!login || !email || !pass1 || !pass2) {
          ctx.appendOutput('<span class="error">useradd: All fields are required</span>');
          ctx.appendOutput('<span class="info">Usage: useradd <login> <email> <password> <password_confirm></span>');
          ctx.saveToHistory(trimmed);
          return;
        }
        if (pass1 !== pass2) {
          ctx.appendOutput('<span class="error">useradd: Passwords do not match</span>');
          ctx.saveToHistory(trimmed);
          return;
        }
        ctx._registerUser(login, email, pass1, pass2);
        return;
      } else {
        ctx.appendOutput('<span class="error">useradd: Not enough arguments</span>');
        ctx.appendOutput('<span class="info">Usage: useradd <login> <email> <password> <password_confirm></span>');
        ctx.saveToHistory(trimmed);
        return;
      }
    } else {
      // Interactive mode
      ctx.setAuthState('register_email');
      ctx.appendOutput('<span class="info">Enter login: </span>');
      return;
    }
  },

  _registerUser: function(ctx, login, email, pass1, pass2) {
    $.ajax({
      url: '/api/auth.php',
      type: 'POST',
      data: {
        action: 'register',
        login: login,
        email: email,
        pass1: pass1,
        pass2: pass2,
        lang: ctx.currentLang
      },
      dataType: 'json',
      success: function(response) {
        if (response.status === 'ok') {
          ctx.appendOutput('<span class="info">' + response.message + '</span>');
          ctx.appendOutput('<span class="info">User "' + ctx.escapeHtml(login) + '" created successfully</span>');
          ctx.appendOutput('<span class="info">You can now login with: login ' + ctx.escapeHtml(login) + '</span>');
        } else {
          ctx.appendOutput('<span class="error">' + response.message + '</span>');
        }
      },
      error: function() {
        ctx.appendOutput('<span class="error">Registration service unavailable</span>');
      }
    });
  },

  handleState: function(ctx) {
    var trimmed = ctx._cmd;

    if (ctx.getAuthState() === 'register_email') {
      var login = trimmed.trim();
      if (login.length === 0) {
        ctx.appendOutput('<span class="error">Login cannot be empty</span>');
        ctx.setAuthState('idle');
        return;
      }
      ctx.setAuthLogin(login);
      ctx.setAuthState('register_pass1');
      ctx.appendOutput('<span class="info">Enter email for ' + ctx.escapeHtml(login) + ': </span>');
      return;
    }

    if (ctx.getAuthState() === 'register_pass1') {
      ctx.setAuthEmail(trimmed.trim());
      ctx.setAuthState('register_pass2');
      ctx.appendOutput('<span class="info">Enter password for ' + ctx.escapeHtml(ctx.getAuthLogin()) + ': </span>');
      return;
    }

    if (ctx.getAuthState() === 'register_pass2') {
      ctx.setAuthPass1(trimmed);
      ctx.setAuthState('register_wait');
      ctx.appendOutput('<span class="info">Confirm password for ' + ctx.escapeHtml(ctx.getAuthLogin()) + ': </span>');
      return;
    }

    if (ctx.getAuthState() === 'register_wait') {
      ctx.setAuthPass2(trimmed);

      if (ctx.getAuthPass1() !== ctx.getAuthPass2()) {
        ctx.appendOutput('<span class="error">useradd: Passwords do not match</span>');
        ctx.appendOutput('<span class="info">Use "useradd" to start registration again</span>');
        ctx.setAuthState('idle');
        ctx.setAuthLogin('');
        ctx.setAuthEmail('');
        ctx.setAuthPass1('');
        ctx.setAuthPass2('');
        return;
      }

      ctx._registerUser(ctx.getAuthLogin(), ctx.getAuthEmail(), ctx.getAuthPass1(), ctx.getAuthPass2());

      ctx.setAuthState('idle');
      ctx.setAuthLogin('');
      ctx.setAuthEmail('');
      ctx.setAuthPass1('');
      ctx.setAuthPass2('');
      return;
    }
  }
};
