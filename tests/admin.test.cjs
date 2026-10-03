const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function loadAdminModule(name, fetch) {
  const source = readFileSync(
    path.join(__dirname, '../app/admin', name + '.ts'),
    'utf8',
  );
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const context = vm.createContext({
    exports: {},
    fetch,
    FormData,
    AbortController,
    setTimeout,
    clearTimeout,
    Date,
  });
  vm.runInContext(output, context);
  return context.exports;
}

const reply = (payload, status = 200) =>
  new Response(status === 204 ? null : JSON.stringify(payload), { status });

test('admin writes refresh expired CSRF once and preserve cookie authentication', async () => {
  const calls = [];
  let writes = 0;
  let csrf = 0;
  const api = loadAdminModule('api', async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/auth/csrf'))
      return reply({ csrf_token: `token-${++csrf}` });
    return ++writes === 1
      ? reply({ message: 'Expired' }, 419)
      : reply({ data: { id: 7 } });
  });
  await api.request('/admin/catalogue/subjects', 'POST', { title: 'বাংলা' });
  assert.equal(calls.length, 4);
  assert.equal(calls[1].options.headers['X-CSRF-TOKEN'], 'token-1');
  assert.equal(calls[3].options.headers['X-CSRF-TOKEN'], 'token-2');
  assert.equal(calls[3].options.credentials, 'include');
  assert.equal(JSON.parse(calls[3].options.body).title, 'বাংলা');
});

test('admin errors expose field validation and do not retry uncertain saves', async () => {
  let writes = 0;
  const api = loadAdminModule('api', async (url) => {
    if (url.endsWith('/auth/csrf')) return reply({ csrf_token: 'token' });
    writes++;
    return reply(
      {
        message: 'Invalid options',
        errors: { options: ['Exactly one correct option is required.'] },
      },
      422,
    );
  });
  await assert.rejects(api.request('/admin/questions', 'POST', {}), (error) => {
    assert.equal(error.status, 422);
    assert.equal(
      error.errors.options[0],
      'Exactly one correct option is required.',
    );
    return true;
  });
  assert.equal(writes, 1);
});

test('admin media upload preserves multipart boundaries and handles empty responses', async () => {
  const file = new FormData();
  file.set('file', new Blob(['image']), 'lesson.png');
  const api = loadAdminModule('api', async (url, options) => {
    if (url.endsWith('/auth/csrf')) return reply({ csrf_token: 'token' });
    assert.equal(options.body, file);
    assert.equal(options.headers['Content-Type'], undefined);
    return reply(null, 204);
  });
  assert.equal(await api.request('/admin/media', 'POST', file), undefined);
});

test('admin form payloads use backend paths, numeric IDs and explicit draft flags', () => {
  const { resources, formPayload, savePath, listPath } =
    loadAdminModule('resources');
  const papers = resources.find((resource) => resource.key === 'papers');
  const payload = formPayload(papers, {
    id: 20,
    title: 'Paper',
    exam_id: '8',
    post_id: '3',
    year: '2026',
    stage: 'Written',
    duration_minutes: '60',
    correct_marks: '1.25',
    wrong_penalty: '0',
    source: 'Archive',
    is_demo: false,
    verified: true,
    published: false,
    question_ids: [7, 2],
    unexpected: 'omit',
  });
  assert.equal(payload.exam_id, 8);
  assert.equal(payload.wrong_penalty, 0);
  assert.equal(payload.correct_marks, 1.25);
  assert.equal(payload.published, false);
  assert.equal(payload.id, undefined);
  assert.equal(payload.unexpected, undefined);
  assert.deepEqual(payload.question_ids, [7, 2]);
  const affairs = resources.find(
    (resource) => resource.key === 'current_affairs',
  );
  assert.equal(listPath(affairs), '/admin/content/current_affairs');
  assert.equal(savePath(affairs, 4), '/admin/current-affairs/4');
  const subjects = resources.find((resource) => resource.key === 'subjects');
  assert.equal(savePath(subjects, 3), '/admin/catalogue/subjects/3');
});

test('admin notice payload stores local datetime as an absolute timestamp and clears empty schedule', () => {
  const { resources, formPayload } = loadAdminModule('resources');
  const notices = resources.find((resource) => resource.key === 'notices');
  const date = '2026-10-03T13:45';
  assert.equal(
    formPayload(notices, { title: 'Notice', publication_at: date })
      .publication_at,
    new Date(date).toISOString(),
  );
  assert.equal(
    formPayload(notices, { title: 'Notice', publication_at: '' })
      .publication_at,
    null,
  );
});
