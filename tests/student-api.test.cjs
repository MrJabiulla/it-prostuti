const test = require('node:test');
const assert = require('node:assert/strict');
const { createApiApp } = require('./helpers/student-app.cjs');

test('API startup maps server IDs, clears demo records and preserves screen templates', async () => {
  const app = createApiApp();
  await app.ready();
  assert.equal(app.run('apiReady'), true);
  assert.equal(app.run('subjects.length'), 1);
  assert.equal(app.run('questions.length'), 1);
  assert.equal(app.run('questions[0].serverId'), 91);
  assert.equal(app.run('state.profile.name'), 'Server Student');
  assert.equal(app.run('state.attempts.length'), 0);
  assert.equal(app.run('Object.keys(state.reviews).length'), 0);
  for (const screen of ['home', 'bank', 'study', 'exams', 'papers', 'preparation', 'historyScreen', 'routine', 'settings']) {
    assert.equal(typeof app.run(`${screen}()`), 'string', screen);
  }
  assert.ok(!app.run('home()').includes('2 questions due for review'));
  await app.run("loadApiLesson('21-0')");
  assert.equal(app.run('lessons[0].note.summary'), 'Server lesson');
});

test('practice uses server snapshots, answer item IDs and server scoring', async () => {
  const app = createApiApp();
  await app.ready();
  await app.run("start([0], 'Practice')");
  assert.equal(app.run('state.session.serverId'), 'server-attempt');
  assert.ok(app.run('practice()').includes('Immutable snapshot'));
  assert.ok(!app.run('practice()').includes('<img'));
  await app.run('answerQuestion(0, 0)');
  assert.equal(app.run('getAnswer(0).correct'), true);
  assert.equal(app.run('state.session.snapshots[0].explanation'), 'Saved explanation');
  const answer = app.calls.find((call) => call.url.includes('/answers'));
  assert.equal(answer.body.answers[0].item_id, 71);
  assert.equal(answer.headers['X-CSRF-TOKEN'], 'test-csrf');
  assert.equal(answer.credentials, 'include');
  await app.run('finish()');
  assert.equal(app.run('state.session'), null);
  assert.equal(app.run('state.lastResult.serverScore'), 1);
  assert.ok(app.run('result()').includes('Saved explanation'));
});

test('failed mutations retain state and uncertain starts reuse the request ID', async () => {
  const app = createApiApp({ 'POST /attempts': new Error('network') });
  await app.ready();
  await app.run("start([0], 'Practice')");
  await app.run("start([0], 'Practice')");
  const starts = app.calls.filter((call) => call.method === 'POST' && call.url.endsWith('/attempts'));
  assert.equal(starts[0].body.request_id, starts[1].body.request_id);
  assert.equal(app.run('state.session'), null);
  app.routes['PUT /questions/91/bookmark'] = { status: 422, payload: { message: 'Invalid' } };
  await app.run('bookmarkApiQuestion(0)');
  assert.equal(app.run('state.saved.length'), 0);
});

test('expired CSRF refreshes once; authentication failure never loads another users local data', async () => {
  const app = createApiApp();
  await app.ready();
  let tries = 0;
  app.routes['PUT /questions/91/bookmark'] = () => ++tries === 1 ? { status: 419, payload: { message: 'Expired' } } : {};
  await app.run('bookmarkApiQuestion(0)');
  assert.equal(tries, 2);
  assert.equal(app.run('state.saved.length'), 1);
  const guest = createApiApp({ '/me': { status: 401, payload: {} } });
  await guest.ready();
  assert.equal(guest.run('apiReady'), false);
  assert.match(guest.elements.get('api-status').textContent, /log in/);
  await guest.run("start([0], 'Practice')");
  assert.equal(guest.calls.filter((call) => call.method === 'POST').length, 0);
});

test('unsupported custom exams do not start an incorrectly timed server test', async () => {
  const app = createApiApp();
  await app.ready();
  await app.run("start([0], 'Custom mock', 'exam')");
  assert.equal(app.calls.filter((call) => call.method === 'POST').length, 0);
  assert.match(app.elements.get('toast').textContent, /do not match/);
});

