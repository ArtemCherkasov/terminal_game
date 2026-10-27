/**
 * Tests for adduser / useradd command
 * 
 * Tests that adduser delegates to useradd,
 * useradd command parsing, interactive mode state machine,
 * registration AJAX, and error cases.
 */

// Load actual command files
loadCommandFile('useradd.js');
loadCommandFile('adduser.js');

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

// escapeHtml
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Create mock context
function createMockCtx() {
  var currentUser = 'user';
  var currentLang = 'ru';
  var currentUserData = null;
  var authState = 'idle';
  var authLogin = '';
  var authEmail = '';
  var authPass1 = '';
  var authPass2 = '';
  var output = [];
  var history = [];

  return {
    _cmd: '',
    appendOutput: function(text) { output.push(text); },
    getOutput: function() { return output; },
    clearOutput: function() { output = []; },
    saveToHistory: function(cmd) { history.push(cmd); },
    getHistory: function() { return history; },
    escapeHtml: escapeHtml,
    get currentLang() { return currentLang; },
    set currentLang(v) { currentLang = v; },
    setCurrentLang: function(l) { currentLang = l; },
    get currentUser() { return currentUser; },
    set currentUser(v) { currentUser = v; },
    get currentUserData() { return currentUserData; },
    set currentUserData(v) { currentUserData = v; },
    getAuthState: function() { return authState; },
    setAuthState: function(s) { authState = s; },
    getAuthLogin: function() { return authLogin; },
    setAuthLogin: function(v) { authLogin = v; },
    getAuthEmail: function() { return authEmail; },
    setAuthEmail: function(v) { authEmail = v; },
    getAuthPass1: function() { return authPass1; },
    setAuthPass1: function(v) { authPass1 = v; },
    getAuthPass2: function() { return authPass2; },
    setAuthPass2: function(v) { authPass2 = v; },
    updatePrompt: function() {},
    // _registerUser delegates to CmdUseradd
    _registerUser: function(login, email, pass1, pass2) {
      window.CmdUseradd._registerUser(this, login, email, pass1, pass2);
    }
  };
}

// ==================== adduser → useradd delegation ====================
describe('adduser command - delegation to useradd', () => {
  let ctx;

  beforeEach(() => {
    ctx = createMockCtx();
    ajaxCalls.length = 0;
  });

  test('adduser should delegate execute to useradd', () => {
    ctx._cmd = 'useradd testuser test@test.com pass pass';
    ctx.clearOutput();
    window.CmdAdduser.execute(ctx);
    expect(ajaxCalls.length).toBe(1);
    expect(ajaxCalls[0].data.login).toBe('testuser');
  });

  test('adduser should delegate handleState to useradd', () => {
    ctx._cmd = 'testuser';
    ctx.setAuthState('register_email');
    ctx.clearOutput();
    window.CmdAdduser.handleState(ctx);
    expect(ctx.getAuthState()).toBe('register_pass1');
    expect(ctx.getAuthLogin()).toBe('testuser');
  });

  test('adduser should delegate _registerUser to useradd', () => {
    window.CmdAdduser._registerUser(ctx, 'myuser', 'my@user.com', 'pass', 'pass');
    expect(ajaxCalls.length).toBe(1);
    expect(ajaxCalls[0].data.login).toBe('myuser');
  });

  test('adduser should reject when logged in (same as useradd)', () => {
    ctx.setCurrentUserData = function(d) { ctx.currentUserData = d; };
    ctx.currentUserData = { id: 1, login: 'guest' };
    ctx._cmd = 'adduser new new@new.com pass pass';
    ctx.clearOutput();
    window.CmdAdduser.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('Cannot create user while logged in');
  });
});

