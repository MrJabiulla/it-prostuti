const test = require('node:test');
const assert = require('node:assert/strict');
const { createApiApp } = require('./helpers/student-app.cjs');

test('signed-out UI offers login and registration without hiding study screens', async () => {
  const app = createApiApp({ '/me': { status: 401 } });
  await app.ready();
  assert.match(app.elements.get('account-controls').innerHTML, /Create account/);
  app.run("openAuth('register')");
  assert.match(app.elements.get('auth-dialog').innerHTML, /autocomplete="name"/);
  assert.equal(app.elements.get('auth-dialog').open, true);
  app.run("openAuth('login')");
  assert.doesNotMatch(app.elements.get('auth-dialog').innerHTML, /autocomplete="name"/);
});

test('registration sends name with OTP request, verifies code and reloads account state', async () => {
  const app = createApiApp();
  await app.ready();
  app.run("authMode = 'register'; authName = 'Student'; authEmail = 'student@example.test'");
  await app.run('sendAuthCode()');
  const request = app.calls.find((call) => call.url.endsWith('/auth/otp/request'));
  assert.deepEqual(request.body, { email: 'student@example.test', name: 'Student' });
  assert.equal(request.headers['X-CSRF-TOKEN'], 'test-csrf');
  assert.match(app.elements.get('auth-dialog').innerHTML, /one-time-code/);
  await assert.rejects(app.run('sendAuthCode()'), /Please wait/);
  await app.run("verifyAuthCode('123456')");
  assert.deepEqual(app.calls.find((call) => call.url.endsWith('/auth/otp/verify')).body, { email: 'student@example.test', code: '123456' });
  assert.equal(app.elements.get('reload').textContent, 'yes');
});

test('failed code requests and verification preserve retryable form state', async () => {
  const app = createApiApp({ 'POST /auth/otp/request': { status: 429, payload: { message: 'Try later' } }, 'POST /auth/otp/verify': { status: 422, payload: { message: 'Invalid or expired code.' } } });
  await app.ready();
  app.run("openAuth('login'); authEmail = 'student@example.test'");
  await app.run('runAuthAction(sendAuthCode)');
  assert.equal(app.run('authCodeSent'), false);
  assert.equal(app.run('authPending'), false);
  assert.equal(app.elements.get('auth-message').textContent, 'Try later');
  await app.run("runAuthAction(() => verifyAuthCode('000000'))");
  assert.equal(app.elements.get('auth-message').textContent, 'Invalid or expired code.');
  assert.equal(app.elements.has('reload'), false);
});

test('logout waits for success, blocks unsaved notes and retains session on failure', async () => {
  const app = createApiApp({ 'POST /auth/logout': { status: 503, payload: { message: 'Unavailable' } } });
  await app.ready();
  assert.match(app.elements.get('account-controls').innerHTML, /Log out/);
  app.run("apiNoteDrafts.set('lesson', 'draft')");
  await app.run('logoutAccount()');
  assert.equal(app.calls.some((call) => call.url.endsWith('/auth/logout')), false);
  app.run('apiNoteDrafts.clear()');
  await assert.rejects(app.run('logoutAccount()'), /Unavailable/);
  assert.equal(app.run('apiReady'), true);
  app.routes['POST /auth/logout'] = { status: 204 };
  await app.run('logoutAccount()');
  assert.equal(app.run('apiReady'), false);
  assert.equal(app.elements.get('reload').textContent, 'yes');
});