test('empty server catalogues render without reverting to demo questions', async () => {
  const empty = { data: [], current_page: 1, last_page: 1 };
  const app = createApiApp({ '/subjects': { data: [] }, '/questions': empty, '/exams': { data: [] }, '/papers': empty });
  await app.ready();
  assert.equal(app.run('apiReady'), true);
  for (const screen of ['home', 'bank', 'study', 'lessonScreen', 'exams', 'papers', 'paperScreen', 'examPreparation', 'customPractice', 'preparation', 'historyScreen', 'routine', 'settings']) {
    assert.equal(typeof app.run(`${screen}()`), 'string', screen);
  }
  assert.equal(app.run('questions.length'), 0);
});

test('profile writes retain focus IDs and update state only after server success', async () => {
  const app = createApiApp();
  await app.ready();
  const saved = await app.run("saveApiProfile({ ...state, profile: { ...state.profile, name: 'Edited', focus: [0], dailyGoal: 20 } })");
  assert.equal(saved, true);
  assert.equal(app.run('state.profile.name'), 'Edited');
  const call = app.calls.find((item) => item.method === 'PUT' && item.url.endsWith('/me'));
  assert.deepEqual(call.body.focus_subject_ids, [11]);
  app.routes['PUT /me'] = { status: 422, payload: { message: 'Invalid profile' } };
  assert.equal(await app.run("saveApiProfile({ ...state, profile: { ...state.profile, name: 'Rejected' } })"), false);
  assert.equal(app.run('state.profile.name'), 'Edited');
});

test('routine plans map subject IDs and completion without losing the server task ID', async () => {
  const app = createApiApp({ 'PUT /routine-plan': { data: { date: '2026-10-03', goal: 5, minutes: 10, custom: true }, tasks: [{ id: 201, client_id: 'subject', date: '2026-10-03', title: 'Subject', kind: 'subject', subject_id: 11, questions: 5, minutes: 10, completed_at: null }] } });
  await app.ready();
  await app.run("saveApiPlan('2026-10-03', { goal: 5, minutes: 10, custom: true, tasks: [{ id: 'subject', title: 'Subject', kind: '0', questions: 5, minutes: 10 }] })");
  const call = app.calls.find((item) => item.url.endsWith('/routine-plan'));
  assert.equal(call.body.tasks[0].subject_id, 11);
  assert.equal(app.run("apiTaskIds.get('2026-10-03:subject')"), 201);
  assert.equal(app.run("state.routinePlans['2026-10-03'].tasks[0].kind"), '0');
});

test('an expired active attempt refreshes submitted history during startup', async () => {
  const app = createApiApp();
  await app.ready();
  const now = new Date().toISOString();
  let submitted = false;
  const record = { id: 'expired', title: 'Expired exam', mode: 'exam', status: 'active', started_at: now, expires_at: now, submitted_at: null, correct_marks: 1, wrong_penalty: 0, score: 0, current_index: 0, current_page: 0 };
  app.routes['/attempts'] = () => ({ data: [{ ...record, status: submitted ? 'submitted' : 'active', submitted_at: submitted ? now : null }], current_page: 1, last_page: 1 });
  app.routes['/attempts/expired'] = () => {
    submitted = true;
    return { data: { ...record, status: 'submitted', submitted_at: now }, items: [], server_time: now };
  };
  await app.run('loadApiProgress()');
  assert.equal(app.run('state.session'), null);
  assert.equal(app.run('state.history.length'), 1);
  assert.equal(app.run('state.lastResult.serverId'), 'expired');
});

test('note autosave retains an unsaved draft across renders after a failed request', async () => {
  const app = createApiApp({ 'PUT /lessons/41/note': { status: 422, payload: { message: 'Rejected note' } } });
  await app.ready();
  await app.run("loadApiLesson('21-0')");
  app.run("activeLesson = '21-0'; saveApiNote('21-0', 'Keep this draft')");
  await new Promise((resolve) => setTimeout(resolve, 550));
  assert.equal(app.run("apiNoteDrafts.get('21-0')"), 'Keep this draft');
  assert.ok(app.run('lessonScreen()').includes('Keep this draft'));
  assert.equal(app.run("state.reading['21-0'].note"), '');
  app.routes['PUT /lessons/41/note'] = {};
  app.run("saveApiNote('21-0', 'Saved revision')");
  await new Promise((resolve) => setTimeout(resolve, 550));
  assert.equal(app.run("apiNoteDrafts.has('21-0')"), false);
  assert.equal(app.run("state.reading['21-0'].note"), 'Saved revision');
});
