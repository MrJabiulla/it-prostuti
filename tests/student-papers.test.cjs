const test = require('node:test');
const assert = require('node:assert/strict');
const { createApiApp } = require('./helpers/student-app.cjs');

test('Institute questions shows years first, then matching papers without subject grouping', async () => {
  const app = createApiApp();
  await app.ready();
  app.run(`demoPapers.push({ ...demoPapers[0], id: '52', title: 'Older exam', year: 2023 });`);
  app.run("page = 'institute-papers/81'");
  const initial = app.run('institutePapersScreen()');
  assert.match(initial, /Select year/);
  assert.ok(initial.indexOf('value="2025"') < initial.indexOf('value="2023"'));
  assert.ok(!initial.includes('data-action="open-paper"'));
  assert.ok(!initial.includes('paper-post'));
  assert.ok(!initial.includes('paper-institute'));
  app.run("institutePaperYear = '2023'");
  const selected = app.run('institutePapersScreen()');
  assert.match(selected, /Exam name \/ Category/);
  assert.match(selected, /data-paper="52"/);
  assert.ok(!selected.includes('data-paper="51"'));
  app.run("selectedPaper = '52'");
  const paper = app.run('paperScreen()');
  assert.match(paper, /Answer & explanation/);
  assert.match(paper, /&lt;img src=x onerror=alert\(1\)&gt;/);
});


test('General previous questions retains its filters after browsing an institute', async () => {
  const app = createApiApp();
  await app.ready();
  app.run("openInstituteModal('81'); institutePaperYear = '2000'; page = 'papers'");
  const html = app.run('papers()');
  assert.match(html, /paper-institute/);
  assert.match(html, /paper-post/);
  assert.match(html, /data-paper="51"/);
});

test('Institute view excludes papers from other institutes in the same year', async () => {
  const app = createApiApp();
  await app.ready();
  app.run(`demoPapers.push({ ...demoPapers[0], id: '99', institute: '82', title: 'Other institute' });
    page = 'institute-papers/81'; institutePaperYear = '2025';`);
  const html = app.run('institutePapersScreen()');
  assert.match(html, /data-paper="51"/);
  assert.ok(!html.includes('data-paper="99"'));
});
