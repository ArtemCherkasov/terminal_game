/**
 * Tests for login/logout command state machine
 * 
 * Tests login flow: idle → waiting_for_username → waiting_for_password → idle
 * Tests logout flow: resets currentUser, currentPath, currentHost
 */

// Load actual command files
loadCommandFile('login.js');
loadCommandFile('logout.js');

// AJAX call tracker
const ajaxCalls = [];
$.ajax = function(options) {
  ajaxCalls.push(options);
  return {
    done: function(cb) { return this; },
    fail: function(cb) { return this; },
    error: function(cb) { return this; }
  };
};

// Mock escapeHtml
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Create a mock context that mimics terminal.js ctx
function createMockCtx() {
  let currentUser = 'user';
  let currentHost = 'linux-game';
  let currentPath = '/home/user';
  let currentUserData = null;
  let authState = 'idle';
  let authLogin = '';
  let currentLang = 'ru';
  let output = [];
  let history = [];
  let pendingOutput = [];
  let fs = {};

  return {
    _cmd: '',
    appendOutput: function(text) {
      output.push(text);
    },
    getOutput: function() { return output; },
    clearOutput: function() { output = []; },
    saveToHistory: function(cmd) {
      history.push({ command: cmd, output: pendingOutput.slice() });
      pendingOutput = [];
    },
    getHistory: function() { return history; },
    escapeHtml: escapeHtml,
    setCurrentUser: function(u) { currentUser = u; },
    setCurrentHost: function(h) { currentHost = h; },
    setCurrentPath: function(p) {
      var normalized = (p || '').replace(/^\/+|\/+$/g, '');
      currentPath = normalized === '' ? '/' : '/' + normalized;
    },
    setUserData: function(d) { currentUserData = d; },
    setCurrentUserData: function(d) { currentUserData = d; },
    getCurrentUserData: function() { return currentUserData; },
    getAuthState: function() { return authState; },
    setAuthState: function(s) { authState = s; },
    getAuthLogin: function() { return authLogin; },
    setAuthLogin: function(v) { authLogin = v; },
    getCurrentUser: function() { return currentUser; },
    getCurrentHost: function() { return currentHost; },
    getCurrentPath: function() { return currentPath; },
    getCurrentLang: function() { return currentLang; },
    setCurrentLang: function(l) { currentLang = l; },
    get currentLang() { return currentLang; },
    get currentUser() { return currentUser; },
    set currentUser(v) { currentUser = v; },
    get currentPath() { return currentPath; },
    set currentPath(v) { currentPath = v; },
    get currentUserData() { return currentUserData; },
    set currentUserData(v) { currentUserData = v; },
    get fs() { return fs; },
    set fs(v) { fs = v; },
    get defaultFs() { return null; },
    setFs: function(f) { fs = f; },
    i18n: {
      ru: { welcomeUser: 'Добро пожаловать' },
      en: { welcomeUser: 'Welcome' }
    },
    updatePrompt: function() {},
    loadUserFilesystem: function(userId) {}
  };
}