// ==================== useradd command (non-interactive) ====================
describe('useradd command - non-interactive mode', () => {
  let ctx;

  beforeEach(() => {
    ctx = createMockCtx();
    ajaxCalls.length = 0;
  });

  test('should register with 4 arguments', () => {
    ctx._cmd = 'useradd testuser test@test.com pass123 pass123';
    window.CmdUseradd.execute(ctx);
    expect(ajaxCalls.length).toBe(1);
    expect(ajaxCalls[0].data.action).toBe('register');
    expect(ajaxCalls[0].data.login).toBe('testuser');
    expect(ajaxCalls[0].data.email).toBe('test@test.com');
    expect(ajaxCalls[0].data.pass1).toBe('pass123');
    expect(ajaxCalls[0].data.pass2).toBe('pass123');
  });

  test('should send lang in AJAX request', () => {
    ctx._cmd = 'useradd u e@e.com p p';
    window.CmdUseradd.execute(ctx);
    expect(ajaxCalls[0].data.lang).toBe('ru');
  });

  test('should send en lang in AJAX request', () => {
    ctx.setCurrentLang('en');
    ctx._cmd = 'useradd u e@e.com p p';
    window.CmdUseradd.execute(ctx);
    expect(ajaxCalls[0].data.lang).toBe('en');
  });

  test('should error on mismatched passwords', () => {
    ctx._cmd = 'useradd testuser test@test.com pass1 pass2';
    ctx.clearOutput();
    window.CmdUseradd.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('Passwords do not match');
    expect(ajaxCalls.length).toBe(0);
  });

  test('should error on not enough arguments', () => {
    ctx._cmd = 'useradd testuser test@test.com pass';
    ctx.clearOutput();
    window.CmdUseradd.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('Not enough arguments');
    expect(ajaxCalls.length).toBe(0);
  });

  test('should show usage hint on not enough arguments', () => {
    ctx._cmd = 'useradd testuser';
    ctx.clearOutput();
    window.CmdUseradd.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('Usage:');
  });

  test('should reject when logged in', () => {
    ctx.currentUserData = { id: 1, login: 'guest' };
    ctx._cmd = 'useradd new new@new.com pass pass';
    ctx.clearOutput();
    window.CmdUseradd.execute(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('Cannot create user while logged in');
    expect(out).toContain('logout');
  });

  test('should save to history on error', () => {
    ctx._cmd = 'useradd testuser';
    window.CmdUseradd.execute(ctx);
    expect(ctx.getHistory()).toContain('useradd testuser');
  });
});

// ==================== useradd interactive mode ====================
describe('useradd command - interactive mode', () => {
  let ctx;

  beforeEach(() => {
    ctx = createMockCtx();
    ajaxCalls.length = 0;
  });

  test('should start interactive mode with "useradd" alone', () => {
    ctx._cmd = 'useradd';
    ctx.clearOutput();
    window.CmdUseradd.execute(ctx);
    expect(ctx.getAuthState()).toBe('register_email');
    var out = ctx.getOutput().join('');
    expect(out).toContain('Enter login:');
  });

  test('should transition register_email → register_pass1 on login entry', () => {
    ctx._cmd = 'useradd';
    window.CmdUseradd.execute(ctx);
    ctx._cmd = 'newuser';
    ctx.clearOutput();
    window.CmdUseradd.handleState(ctx);
    expect(ctx.getAuthState()).toBe('register_pass1');
    expect(ctx.getAuthLogin()).toBe('newuser');
    var out = ctx.getOutput().join('');
    expect(out).toContain('Enter email');
  });

  test('should transition register_pass1 → register_pass2 on email entry', () => {
    ctx._cmd = 'useradd';
    window.CmdUseradd.execute(ctx);
    ctx._cmd = 'newuser';
    window.CmdUseradd.handleState(ctx);
    ctx._cmd = 'new@user.com';
    ctx.clearOutput();
    window.CmdUseradd.handleState(ctx);
    expect(ctx.getAuthState()).toBe('register_pass2');
    expect(ctx.getAuthEmail()).toBe('new@user.com');
    var out = ctx.getOutput().join('');
    expect(out).toContain('Enter password');
  });

  test('should transition register_pass2 → register_wait on password entry', () => {
    ctx._cmd = 'useradd';
    window.CmdUseradd.execute(ctx);
    ctx._cmd = 'newuser';
    window.CmdUseradd.handleState(ctx);
    ctx._cmd = 'new@user.com';
    window.CmdUseradd.handleState(ctx);
    ctx._cmd = 'secret123';
    ctx.clearOutput();
    window.CmdUseradd.handleState(ctx);
    expect(ctx.getAuthState()).toBe('register_wait');
    expect(ctx.getAuthPass1()).toBe('secret123');
    var out = ctx.getOutput().join('');
    expect(out).toContain('Confirm password');
  });

  test('should complete registration on matching passwords', () => {
    ctx._cmd = 'useradd';
    window.CmdUseradd.execute(ctx);
    ctx._cmd = 'newuser';
    window.CmdUseradd.handleState(ctx);
    ctx._cmd = 'new@user.com';
    window.CmdUseradd.handleState(ctx);
    ctx._cmd = 'secret123';
    window.CmdUseradd.handleState(ctx);
    ctx._cmd = 'secret123';
    window.CmdUseradd.handleState(ctx);
    expect(ctx.getAuthState()).toBe('idle');
    expect(ajaxCalls.length).toBe(1);
    expect(ajaxCalls[0].data.login).toBe('newuser');
    expect(ajaxCalls[0].data.email).toBe('new@user.com');
    expect(ajaxCalls[0].data.pass1).toBe('secret123');
  });

  test('should error on mismatched passwords in interactive mode', () => {
    ctx._cmd = 'useradd';
    window.CmdUseradd.execute(ctx);
    ctx._cmd = 'newuser';
    window.CmdUseradd.handleState(ctx);
    ctx._cmd = 'new@user.com';
    window.CmdUseradd.handleState(ctx);
    ctx._cmd = 'pass1';
    window.CmdUseradd.handleState(ctx);
    ctx._cmd = 'pass2';
    ctx.clearOutput();
    window.CmdUseradd.handleState(ctx);
    expect(ctx.getAuthState()).toBe('idle');
    var out = ctx.getOutput().join('');
    expect(out).toContain('Passwords do not match');
  });

  test('should reset all auth fields after registration', () => {
    ctx._cmd = 'useradd';
    window.CmdUseradd.execute(ctx);
    ctx._cmd = 'newuser';
    window.CmdUseradd.handleState(ctx);
    ctx._cmd = 'new@user.com';
    window.CmdUseradd.handleState(ctx);
    ctx._cmd = 'secret';
    window.CmdUseradd.handleState(ctx);
    ctx._cmd = 'secret';
    window.CmdUseradd.handleState(ctx);
    expect(ctx.getAuthLogin()).toBe('');
    expect(ctx.getAuthEmail()).toBe('');
    expect(ctx.getAuthPass1()).toBe('');
    expect(ctx.getAuthPass2()).toBe('');
  });

  test('should reject empty login in interactive mode', () => {
    ctx._cmd = 'useradd';
    window.CmdUseradd.execute(ctx);
    ctx._cmd = '';
    ctx.clearOutput();
    window.CmdUseradd.handleState(ctx);
    expect(ctx.getAuthState()).toBe('idle');
    var out = ctx.getOutput().join('');
    expect(out).toContain('Login cannot be empty');
  });

  test('should reject whitespace-only login', () => {
    ctx._cmd = 'useradd';
    window.CmdUseradd.execute(ctx);
    ctx._cmd = '   ';
    ctx.clearOutput();
    window.CmdUseradd.handleState(ctx);
    expect(ctx.getAuthState()).toBe('idle');
    var out = ctx.getOutput().join('');
    expect(out).toContain('Login cannot be empty');
  });

  test('should show hint to retry after mismatched passwords', () => {
    ctx._cmd = 'useradd';
    window.CmdUseradd.execute(ctx);
    ctx._cmd = 'newuser';
    window.CmdUseradd.handleState(ctx);
    ctx._cmd = 'new@user.com';
    window.CmdUseradd.handleState(ctx);
    ctx._cmd = 'pass1';
    window.CmdUseradd.handleState(ctx);
    ctx._cmd = 'pass2';
    ctx.clearOutput();
    window.CmdUseradd.handleState(ctx);
    var out = ctx.getOutput().join('');
    expect(out).toContain('useradd');
  });
});

// ==================== useradd AJAX responses ====================
describe('useradd command - AJAX responses', () => {
  let ctx;

  beforeEach(() => {
    ctx = createMockCtx();
    ajaxCalls.length = 0;
  });

  test('should output success on ok response', () => {
    ctx._cmd = 'useradd newuser new@user.com pass pass';
    ctx.clearOutput();
    window.CmdUseradd.execute(ctx);
    var successCb = ajaxCalls[0].success;
    successCb({ status: 'ok', message: 'User created' });
    var out = ctx.getOutput().join('\n');
    expect(out).toContain('User created');
    expect(out).toContain('newuser');
    expect(out).toContain('login');
  });

  test('should output error on error response', () => {
    ctx._cmd = 'useradd newuser new@user.com pass pass';
    ctx.clearOutput();
    window.CmdUseradd.execute(ctx);
    var successCb = ajaxCalls[0].success;
    successCb({ status: 'error', message: 'User already exists' });
    var out = ctx.getOutput().join('');
    expect(out).toContain('User already exists');
  });

  test('should output error on AJAX failure', () => {
    ctx._cmd = 'useradd newuser new@user.com pass pass';
    ctx.clearOutput();
    window.CmdUseradd.execute(ctx);
    var errorCb = ajaxCalls[0].error;
    errorCb();
    var out = ctx.getOutput().join('');
    expect(out).toContain('Registration service unavailable');
  });

  test('should escape HTML in success message', () => {
    ctx._cmd = 'useradd <script> test@test.com pass pass';
    ctx.clearOutput();
    window.CmdUseradd.execute(ctx);
    var successCb = ajaxCalls[0].success;
    successCb({ status: 'ok', message: 'OK' });
    var out = ctx.getOutput().join('');
    expect(out).toContain('&lt;script&gt;');
  });
});

// ==================== adduser = useradd equivalence ====================
describe('adduser/useradd equivalence', () => {
  let ctxAdd, ctxUser;

  beforeEach(() => {
    ctxAdd = createMockCtx();
    ctxUser = createMockCtx();
    ajaxCalls.length = 0;
  });

  test('both should start interactive mode identically', () => {
    ctxAdd._cmd = 'adduser';
    ctxUser._cmd = 'useradd';
    ctxAdd.clearOutput();
    ctxUser.clearOutput();
    window.CmdAdduser.execute(ctxAdd);
    var adduserCalls = ajaxCalls.length;
    ajaxCalls.length = 0;
    window.CmdUseradd.execute(ctxUser);
    expect(ctxAdd.getAuthState()).toBe(ctxUser.getAuthState());
    expect(ctxAdd.getOutput()).toEqual(ctxUser.getOutput());
  });

  test('both should handle 4-arg registration identically', () => {
    ctxAdd._cmd = 'adduser testu test@u.com p p';
    ctxUser._cmd = 'useradd testu test@u.com p p';
    ajaxCalls.length = 0;
    window.CmdAdduser.execute(ctxAdd);
    var addAjaxData = JSON.parse(JSON.stringify(ajaxCalls[0].data));
    ajaxCalls.length = 0;
    window.CmdUseradd.execute(ctxUser);
    var userAjaxData = JSON.parse(JSON.stringify(ajaxCalls[0].data));
    expect(addAjaxData).toEqual(userAjaxData);
  });

  test('both should reject mismatched passwords identically', () => {
    ctxAdd._cmd = 'adduser testu test@u.com p1 p2';
    ctxUser._cmd = 'useradd testu test@u.com p1 p2';
    ctxAdd.clearOutput();
    ctxUser.clearOutput();
    window.CmdAdduser.execute(ctxAdd);
    var addOutput = ctxAdd.getOutput().join('');
    window.CmdUseradd.execute(ctxUser);
    var userOutput = ctxUser.getOutput().join('');
    expect(addOutput).toEqual(userOutput);
  });
});
