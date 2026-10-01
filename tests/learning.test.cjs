const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
function app() {
  const elements = new Map();
  const handlers = {};
  const element = () => ({
    addEventListener() {},
    innerHTML: '',
    textContent: '',
    style: { setProperty() {} },
    dataset: {},
    classList: { toggle() {}, add() {}, remove() {} },
    getAttribute() {
      return null;
    },
  });
  const sandbox = {
    console,
    Date,
    URL,
    Blob,
    location: { hash: '' },
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {},
    },
    setTimeout() {},
    clearTimeout() {},
    setInterval() {},
    requestAnimationFrame() {},
    matchMedia() {
      return { matches: false, addEventListener() {} };
    },
    document: {
      addEventListener(type, handler) {
        (handlers[type] ||= []).push(handler);
      },
      documentElement: element(),
      querySelector(selector) {
        if (!elements.has(selector)) elements.set(selector, element());
        return elements.get(selector);
      },
    },
    window: { addEventListener() {}, scrollTo() {} },
  };
  vm.createContext(sandbox);
  for (const file of ['app.js', 'demo-content.js', 'learning.js', 'study.js'])
    vm.runInContext(
      fs.readFileSync(path.join(__dirname, '../src/app', file), 'utf8'),
      sandbox,
      { filename: file },
    );
  return { run: (source) => vm.runInContext(source, sandbox), handlers };
}
test('all screens render; old storage is extended and every lesson is reachable', () => {
  const { run } = app();
  for (const screen of [
    'home',
    'bank',
    'study',
    'lessonScreen',
    'exams',
    'papers',
    'paperScreen',
    'examPreparation',
    'customPractice',
    'preparation',
    'historyScreen',
    'affairs',
    'backupScreen',
    'routineEditorScreen',
  ])
    assert.equal(typeof run(`${screen}()`), 'string', screen);
  assert.equal(run('lessons.length'), 39);
  assert.equal(
    run('lessons.every((lesson) => lesson.note.points.length >= 4)'),
    true,
  );
  assert.equal(run('new Set(lessons.map((lesson) => lesson.id)).size'), 39);
});
test('institute paper questions carry the exact paper identity and never fall back to general questions', () => {
  const { run } = app();
  assert.equal(
    run(
      'demoPapers.every((paper) => paper.questionIds.length > 0 && paper.questionIds.every((id) => questions[id].paperId === paper.id && questions[id].institute === paper.institute && questions[id].year === paper.year && questions[id].demo && !questions[id].verified))',
    ),
    true,
  );
  assert.match(run("paperInstitute='wasa';papers()"), /No papers available/);
  assert.doesNotMatch(
    run("paperInstitute='bank';paperYear='2024';papers()"),
    /2025 · Demo paper/,
  );
});
test('custom filters use latest attempt and preserve zero-valued subject/chapter', () => {
  const { run } = app();
  run(
    "practiceOptions.subject='0';practiceOptions.chapter='0';practiceOptions.status='all'",
  );
  assert.equal(
    run(
      'practicePool().every((question) => question.subject===0 && question.chapter===0 && !question.demo)',
    ),
    true,
  );
  run(
    "state.attempts=[{id:0,correct:false,choice:1},{id:0,correct:true,choice:0}];practiceOptions.status='wrong'",
  );
  assert.equal(
    run('practicePool().some((question) => question.id===0)'),
    false,
  );
  run(
    "state.attempts.push({id:0,correct:false,choice:null});practiceOptions.status='unanswered'",
  );
  assert.equal(run('practicePool().some((question) => question.id===0)'), true);
});
test('exam score applies penalties only to wrong answers and persists result once', () => {
  const { run } = app();
  run(
    "start([0,1,2],'Test','exam');state.session.rules={marks:2,penalty:0.5};answerQuestion(0,questions[0].answer);answerQuestion(1,(questions[1].answer+1)%4);finish()",
  );
  assert.equal(run('sessionScore(state.lastResult)'), 1.5);
  assert.equal(run('state.history.length'), 1);
  assert.equal(run('state.attempts.length'), 3);
  run('finish()');
  assert.equal(run('state.history.length'), 1);
  assert.equal(run('state.lastResult.answers[2].choice'), null);
});
test('skipped practice is available for later unanswered practice', () => {
  const { run } = app();
  run(
    "start([0,1],'Practice');answerQuestion(0,questions[0].answer);finish();practiceOptions.status='unanswered'",
  );
  assert.equal(run('state.attempts.length'), 2);
  assert.equal(run('practicePool().some((question) => question.id===1)'), true);
});
test('backup restores progress and rejects invalid question IDs, notes and scoring rules', () => {
  const { run } = app();
  run(
    "state.reading[lessons[0].id]={done:true,saved:true,note:'Remember',position:120};state.lastLesson=lessons[0].id;start([0],'Test','exam');finish()",
  );
  assert.equal(
    run('validateBackup({version:1,state}).reading[lessons[0].id].note'),
    'Remember',
  );
  assert.throws(
    () => run('validateBackup({version:1,state:{...state,saved:[99999]}})'),
    /bookmarks/,
  );
  assert.throws(
    () =>
      run(
        'validateBackup({version:1,state:{...state,reading:{[lessons[0].id]:{note:{}}}}})',
      ),
    /notes/,
  );
  assert.throws(
    () =>
      run(
        'validateBackup({version:1,state:{...state,history:[{...state.history[0],rules:{marks:1,penalty:-1}}]}})',
      ),
    /history/,
  );
});

test('chapter tests unlock only after every topic is read', () => {
  const { run, handlers } = app();
  run('studySubject=0;studyChapter=0');
  assert.match(run('study()'), /data-action="chapter-test" disabled/);
  const event = {
    target: {
      closest() {
        return { dataset: { action: 'chapter-test' } };
      },
    },
  };
  handlers.click.forEach((handler) => handler(event));
  assert.equal(run('state.session'), null);
  run(
    'lessons.filter((lesson) => lesson.subject===0 && lesson.chapter===0).forEach((lesson) => {state.reading[lesson.id]={done:true};})',
  );
  handlers.click.forEach((handler) => handler(event));
  assert.equal(run('state.session.mode'), 'exam');
  assert.equal(
    run(
      'state.session.ids.every((id) => questions[id].subject===0 && questions[id].chapter===0 && !questions[id].paperId)',
    ),
    true,
  );
});