describe('login command - state machine', () => {
  let ctx;

  beforeEach(() => {
    ctx = createMockCtx();
    ajaxCalls.length = 0;
  });

  describe('Initial state', () => {
    test('should start in idle state', () => {
      expect(ctx.getAuthState()).toBe('idle');
    });

    test('should start with user as current user', () => {
      expect(ctx.getCurrentUser()).toBe('user');
    });

    test('should start with /home/user as current path', () => {
      expect(ctx.getCurrentPath()).toBe('/home/user');
    });

    test('should start with no currentUserData', () => {
      expect(ctx.getCurrentUserData()).toBeNull();
    });
  });

  describe('login (no arguments) - waiting_for_username', () => {
    test('should set authState to waiting_for_username', () => {
      ctx._cmd = 'login';
      window.CmdLogin.execute(ctx);
      expect(ctx.getAuthState()).toBe('waiting_for_username');
    });

    test('should output "Login: " prompt', () => {
      ctx._cmd = 'login';
      ctx.clearOutput();
      window.CmdLogin.execute(ctx);
      expect(ctx.getOutput()).toContain('<span class="info">Login: </span>');
    });

    test('should not set authLogin', () => {
      ctx._cmd = 'login';
      window.CmdLogin.execute(ctx);
      expect(ctx.getAuthLogin()).toBe('');
    });
  });

  describe('login <username> - waiting_for_password', () => {
    test('should set authState to waiting_for_password', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      expect(ctx.getAuthState()).toBe('waiting_for_password');
    });

    test('should set authLogin to specified username', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      expect(ctx.getAuthLogin()).toBe('guest');
    });

    test('should output "Password: " prompt', () => {
      ctx._cmd = 'login guest';
      ctx.clearOutput();
      window.CmdLogin.execute(ctx);
      expect(ctx.getOutput()).toContain('<span class="info">Password: </span>');
    });

    test('should trim username', () => {
      ctx._cmd = 'login  guest  ';
      window.CmdLogin.execute(ctx);
      expect(ctx.getAuthLogin()).toBe('guest');
    });

    test('should reject empty username after trim', () => {
      ctx._cmd = 'login   ';
      ctx.clearOutput();
      window.CmdLogin.execute(ctx);
      expect(ctx.getOutput()).toContain('<span class="error">Login cannot be empty</span>');
      expect(ctx.getAuthState()).toBe('idle');
    });
  });

  describe('Password entry - waiting_for_password', () => {
    test('should send AJAX request with login and password', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'guestpass';
      window.CmdLogin.execute(ctx);

      expect(ajaxCalls.length).toBe(1);
      expect(ajaxCalls[0].type).toBe('POST');
      expect(ajaxCalls[0].data.action).toBe('login');
      expect(ajaxCalls[0].data.login).toBe('guest');
      expect(ajaxCalls[0].data.pass).toBe('guestpass');
    });

    test('should send currentLang in AJAX request', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'guestpass';
      window.CmdLogin.execute(ctx);

      expect(ajaxCalls[0].data.lang).toBe('ru');
    });

    test('should set EN lang in AJAX request', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx.setCurrentLang('en');
      ctx._cmd = 'guestpass';
      window.CmdLogin.execute(ctx);

      expect(ajaxCalls[0].data.lang).toBe('en');
    });

    test('should save to history after password entry', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'guestpass';
      window.CmdLogin.execute(ctx);

      expect(ctx.getHistory().length).toBe(1);
      expect(ctx.getHistory()[0].command).toBe('login guest');
    });
  });

  describe('AJAX success - login successful', () => {
    test('should set currentUser to login name', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'guestpass';
      window.CmdLogin.execute(ctx);

      const successCb = ajaxCalls[0].success;
      successCb({ status: 'ok', message: 'OK', user_id: 1, login: 'guest' });

      expect(ctx.getCurrentUser()).toBe('guest');
    });

    test('should set currentHost to linux-game', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'guestpass';
      window.CmdLogin.execute(ctx);

      const successCb = ajaxCalls[0].success;
      successCb({ status: 'ok', message: 'OK', user_id: 1, login: 'guest' });

      expect(ctx.getCurrentHost()).toBe('linux-game');
    });

    test('should set currentPath to /home/<login>', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'guestpass';
      window.CmdLogin.execute(ctx);

      const successCb = ajaxCalls[0].success;
      successCb({ status: 'ok', message: 'OK', user_id: 1, login: 'guest' });

      expect(ctx.getCurrentPath()).toBe('/home/guest');
    });

    test('should set currentUserData', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'guestpass';
      window.CmdLogin.execute(ctx);

      const successCb = ajaxCalls[0].success;
      successCb({ status: 'ok', message: 'OK', user_id: 42, login: 'guest' });

      expect(ctx.getCurrentUserData()).not.toBeNull();
      expect(ctx.getCurrentUserData().id).toBe(42);
      expect(ctx.getCurrentUserData().login).toBe('guest');
    });

    test('should set authState to idle', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'guestpass';
      window.CmdLogin.execute(ctx);

      const successCb = ajaxCalls[0].success;
      successCb({ status: 'ok', message: 'OK', user_id: 1, login: 'guest' });

      expect(ctx.getAuthState()).toBe('idle');
    });

    test('should clear authLogin', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'guestpass';
      window.CmdLogin.execute(ctx);

      const successCb = ajaxCalls[0].success;
      successCb({ status: 'ok', message: 'OK', user_id: 1, login: 'guest' });

      expect(ctx.getAuthLogin()).toBe('');
    });

    test('should output welcome message with correct language', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'guestpass';
      window.CmdLogin.execute(ctx);

      const successCb = ajaxCalls[0].success;
      successCb({ status: 'ok', message: 'Авторизация успешна', user_id: 1, login: 'guest' });

      const output = ctx.getOutput();
      const welcomeLine = output.find(line => line.includes('Добро пожаловать'));
      expect(welcomeLine).toBeDefined();
      expect(welcomeLine).toContain('guest');
    });

    test('should output English welcome message', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx.setCurrentLang('en');
      ctx._cmd = 'guestpass';
      window.CmdLogin.execute(ctx);

      const successCb = ajaxCalls[0].success;
      successCb({ status: 'ok', message: 'Login successful', user_id: 1, login: 'guest' });

      const output = ctx.getOutput();
      const welcomeLine = output.find(line => line.includes('Welcome'));
      expect(welcomeLine).toBeDefined();
      expect(welcomeLine).toContain('guest');
    });

    test('should escape HTML in login name', () => {
      ctx._cmd = 'login <script>';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'pass';
      window.CmdLogin.execute(ctx);

      const successCb = ajaxCalls[0].success;
      successCb({ status: 'ok', message: 'OK', user_id: 1, login: '<script>alert(1)</script>' });

      const output = ctx.getOutput();
      const welcomeLine = output.find(line => line.includes('script'));
      expect(welcomeLine).toContain('&lt;script&gt;');
    });
  });

  describe('AJAX failure - login failed', () => {
    test('should output error message', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'wrongpass';
      window.CmdLogin.execute(ctx);

      const errorCb = ajaxCalls[0].error;
      errorCb();

      const output = ctx.getOutput();
      expect(output).toContain('<span class="error">Authentication service unavailable</span>');
    });

    test('should set authState to idle on AJAX error', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'wrongpass';
      window.CmdLogin.execute(ctx);

      const errorCb = ajaxCalls[0].error;
      errorCb();

      expect(ctx.getAuthState()).toBe('idle');
    });

    test('should clear authLogin on AJAX error', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'wrongpass';
      window.CmdLogin.execute(ctx);

      const errorCb = ajaxCalls[0].error;
      errorCb();

      expect(ctx.getAuthLogin()).toBe('');
    });
  });

  describe('AJAX failure - invalid credentials', () => {
    test('should output error message from server', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'wrongpass';
      window.CmdLogin.execute(ctx);

      const successCb = ajaxCalls[0].success;
      successCb({ status: 'error', message: 'Invalid login or password' });

      const output = ctx.getOutput();
      expect(output).toContain('<span class="error">Invalid login or password</span>');
    });

    test('should set authState to idle on invalid credentials', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'wrongpass';
      window.CmdLogin.execute(ctx);

      const successCb = ajaxCalls[0].success;
      successCb({ status: 'error', message: 'Invalid login or password' });

      expect(ctx.getAuthState()).toBe('idle');
    });

    test('should clear authLogin on invalid credentials', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'wrongpass';
      window.CmdLogin.execute(ctx);

      const successCb = ajaxCalls[0].success;
      successCb({ status: 'error', message: 'Invalid login or password' });

      expect(ctx.getAuthLogin()).toBe('');
    });
  });

  describe('Empty password handling', () => {
    test('should send empty password in AJAX', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = '';
      window.CmdLogin.execute(ctx);

      expect(ajaxCalls[0].data.pass).toBe('');
    });
  });

  describe('Already logged in', () => {
    test('should reject login when already logged in', () => {
      ctx.setCurrentUserData({ id: 1, login: 'guest' });
      ctx.setCurrentUser('guest');
      ctx._cmd = 'login guest';
      ctx.clearOutput();
      window.CmdLogin.execute(ctx);

      const output = ctx.getOutput().join('\n');
      expect(output).toContain('login: You are already logged in as "guest"');
    });

    test('should output hint to use logout', () => {
      ctx.setCurrentUserData({ id: 1, login: 'guest' });
      ctx.setCurrentUser('guest');
      ctx._cmd = 'login guest';
      ctx.clearOutput();
      window.CmdLogin.execute(ctx);

      const output = ctx.getOutput().join('\n');
      expect(output).toContain('Use "logout" to switch accounts');
    });

    test('should not change authState when already logged in', () => {
      ctx.setCurrentUserData({ id: 1, login: 'guest' });
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);

      expect(ctx.getAuthState()).toBe('idle');
    });
  });

  describe('Empty username in waiting_for_username', () => {
    test('should reject empty username', () => {
      ctx._cmd = 'login';
      window.CmdLogin.execute(ctx);

      ctx._cmd = '';
      ctx.clearOutput();
      window.CmdLogin.execute(ctx);

      const output = ctx.getOutput();
      expect(output).toContain('<span class="error">Login cannot be empty</span>');
    });

    test('should reset authState to idle on empty username', () => {
      ctx._cmd = 'login';
      window.CmdLogin.execute(ctx);

      ctx._cmd = '';
      window.CmdLogin.execute(ctx);

      expect(ctx.getAuthState()).toBe('idle');
    });

    test('should handle whitespace-only username', () => {
      ctx._cmd = 'login';
      window.CmdLogin.execute(ctx);

      ctx._cmd = '   ';
      ctx.clearOutput();
      window.CmdLogin.execute(ctx);

      const output = ctx.getOutput();
      expect(output).toContain('<span class="error">Login cannot be empty</span>');
    });
  });

  describe('State transitions', () => {
    test('should transition idle → waiting_for_username', () => {
      ctx._cmd = 'login';
      window.CmdLogin.execute(ctx);
      expect(ctx.getAuthState()).toBe('waiting_for_username');
    });

    test('should transition waiting_for_username → waiting_for_password', () => {
      ctx._cmd = 'login';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'guest';
      window.CmdLogin.execute(ctx);
      expect(ctx.getAuthState()).toBe('waiting_for_password');
    });

    test('should transition waiting_for_password → idle on success', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'pass';
      window.CmdLogin.execute(ctx);
      const successCb = ajaxCalls[0].success;
      successCb({ status: 'ok', message: 'OK', user_id: 1, login: 'guest' });
      expect(ctx.getAuthState()).toBe('idle');
    });

    test('should transition waiting_for_password → idle on failure', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'wrong';
      window.CmdLogin.execute(ctx);
      const successCb = ajaxCalls[0].success;
      successCb({ status: 'error', message: 'Error' });
      expect(ctx.getAuthState()).toBe('idle');
    });

    test('should transition waiting_for_username → idle on empty input', () => {
      ctx._cmd = 'login';
      window.CmdLogin.execute(ctx);
      ctx._cmd = '';
      window.CmdLogin.execute(ctx);
      expect(ctx.getAuthState()).toBe('idle');
    });
  });

  describe('Multiple login attempts', () => {
    test('should allow retry after failed login', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'wrong';
      window.CmdLogin.execute(ctx);
      const successCb = ajaxCalls[0].success;
      successCb({ status: 'error', message: 'Error' });

      ajaxCalls.length = 0;
      ctx.clearOutput();

      ctx._cmd = 'login admin';
      window.CmdLogin.execute(ctx);
      expect(ctx.getAuthState()).toBe('waiting_for_password');
      expect(ctx.getAuthLogin()).toBe('admin');
    });

    test('should allow login with different users sequentially', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'pass';
      window.CmdLogin.execute(ctx);
      const successCb1 = ajaxCalls[0].success;
      successCb1({ status: 'ok', message: 'OK', user_id: 1, login: 'guest' });

      ctx.setCurrentUserData(null);
      ctx.setCurrentUser('user');
      ctx.setCurrentPath('/home/user');

      ajaxCalls.length = 0;
      ctx.clearOutput();

      ctx._cmd = 'login admin';
      window.CmdLogin.execute(ctx);
      expect(ctx.getAuthState()).toBe('waiting_for_password');
      expect(ctx.getAuthLogin()).toBe('admin');
    });
  });

  describe('History tracking', () => {
    test('should save login command to history', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'pass';
      window.CmdLogin.execute(ctx);

      expect(ctx.getHistory().length).toBe(1);
      expect(ctx.getHistory()[0].command).toBe('login guest');
    });

    test('should save interactive login to history', () => {
      ctx._cmd = 'login';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'pass';
      window.CmdLogin.execute(ctx);

      expect(ctx.getHistory().length).toBe(1);
      expect(ctx.getHistory()[0].command).toBe('login guest');
    });
  });
});

