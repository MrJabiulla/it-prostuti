const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

function createApiApp(overrides = {}, liveFetch = null) {
  const calls = [];
  const elements = new Map();
  const listeners = {};
  const element = () => ({
    dataset: {}, style: { setProperty() {} }, classList: { toggle() {}, add() {}, remove() {} },
    open: false, showModal() { this.open = true; }, close() { this.open = false; }, querySelectorAll() { return []; },
    innerHTML: '', textContent: '', value: '', hidden: true,
    addEventListener() {}, setAttribute() {}, removeAttribute() {}, getAttribute() { return null; },
  });
  const getElement = (id) => {
    if (!elements.has(id)) elements.set(id, element());
    return elements.get(id);
  };
  const page = (data) => ({ data, current_page: 1, last_page: 1 });
  const question = { id: 91, topic_id: 31, subject_id: 11, chapter_id: 21, topic: 'Topic', text: '<img src=x onerror=alert(1)>', explanation: 'Explanation', source: 'Source', verified: false, is_demo: true, options: [{ text: 'A', position: 0, is_correct: true }, { text: 'B', position: 1, is_correct: false }], papers: [{ paper_id: 51, exam: 'Exam', institute: 'Institute', post: 'Post', year: 2025, stage: 'MCQ' }] };
  const now = new Date().toISOString();
  const attempt = { data: { id: 'server-attempt', title: 'Practice', mode: 'practice', status: 'active', started_at: now, expires_at: null, submitted_at: null, paper_id: null, correct_marks: 1, wrong_penalty: 0, score: null, current_index: 0, current_page: 0, routine_task_id: null }, items: [{ id: 71, question_id: 91, subject_id: 11, text: 'Immutable snapshot', options: ['A', 'B'], source: 'Source', is_demo: true, verified: false, selected_option: null, answered_at: null, guess: false }], server_time: now };
  const routes = {
    '/me': { data: { name: 'Server Student' }, preferences: null },
    '/auth/csrf': { csrf_token: 'test-csrf' },
    '/subjects': { data: [{ id: 11, title: 'Subject', short: 'SUB', bengali: 'বিষয়', color: '#abcdef' }] },
    '/subjects/11': { chapters: [{ id: 21, title: 'Chapter', english: 'Chapter' }] },
    '/chapters/21': { topics: [{ id: 31, title: 'Topic', english: 'Topic', lesson_id: 41, reading_minutes: 3, completed_at: null, reading_position: 0 }] },
    '/questions': page([question]),
    '/exams': { data: [{ id: 61, title: 'Exam' }] },
    '/exams/61': { subjects: [{ id: 11 }] },
    '/papers': page([{ id: 51, title: 'Paper', exam_id: 61, institute_id: 81, post_title: 'Post', year: 2025, stage: 'MCQ', source: 'Source', duration_minutes: 15, correct_marks: 1, wrong_penalty: 0 }]),
    '/papers/filters': { institutes: [{ id: 81, title: 'Institute' }] },
    '/activity': page([]), '/attempts': page([]), '/revision': page([]), '/reports': page([]),
    '/routine': { data: [], plans: [] }, '/current-affairs': page([]), '/notices': page([]),
    '/lessons/41': { data: { summary: 'Server lesson', reading_minutes: 3, is_demo: true }, sections: [{ title: 'Section', body: 'Body', kind: 'explanation', media_file_id: null }], note: '', progress: null, bookmarked: false },
    'POST /attempts': attempt,
    'PUT /attempts/server-attempt/answers': { ...attempt, items: [{ ...attempt.items[0], selected_option: 0, correct_option: 0, is_correct: true, explanation: 'Saved explanation', answered_at: now }] },
    'POST /attempts/server-attempt/submit': { ...attempt, data: { ...attempt.data, status: 'submitted', score: 1, submitted_at: now }, items: [{ ...attempt.items[0], selected_option: 0, correct_option: 0, is_correct: true, explanation: 'Saved explanation', answered_at: now }] },
  };
  Object.assign(routes, overrides);
  const sandbox = {
    console, Date, URL, Blob, AbortController, crypto: webcrypto, location: { hash: '', origin: 'http://localhost:3000', reload() { getElement('reload').textContent = 'yes'; } },
    localStorage: { getItem() { throw new Error('Cloud mode must not read legacy storage'); }, setItem() { throw new Error('Cloud mode must not write legacy storage'); } },
    setTimeout, clearTimeout, setInterval() {}, requestAnimationFrame() {},
    matchMedia() { return { matches: false, addEventListener() {} }; },
    document: {
      documentElement: { ...element(), dataset: { api: 'server' } },
      getElementById: getElement,
      querySelector(selector) { return getElement(selector.replace(/^#/, '')); },
      addEventListener(type, handler) { (listeners[type] ||= []).push(handler); },
    },
    window: { addEventListener() {}, scrollTo() {} },
    fetch: async (url, options) => {
      calls.push({ url, ...options, body: options.body ? JSON.parse(options.body) : undefined });
      const path = new URL(url, 'http://local').pathname.replace('/api/v1', '');
      let payload = routes[`${options.method} ${path}`] ?? routes[path];
      if (typeof payload === 'function') payload = await payload(options);
      if (payload instanceof Error) throw payload;
      const status = payload?.status || 200;
      return { ok: status < 400, status, json: async () => structuredClone(payload?.payload ?? payload ?? {}) };
    },
  };
  if (liveFetch) sandbox.fetch = liveFetch;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync('public/student.js', 'utf8'), sandbox);
  const run = (source) => vm.runInContext(source, sandbox);
  const ready = async () => {
    for (let i = 0; i < (liveFetch ? 1000 : 100); i++) {
      await new Promise((resolve) => liveFetch ? setTimeout(resolve, 50) : setImmediate(resolve));
      if (run('apiReady') || getElement('api-status').textContent.includes('Preview only')) return;
    }
    throw new Error('Initialization did not finish');
  };
  return { run, ready, calls, routes, elements, listeners };
}

module.exports = { createApiApp };