describe('logout command', () => {
  let ctx;

  beforeEach(() => {
    ctx = createMockCtx();
  });

  describe('Not logged in', () => {
    test('should output error when not logged in', () => {
      ctx._cmd = 'logout';
      ctx.clearOutput();
      window.CmdLogout.execute(ctx);

      const output = ctx.getOutput();
      expect(output).toContain('<span class="error">logout: You are not logged in</span>');
    });

    test('should output hint for useradd/login', () => {
      ctx._cmd = 'logout';
      ctx.clearOutput();
      window.CmdLogout.execute(ctx);

      const output = ctx.getOutput().join('\n');
      expect(output).toContain('useradd');
      expect(output).toContain('login');
    });

    test('should not change state when not logged in', () => {
      ctx._cmd = 'logout';
      window.CmdLogout.execute(ctx);

      expect(ctx.getAuthState()).toBe('idle');
      expect(ctx.getCurrentUser()).toBe('user');
      expect(ctx.getCurrentPath()).toBe('/home/user');
    });
  });

  describe('Logged in', () => {
    test('should output logout success message', () => {
      ctx.setCurrentUserData({ id: 1, login: 'guest' });
      ctx.setCurrentUser('guest');
      ctx._cmd = 'logout';
      ctx.clearOutput();
      window.CmdLogout.execute(ctx);

      const output = ctx.getOutput();
      expect(output).toContain('<span class="warn">Logout successful. Session ended.</span>');
    });

    test('should reset currentUser to user', () => {
      ctx.setCurrentUserData({ id: 1, login: 'guest' });
      ctx.setCurrentUser('guest');
      ctx._cmd = 'logout';
      window.CmdLogout.execute(ctx);

      expect(ctx.getCurrentUser()).toBe('user');
    });

    test('should reset currentPath to /home/user', () => {
      ctx.setCurrentUserData({ id: 1, login: 'guest' });
      ctx.setCurrentUser('guest');
      ctx.setCurrentPath('/home/guest');
      ctx._cmd = 'logout';
      window.CmdLogout.execute(ctx);

      expect(ctx.getCurrentPath()).toBe('/home/user');
    });

    test('should reset currentHost to linux-game', () => {
      ctx.setCurrentUserData({ id: 1, login: 'guest' });
      ctx.setCurrentUser('guest');
      ctx.setCurrentHost('guest@linux-game');
      ctx._cmd = 'logout';
      window.CmdLogout.execute(ctx);

      expect(ctx.getCurrentHost()).toBe('linux-game');
    });

    test('should clear currentUserData', () => {
      ctx.setCurrentUserData({ id: 1, login: 'guest' });
      ctx.setCurrentUser('guest');
      ctx._cmd = 'logout';
      window.CmdLogout.execute(ctx);

      expect(ctx.getCurrentUserData()).toBeNull();
    });

    test('should save logout command to history', () => {
      ctx.setCurrentUserData({ id: 1, login: 'guest' });
      ctx.setCurrentUser('guest');
      ctx._cmd = 'logout';
      window.CmdLogout.execute(ctx);

      expect(ctx.getHistory().length).toBe(1);
      expect(ctx.getHistory()[0].command).toBe('logout');
    });
  });

  describe('Logout state machine', () => {
    test('should not affect authState', () => {
      ctx.setCurrentUserData({ id: 1, login: 'guest' });
      ctx.setCurrentUser('guest');
      ctx._cmd = 'logout';
      window.CmdLogout.execute(ctx);

      expect(ctx.getAuthState()).toBe('idle');
    });

    test('should work after login', () => {
      ctx._cmd = 'login guest';
      window.CmdLogin.execute(ctx);
      ctx._cmd = 'pass';
      window.CmdLogin.execute(ctx);
      const successCb = ajaxCalls[0].success;
      successCb({ status: 'ok', message: 'OK', user_id: 1, login: 'guest' });

      ctx._cmd = 'logout';
      window.CmdLogout.execute(ctx);

      expect(ctx.getCurrentUser()).toBe('user');
      expect(ctx.getCurrentPath()).toBe('/home/user');
      expect(ctx.getCurrentUserData()).toBeNull();
    });
  });
});

// ==================== Session persistence tests ====================
describe('session persistence across page refresh', () => {
  let ctx;

  beforeEach(() => {
    ctx = createMockCtx();
    ajaxCalls.length = 0;
    localStorage.clear();
  });

  test('login should save session to localStorage', () => {
    ctx._cmd = 'login guest';
    window.CmdLogin.execute(ctx);
    ctx._cmd = 'guestpass';
    window.CmdLogin.execute(ctx);
    const successCb = ajaxCalls[0].success;
    successCb({ status: 'ok', message: 'OK', user_id: 42, login: 'guest' });

    var saved = localStorage.getItem('session');
    expect(saved).not.toBeNull();
    var session = JSON.parse(saved);
    expect(session.user).toBe('guest');
    expect(session.path).toBe('/home/guest');
    expect(session.host).toBe('linux-game');
    expect(session.userData.id).toBe(42);
    expect(session.userData.login).toBe('guest');
  });

  test('logout should clear session from localStorage', () => {
    localStorage.setItem('session', JSON.stringify({
      user: 'guest', path: '/home/guest', host: 'linux-game',
      userData: { id: 1, login: 'guest' }
    }));
    ctx.setCurrentUserData({ id: 1, login: 'guest' });
    ctx.setCurrentUser('guest');
    ctx._cmd = 'logout';
    window.CmdLogout.execute(ctx);

    expect(localStorage.getItem('session')).toBeNull();
  });

  test('session should survive page refresh (simulate restore)', () => {
    // Save session
    localStorage.setItem('session', JSON.stringify({
      user: 'guest', path: '/home/guest', host: 'linux-game',
      userData: { id: 1, login: 'guest' }
    }));

    // Simulate page refresh — restore from localStorage
    var savedSession = localStorage.getItem('session');
    var session = JSON.parse(savedSession);
    var restoredUser = session.user || 'user';
    var restoredPath = session.path || '/home/user';
    var restoredHost = session.host || 'linux-game';
    var restoredUserData = session.userData || null;

    expect(restoredUser).toBe('guest');
    expect(restoredPath).toBe('/home/guest');
    expect(restoredHost).toBe('linux-game');
    expect(restoredUserData).not.toBeNull();
    expect(restoredUserData.login).toBe('guest');
  });

  test('no session should default to user', () => {
    localStorage.clear();
    var savedSession = localStorage.getItem('session');
    var restoredUser = 'user';
    var restoredPath = '/home/user';
    if (savedSession) {
      var session = JSON.parse(savedSession);
      restoredUser = session.user || 'user';
      restoredPath = session.path || '/home/user';
    }
    expect(restoredUser).toBe('user');
    expect(restoredPath).toBe('/home/user');
  });

  test('login then refresh then ls should use correct path', () => {
    // Login as guest
    ctx._cmd = 'login guest';
    window.CmdLogin.execute(ctx);
    ctx._cmd = 'guestpass';
    window.CmdLogin.execute(ctx);
    const successCb = ajaxCalls[0].success;
    successCb({ status: 'ok', message: 'OK', user_id: 1, login: 'guest' });

    // Simulate page refresh
    var savedSession = localStorage.getItem('session');
    var session = JSON.parse(savedSession);

    // After refresh, currentPath should be restored from session
    expect(session.path).toBe('/home/guest');
    expect(session.user).toBe('guest');
    // NOT /home/user (the bug)
    expect(session.path).not.toBe('/home/user');
  });

  test('logout then refresh should default to user', () => {
    // Login
    localStorage.setItem('session', JSON.stringify({
      user: 'guest', path: '/home/guest', host: 'linux-game',
      userData: { id: 1, login: 'guest' }
    }));

    // Logout
    ctx.setCurrentUserData({ id: 1, login: 'guest' });
    ctx.setCurrentUser('guest');
    ctx._cmd = 'logout';
    window.CmdLogout.execute(ctx);

    // Simulate refresh
    var savedSession = localStorage.getItem('session');
    expect(savedSession).toBeNull();

    // Should default to user
    var restoredUser = 'user';
    if (savedSession) {
      restoredUser = JSON.parse(savedSession).user;
    }
    expect(restoredUser).toBe('user');
  });
});
