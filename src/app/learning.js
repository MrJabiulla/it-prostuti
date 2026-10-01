// Local learning state extends the existing storage without replacing prior progress.
state.reading ||= {};
state.history ||= state.lastResult ? [state.lastResult] : [];
state.readerSize ||= 18;
const lessons = subjects.flatMap((subject, subjectIndex) =>
  subject.chapters.flatMap((chapter, chapterIndex) =>
    chapter.topics.map((topic, topicIndex) => ({
      id: `${chapter.id}-${topicIndex}`,
      subject: subjectIndex,
      chapter: chapterIndex,
      topic: topic.name,
      chapterTitle: chapter.title,
      note: demoLessons[topic.name],
    })),
  ),
);
let studySubject = null;
let studyChapter = null;
let activeLesson = state.lastLesson || lessons[0].id;
let paperInstitute = '';
let paperPost = '';
let paperYear = '';
let selectedPaper = demoPapers.some((paper) => paper.id === state.selectedPaper)
  ? state.selectedPaper
  : demoPapers[0].id;
let affairsMonth = '2026-10';
let practiceOptions = {
  subject: '',
  chapter: '',
  topic: '',
  status: 'all',
  count: 10,
  minutes: 10,
  penalty: 0,
};

function lessonQuestions(lesson) {
  return originalQuestions.filter(
    (q) =>
      q.subject === lesson.subject &&
      q.chapter === lesson.chapter &&
      q.topic === lesson.topic,
  );
}
function lessonLink(lesson, label = lesson.topic) {
  return `<button class="text-button" data-action="read-lesson" data-lesson="${lesson.id}">${esc(label)}</button>`;
}
function learningHeader(title, back = 'preparation') {
  return `<a class="text-button" href="#${back}">← Back</a>${heading(title)}`;
}
function continueReading() {
  const lesson = lessons.find((item) => item.id === state.lastLesson);
  if (!lesson) return '';
  return `<section class="panel learning-panel"><h2>Continue reading</h2><p>${esc(lesson.chapterTitle)}</p>${lessonLink(lesson)}<p class="fine">${state.reading[lesson.id]?.done ? 'Completed · available for revision' : 'Your reading place is saved on this browser.'}</p></section>`;
}
function study() {
  let list = lessons;
  if (studySubject !== null)
    list = list.filter((lesson) => lesson.subject === studySubject);
  if (studyChapter !== null)
    list = list.filter((lesson) => lesson.chapter === studyChapter);
  const completed = list.filter(
    (lesson) => state.reading[lesson.id]?.done,
  ).length;
  let content = '';
  if (studySubject === null) {
    content = subjects
      .map(
        (subject, index) =>
          `<button class="panel learning-card" data-action="study-subject" data-subject="${index}"><b>${esc(subject.name)}</b><span>${subject.chapters.length} chapters</span></button>`,
      )
      .join('');
  } else if (studyChapter === null) {
    content = subjects[studySubject].chapters
      .map((chapter, index) => {
        const chapterLessons = list.filter(
          (lesson) => lesson.chapter === index,
        );
        const done = chapterLessons.filter(
          (lesson) => state.reading[lesson.id]?.done,
        ).length;
        return `<button class="panel learning-card" data-action="study-chapter" data-subject="${studySubject}" data-chapter="${index}"><b>${esc(chapter.title)}</b><span>${done}/${chapterLessons.length} topics completed</span></button>`;
      })
      .join('');
  } else {
    content = `<section class="panel learning-panel"><h2>What you will study</h2><p>${list.map((lesson) => esc(lesson.topic)).join(' · ')}</p><p class="fine">${list.filter((lesson) => lesson.note).length}/${list.length} topics have reading material. ${list.reduce((total, lesson) => total + (parseInt(lesson.note?.readTime, 10) || 0), 0)} min estimated reading time.</p>${list.map((lesson) => `<div class="learning-row"><div>${lessonLink(lesson)}<p class="fine">${lesson.note ? esc(lesson.note.readTime) : 'Lesson content not available'} · ${state.reading[lesson.id]?.done ? 'Completed' : 'Not completed'}</p></div></div>`).join('')}<button class="primary" data-action="chapter-test" ${completed !== list.length ? 'disabled' : ''}>Chapter Test</button><p class="fine">Complete all topics to unlock the test. 10 minutes · +1 correct · no negative marking.</p></section>`;
  }
  return `${learningHeader(studySubject === null ? 'Study' : subjects[studySubject].name, 'home')}<div class="learning-actions"><button class="secondary" data-action="study-root">All subjects</button>${studyChapter !== null ? `<button class="secondary" data-action="study-subject" data-subject="${studySubject}">All chapters</button>` : ''}</div><p>${completed}/${list.length} topics completed</p><progress max="${list.length}" value="${completed}" aria-label="Reading progress"></progress>${continueReading()}<div class="learning-grid">${content}</div>`;
}
function openLesson(id) {
  const lesson = lessons.find((item) => item.id === id);
  if (!lesson) return;
  activeLesson = id;
  state.lastLesson = id;
  save();
  navigate('lesson');
}
function lessonScreen() {
  const lesson = lessons.find((item) => item.id === activeLesson) || lessons[0];
  const reading = state.reading[lesson.id] || {};
  const siblings = lessons.filter(
    (item) =>
      item.subject === lesson.subject && item.chapter === lesson.chapter,
  );
  const index = siblings.indexOf(lesson);
  const qs = lessonQuestions(lesson);
  return `${learningHeader(lesson.topic, 'study')}${lesson.note?.demo ? '<p class="tag">Demo lesson · sample content</p>' : ''}<p class="muted">${esc(subjects[lesson.subject].short)} → ${esc(lesson.chapterTitle)}</p><!-- Temporarily disabled reader controls.
<div class="learning-actions"><label>Font size<select id="reader-size">${[16, 18, 20, 24].map((size) => `<option value="${size}" ${state.readerSize === size ? 'selected' : ''}>${size}px</option>`).join('')}</select></label><button class="secondary" data-action="save-lesson">${reading.saved ? 'Remove bookmark' : 'Bookmark'}</button><button class="secondary" data-action="download-lesson" ${!lesson.note ? 'disabled' : ''}>Download lesson</button></div>
-->${lesson.note ? `<section class="panel learning-panel lesson-contents" role="navigation" aria-label="Table of contents"><h2>Contents</h2>${lesson.note.points.map((point, i) => `<button class="text-button" data-action="lesson-section" data-section="${i}">${esc(point.label)}</button>`).join('')}</section><article class="panel learning-panel lesson-article" style="font-size:${state.readerSize}px"><p>${esc(lesson.note.summary)}</p>${lesson.note.points.map((point, i) => `<section id="lesson-section-${i}"><h2>${esc(point.label)}</h2><p>${esc(point.desc)}</p></section>`).join('')}<h2>Related paper questions</h2><p class="fine">Demo paper references, not verified previous questions.</p>${relatedPapers(lesson)}<h2>Practice concepts</h2>${qs.map((q) => `<section><h3>${esc(q.text)}</h3><p>${esc(q.explanation)}</p></section>`).join('') || '<p>No related practice questions available.</p>'}<p class="fine">These are local study notes with demo learning sections. Verified previous questions and source-reviewed lesson material have not been added.</p></article>` : '<section class="panel learning-panel"><h2>Lesson content not available</h2><p>This topic needs a complete lesson before it can be marked as read.</p></section>'}<section class="panel learning-panel"><label for="lesson-note">My short note</label><textarea id="lesson-note" maxlength="4000" rows="4" placeholder="Write a note for revision">${esc(reading.note || '')}</textarea><p class="fine" id="note-status">Saved automatically on this browser.</p></section><div class="learning-actions"><button class="primary" data-action="complete-lesson" ${!lesson.note ? 'disabled' : ''}>${reading.done ? 'Mark unread' : 'পড়া শেষ'}</button><button class="secondary" data-action="lesson-practice" ${!qs.length ? 'disabled' : ''}>এই topic practice করো (${qs.length})</button></div><div class="learning-actions">${index > 0 ? lessonLink(siblings[index - 1], '← Previous topic') : ''}${index < siblings.length - 1 ? lessonLink(siblings[index + 1], 'Next topic →') : `<button class="secondary" data-action="study-chapter" data-subject="${lesson.subject}" data-chapter="${lesson.chapter}">Chapter overview & test</button>`}</div>`;
}
function customPractice() {
  const chapters =
    practiceOptions.subject === ''
      ? []
      : subjects[Number(practiceOptions.subject)].chapters;
  const topics =
    practiceOptions.chapter === ''
      ? []
      : chapters[Number(practiceOptions.chapter)].topics;
  return `${learningHeader('Custom practice')}<form id="custom-practice-form" class="panel learning-panel"><div class="field-grid"><label>Subject<select id="practice-subject"><option value="">All subjects</option>${subjects.map((s, i) => `<option value="${i}" ${practiceOptions.subject === String(i) ? 'selected' : ''}>${esc(s.short)}</option>`).join('')}</select></label><label>Chapter<select id="practice-chapter"><option value="">All chapters</option>${chapters.map((c, i) => `<option value="${i}" ${practiceOptions.chapter === String(i) ? 'selected' : ''}>${esc(c.title)}</option>`).join('')}</select></label><label>Topic<select id="practice-topic"><option value="">All topics</option>${topics.map((t) => `<option ${practiceOptions.topic === t.name ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></label><label>Questions<select id="practice-status">${[
    ['all', 'All questions'],
    ['new', 'Never attempted'],
    ['wrong', 'Last answered incorrectly'],
    ['unanswered', 'Last skipped'],
  ]
    .map(
      ([id, label]) =>
        `<option value="${id}" ${practiceOptions.status === id ? 'selected' : ''}>${label}</option>`,
    )
    .join(
      '',
    )}</select></label><label>Question count<input id="practice-count" type="number" min="1" max="${questions.length}" value="${practiceOptions.count}" required></label></div><p class="fine">${practicePool().length} matching questions. Smaller pools use all matching questions.</p><button class="primary" ${!practicePool().length ? 'disabled' : ''}>Start practice</button></form>`;
}
function practicePool() {
  return originalQuestions.filter((q) => {
    if (
      practiceOptions.subject !== '' &&
      q.subject !== Number(practiceOptions.subject)
    )
      return false;
    if (
      practiceOptions.chapter !== '' &&
      q.chapter !== Number(practiceOptions.chapter)
    )
      return false;
    if (practiceOptions.topic && q.topic !== practiceOptions.topic)
      return false;
    const last = state.attempts.filter((attempt) => attempt.id === q.id).at(-1);
    if (practiceOptions.status === 'new') return !last;
    if (practiceOptions.status === 'wrong')
      return last && !last.correct && last.choice !== null;
    if (practiceOptions.status === 'unanswered') return last?.choice === null;
    return true;
  });
}
function exams() {
  return `${learningHeader('Exam')}<section class="panel learning-panel"><h2>Local mock test</h2><p>Build a test from the available practice questions. These settings are for your own mock, not an official exam pattern.</p><form id="mock-form"><div class="field-grid"><label>Subject<select name="subject"><option value="">Full mock · all subjects</option>${subjects.map((s, i) => `<option value="${i}">${esc(s.short)} test</option>`).join('')}</select></label><label>Minutes<input name="minutes" type="number" min="1" max="240" value="10" required></label><label>Marks per correct answer<input name="marks" type="number" min="0.25" max="10" step="0.25" value="1" required></label><label>Deduction per wrong answer<input name="penalty" type="number" min="0" max="10" step="0.25" value="0" required></label></div><button class="primary">Start test</button></form></section><div class="learning-actions"><a class="secondary" href="#study">Chapter Test</a><a class="secondary" href="#papers">Previous Paper Test</a><a class="secondary" href="#history">Result history</a></div>`;
}
function paperOptions(values, selected) {
  return [...new Set(values)]
    .map(
      (value) =>
        `<option value="${esc(value)}" ${String(value) === selected ? 'selected' : ''}>${esc(value)}</option>`,
    )
    .join('');
}
function papers() {
  const institutePapers = demoPapers.filter(
    (paper) => !paperInstitute || paper.institute === paperInstitute,
  );
  const postPapers = institutePapers.filter(
    (paper) => !paperPost || paper.post === paperPost,
  );
  const filtered = postPapers.filter(
    (paper) => !paperYear || String(paper.year) === paperYear,
  );
  return `${learningHeader('Previous Questions', 'bank')}<section class="panel learning-panel"><p class="tag">Demo data · not actual previous papers</p><div class="field-grid"><label>Institute<select id="paper-institute"><option value="">All institutes</option>${paperOptions([...INSTITUTES.map((inst) => inst.id), 'primary'], paperInstitute)}</select></label><label>Post<select id="paper-post"><option value="">All posts</option>${paperOptions(
    institutePapers.map((paper) => paper.post),
    paperPost,
  )}</select></label><label>Year<select id="paper-year"><option value="">All years</option>${paperOptions(
    postPapers.map((paper) => paper.year),
    paperYear,
  )}</select></label></div>${filtered.map((paper) => `<div class="learning-row"><h2>${esc(paper.title)}</h2><p>${esc(paper.post)} · ${paper.questionIds.length} questions · ${paper.rules.minutes} minutes</p><button class="secondary" data-action="open-paper" data-paper="${paper.id}">Read paper & solutions</button></div>`).join('') || '<p>No papers available for this selection.</p>'}<p class="fine">All paper identities, years and rules above are synthetic fixtures. Verified historical papers have not been added.</p></section>`;
}
function questionIdentity(question) {
  return `<p class="fine">${question.demo ? 'Demo · ' : ''}${[question.exam, question.institute, question.post, question.year, question.stage].filter(Boolean).map(esc).join(' · ')} · Source: ${esc(question.source || 'Not provided')} · ${question.verified ? 'Verified' : 'Not verified'}</p>`;
}
function paperScreen() {
  const paper = demoPapers.find((item) => item.id === selectedPaper);
  return `${learningHeader(paper.title, 'papers')}<section class="panel learning-panel"><p class="tag">Demo paper · not a historical exam</p><p>${esc(paper.post)} · ${paper.year} · ${esc(paper.stage)}</p><p>${paper.questionIds.length} questions · ${paper.rules.minutes} minutes · +${paper.rules.marks} correct · −${paper.rules.penalty} wrong · 0 skipped</p><p class="fine">Source: ${esc(paper.source)}. Explanation status: not verified.</p><button class="primary" data-action="paper-test">Take full demo paper test</button></section>${paper.questionIds
    .map((id, index) => {
      const question = questions[id];
      return `<section class="panel learning-panel"><h2>${index + 1}. ${esc(question.text)}</h2>${question.options.map((option, i) => `<p>${i + 1}. ${esc(option)}</p>`).join('')}<details><summary>Answer & explanation</summary><p>${esc(question.options[question.answer])}</p><p>${esc(question.explanation)}</p></details></section>`;
    })
    .join('')}`;
}
function examPreparation() {
  const exam =
    demoExams.find((item) => item.name === state.profile.exam) || demoExams[0];
  return `${learningHeader('Exam-wise preparation', 'bank')}<section class="panel learning-panel"><label>Target exam<select id="preparation-exam">${demoExams.map((item) => `<option ${exam.name === item.name ? 'selected' : ''}>${esc(item.name)}</option>`).join('')}</select></label><p class="tag">Demo syllabus · not an official syllabus</p><h2>${esc(exam.name)}</h2>${exam.subjects.map((index) => `<div class="learning-row"><button class="text-button" data-action="study-subject" data-subject="${index}">${esc(subjects[index].name)}</button><p class="fine">${subjects[index].chapters.map((chapter) => esc(chapter.title)).join(' · ')}</p></div>`).join('')}<div class="learning-actions"><button class="primary" data-action="exam-practice">Practice demo exam questions</button><button class="secondary" data-action="exam-papers">Browse demo papers</button></div></section>`;
}

function preparation() {
  const done = lessons.filter(
    (lesson) => state.reading[lesson.id]?.done,
  ).length;
  const saved = lessons.filter(
    (lesson) =>
      state.reading[lesson.id]?.done ||
      state.reading[lesson.id]?.saved ||
      state.reading[lesson.id]?.note,
  );
  return `${heading('My Preparation')}<p>${done}/${lessons.length} topics read</p><progress value="${done}" max="${lessons.length}" aria-label="Completed topics"></progress>${continueReading()}<div class="learning-actions">${[
    ['custom', 'Custom practice'],
    ['history', 'Result & history'],
    ['review', 'Wrong answers & bookmarks'],
    ['routine', 'Routine'],
    ['progress', 'Practice progress'],
    ['affairs', 'Current affairs'],
    ['backup', 'Offline & backup'],
    ['settings', 'Settings'],
  ]
    .map(
      ([route, label]) => `<a class="secondary" href="#${route}">${label}</a>`,
    )
    .join(
      '',
    )}</div><section class="panel learning-panel"><h2>Study revision · completed lessons, bookmarks & notes</h2>${saved.map((lesson) => `<div class="learning-row">${lessonLink(lesson)}<p class="preserve-lines">${esc(state.reading[lesson.id].note || (state.reading[lesson.id].done ? 'Completed lesson' : 'Bookmarked lesson'))}</p></div>`).join('') || '<p>No completed lessons, bookmarks or notes yet.</p>'}</section><section class="panel learning-panel"><h2>Formula revision</h2>${studyFormulas
    .map((formula) => {
      const lesson = lessons.find((item) => item.topic === formula.topic);
      return `<div class="learning-row">${lessonLink(lesson)}<p>${esc(formula.text)}</p></div>`;
    })
    .join('')}</section>`;
}
function sessionScore(session) {
  const correct = session.answers.filter((answer) => answer.correct).length;
  const wrong = session.answers.filter(
    (answer) => !answer.correct && answer.choice !== null,
  ).length;
  return (
    correct * (session.rules?.marks || 1) -
    wrong * (session.rules?.penalty || 0)
  );
}
function historyScreen() {
  return `${learningHeader('Result & history')}<div class="learning-grid">${
    state.history
      .slice()
      .reverse()
      .map(
        (session) =>
          `<section class="panel learning-panel"><h2>${esc(session.title)}</h2><p>${new Date(session.endedAt).toLocaleString()} · ${sessionScore(session)} marks · ${Math.round((session.endedAt - session.startedAt) / 1000)} seconds</p>${historyComparison(session)}${subjects
            .map((subject, index) => {
              const answers = session.answers.filter(
                (answer) => questions[answer.id]?.subject === index,
              );
              return answers.length
                ? `<p>${esc(subject.short)}: ${answers.filter((a) => a.correct).length}/${answers.length} correct${answers.filter((answer) => answer.correct).length / answers.length < 0.7 ? ' · Needs revision' : ''}</p>`
                : '';
            })
            .join(
              '',
            )}<button class="secondary" data-action="history-result" data-result="${session.endedAt}">Answers & explanations</button></section>`,
      )
      .join('') || '<p>No completed sessions yet.</p>'
  }</div>`;
}
function affairs() {
  const items = demoAffairs.filter((article) => article.month === affairsMonth);
  return `${learningHeader('Current affairs')}<section class="panel learning-panel"><label>Month<input id="affairs-month" type="month" value="${affairsMonth}"></label><p class="tag">Fictional demo articles</p>${items.map((article) => `<div class="learning-row"><h2>${esc(article.title)}</h2><p class="fine">${article.date} · Source: ${esc(article.source)}</p><p>${esc(article.text)}</p><button class="secondary" data-action="affairs-quiz" data-article="${article.id}">Related quiz</button></div>`).join('') || '<p>No updates for this month.</p>'}</section>`;
}

function backupScreen() {
  return `${learningHeader('Offline & backup')}<section class="panel learning-panel"><h2>Local backup</h2><p>Export your progress before switching browsers. Restore replaces question and reading progress, bookmarks, revision schedules and result history. Settings and routine are kept.</p><button class="primary" data-action="learning-backup">Download backup</button><label>Restore backup<input id="learning-restore" type="file" accept="application/json"></label><p class="fine" id="restore-status"></p><h2>Offline practice</h2><button class="secondary" data-action="enable-offline">Enable offline on this device</button><p id="offline-status" class="fine">Loads this app locally after the first successful download.</p><h2>Offline reading</h2><p>Download individual lessons from their reading screen. Questions can also be saved as an offline reading file.</p><button class="secondary" data-action="download-questions">Download questions</button><p class="fine">Cloud sync is not connected. Data remains on this device.</p></section>`;
}
function currentReading() {
  state.reading[activeLesson] ||= {};
  return state.reading[activeLesson];
}
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'open-paper') {
    selectedPaper = button.dataset.paper;
    state.selectedPaper = selectedPaper;
    save();
    navigate('paper');
  } else if (action === 'paper-test') {
    if (state.session) return navigate('practice');
    const paper = demoPapers.find((item) => item.id === selectedPaper);
    start(paper.questionIds.slice(), paper.title, 'exam');
    state.session.rules = { ...paper.rules };
    state.session.paperId = paper.id;
    state.session.deadline = Date.now() + paper.rules.minutes * 60000;
    save();
  } else if (action === 'exam-practice') {
    const exam =
      demoExams.find((item) => item.name === state.profile.exam) ||
      demoExams[0];
    start(
      questions
        .filter((question) => question.exam === exam.name)
        .map((question) => question.id),
      `${exam.name} · Demo practice`,
    );
  } else if (action === 'exam-papers') {
    paperInstitute = (
      demoExams.find((item) => item.name === state.profile.exam) || demoExams[0]
    ).institute;
    paperPost = '';
    paperYear = '';
    navigate('papers');
  } else if (action === 'affairs-quiz') {
    const article = demoAffairs.find(
      (item) => item.id === button.dataset.article,
    );
    start([article.questionId], article.title);
  } else if (action === 'study-subject') {
    studySubject = Number(button.dataset.subject);
    studyChapter = null;
    navigate('study');
  } else if (action === 'study-root') {
    studySubject = null;
    studyChapter = null;
    render();
  } else if (action === 'read-lesson') openLesson(button.dataset.lesson);
  else if (action === 'save-lesson' || action === 'complete-lesson') {
    const key = action === 'save-lesson' ? 'saved' : 'done';
    currentReading()[key] = !currentReading()[key];
    save();
    render();
  } else if (action === 'lesson-section') {
    document
      .getElementById(`lesson-section-${button.dataset.section}`)
      ?.scrollIntoView();
  } else if (action === 'lesson-practice') {
    const lesson = lessons.find((item) => item.id === activeLesson);
    start(
      lessonQuestions(lesson).map((q) => q.id),
      lesson.topic,
    );
  } else if (action === 'chapter-test') {
    const chapterLessons = lessons.filter(
      (lesson) =>
        lesson.subject === studySubject && lesson.chapter === studyChapter,
    );
    if (
      !chapterLessons.length ||
      !chapterLessons.every((lesson) => state.reading[lesson.id]?.done)
    )
      return;
    const ids = originalQuestions
      .filter((q) => q.subject === studySubject && q.chapter === studyChapter)
      .map((q) => q.id);
    if (!ids.length) return toast('No chapter test questions available.');
    start(ids, subjects[studySubject].chapters[studyChapter].title, 'exam');
  } else if (action === 'history-result') {
    state.lastResult = state.history.find(
      (session) => session.endedAt === Number(button.dataset.result),
    );
    navigate('result');
  } else if (action === 'download-lesson') {
    const lesson = lessons.find((item) => item.id === activeLesson);
    if (!lesson.note) return;
    const text = [
      lesson.topic,
      lesson.note.summary,
      ...lesson.note.points.map((point) => `${point.label}\n${point.desc}`),
      'My note',
      currentReading().note || '',
    ].join('\n\n');
    downloadFile(`${lesson.id}.txt`, text, 'text/plain');
  } else if (action === 'learning-backup') {
    downloadFile(
      'prosthuti-backup.json',
      JSON.stringify({ version: 1, state }, null, 2),
      'application/json',
    );
  }
});
document.addEventListener('input', (event) => {
  if (event.target.id === 'lesson-note') {
    currentReading().note = event.target.value;
    save();
  }
  if (event.target.id === 'practice-count')
    practiceOptions.count = Number(event.target.value);
});
document.addEventListener('change', (event) => {
  const element = event.target;
  if (element.id === 'reader-size') {
    state.readerSize = Number(element.value);
    save();
    render();
  } else if (element.id.startsWith('practice-')) {
    const key = element.id.slice(9);
    if (!Object.hasOwn(practiceOptions, key)) return;
    practiceOptions[key] =
      key === 'count' ? Number(element.value) : element.value;
    if (key === 'subject') practiceOptions.chapter = '';
    if (key === 'subject' || key === 'chapter') practiceOptions.topic = '';
    render();
  } else if (element.id === 'paper-institute') {
    paperInstitute = element.value;
    paperPost = '';
    paperYear = '';
    render();
  } else if (element.id === 'paper-post') {
    paperPost = element.value;
    paperYear = '';
    render();
  } else if (element.id === 'paper-year') {
    paperYear = element.value;
    render();
  } else if (element.id === 'affairs-month') {
    affairsMonth = element.value;
    render();
  } else if (element.id === 'preparation-exam') {
    state.profile.exam = element.value;
    save();
    render();
  }
});
document.addEventListener('submit', (event) => {
  if (event.target.id === 'custom-practice-form') {
    event.preventDefault();
    const ids = practicePool()
      .slice(0, practiceOptions.count)
      .map((q) => q.id);
    if (ids.length) start(ids, 'Custom practice');
  } else if (event.target.id === 'mock-form') {
    event.preventDefault();
    if (state.session) return navigate('practice');
    const form = new FormData(event.target);
    const subject = form.get('subject');
    const ids = originalQuestions
      .filter((q) => subject === '' || q.subject === Number(subject))
      .map((q) => q.id);
    start(
      ids,
      subject === ''
        ? 'Full local mock'
        : `${subjects[Number(subject)].short} test`,
      'exam',
    );
    state.session.deadline = Date.now() + Number(form.get('minutes')) * 60000;
    state.session.rules = {
      marks: Number(form.get('marks')),
      penalty: Number(form.get('penalty')),
    };
    save();
  }
});
let readingScrollTimer;
window.addEventListener(
  'scroll',
  () => {
    if (page !== 'lesson') return;
    const id = activeLesson;
    const position = window.scrollY;
    clearTimeout(readingScrollTimer);
    readingScrollTimer = setTimeout(() => {
      state.reading[id] ||= {};
      state.reading[id].position = position;
      save();
    }, 150);
  },
  { passive: true },
);

let pendingBackup = null;
function validateBackup(value) {
  if (value?.version !== 1 || !value.state || typeof value.state !== 'object')
    throw new Error('Unsupported backup.');
  const backup = value.state;
  const validId = (id) => Number.isInteger(id) && Boolean(questions[id]);
  const validAnswer = (answer) =>
    answer &&
    validId(answer.id) &&
    (answer.choice === null ||
      (Number.isInteger(answer.choice) &&
        answer.choice >= 0 &&
        answer.choice < questions[answer.id].options.length)) &&
    typeof answer.correct === 'boolean' &&
    Number.isFinite(answer.at) &&
    /^\d{4}-\d{2}-\d{2}$/.test(answer.day);
  if (!Array.isArray(backup.attempts) || !backup.attempts.every(validAnswer))
    throw new Error('Invalid question progress.');
  if (!Array.isArray(backup.saved) || !backup.saved.every(validId))
    throw new Error('Invalid question bookmarks.');
  const reading = {};
  if (
    !backup.reading ||
    typeof backup.reading !== 'object' ||
    Array.isArray(backup.reading)
  )
    throw new Error('Invalid reading progress.');
  for (const lesson of lessons) {
    const item = backup.reading[lesson.id];
    if (!item) continue;
    if (
      typeof item !== 'object' ||
      (item.note !== undefined && typeof item.note !== 'string')
    )
      throw new Error('Invalid lesson notes.');
    reading[lesson.id] = {
      done: item.done === true,
      saved: item.saved === true,
      note: (item.note || '').slice(0, 4000),
      position: Number.isFinite(item.position) ? Math.max(0, item.position) : 0,
    };
  }
  const history = backup.history;
  if (
    !Array.isArray(history) ||
    !history.every(
      (session) =>
        session &&
        typeof session.title === 'string' &&
        ['practice', 'exam'].includes(session.mode) &&
        Array.isArray(session.ids) &&
        session.ids.every(validId) &&
        Array.isArray(session.answers) &&
        session.answers.every(validAnswer) &&
        session.ids.length === session.answers.length &&
        session.answers.every(
          (answer, index) => answer.id === session.ids[index],
        ) &&
        Number.isFinite(session.startedAt) &&
        Number.isFinite(session.endedAt) &&
        session.endedAt >= session.startedAt &&
        (!session.rules ||
          (Number.isFinite(session.rules.marks) &&
            session.rules.marks > 0 &&
            Number.isFinite(session.rules.penalty) &&
            session.rules.penalty >= 0)),
    )
  )
    throw new Error('Invalid result history.');
  const reviews = {};
  if (!backup.reviews || typeof backup.reviews !== 'object')
    throw new Error('Invalid revision progress.');
  for (const [id, review] of Object.entries(backup.reviews)) {
    if (
      !validId(Number(id)) ||
      !Number.isFinite(review?.due) ||
      !Number.isInteger(review?.level) ||
      review.level < 0
    )
      throw new Error('Invalid revision schedule.');
    reviews[id] = { due: review.due, level: review.level };
  }
  return {
    attempts: backup.attempts.map(
      ({ id, choice, correct, guess, at, day }) => ({
        id,
        choice,
        correct,
        guess: guess === true,
        at,
        day,
      }),
    ),
    saved: backup.saved,
    reading,
    history: history.map((session) => ({
      ids: session.ids,
      title: session.title,
      mode: session.mode,
      answers: session.answers,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      rules: session.rules,
    })),
    reviews,
    lastLesson: lessons.some((lesson) => lesson.id === backup.lastLesson)
      ? backup.lastLesson
      : null,
    readerSize: [16, 18, 20, 24].includes(backup.readerSize)
      ? backup.readerSize
      : 18,
  };
}
function restoreScreen() {
  if (!pendingBackup)
    return `${learningHeader('Restore backup', 'backup')}<p>Select a backup first.</p>`;
  return `${learningHeader('Restore backup', 'backup')}<section class="panel learning-panel"><h2>Review before restoring</h2><p>${pendingBackup.attempts.length} attempts · ${pendingBackup.history.length} results · ${Object.keys(pendingBackup.reading).length} reading records</p><p>This replaces question and reading progress, revision schedules, bookmarks and result history. Your profile, settings and routine stay unchanged. Any active practice session will be cleared.</p><button class="primary" data-action="confirm-restore">Replace local progress</button><a class="secondary" href="#backup">Cancel</a></section>`;
}
document.addEventListener('change', async (event) => {
  if (event.target.id !== 'learning-restore') return;
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > 10 * 1024 * 1024)
      throw new Error('Backup is too large (maximum 10 MB).');
    pendingBackup = validateBackup(JSON.parse(await file.text()));
    navigate('restore-backup');
  } catch (error) {
    pendingBackup = null;
    const status = $('#restore-status');
    if (status) status.textContent = error.message;
  }
});
document.addEventListener('click', async (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'confirm-restore' && pendingBackup) {
    Object.assign(state, pendingBackup);
    state.session = null;
    state.lastResult = state.history.at(-1) || null;
    activeLesson = state.lastLesson || lessons[0].id;
    pendingBackup = null;
    save();
    navigate('preparation');
    toast('Local progress restored.');
  } else if (action === 'enable-offline') {
    const status = $('#offline-status');
    if (!('serviceWorker' in navigator)) {
      status.textContent =
        'Offline installation requires a supported browser on localhost.';
      return;
    }
    try {
      status.textContent = 'Downloading app files…';
      const registration = await navigator.serviceWorker.register(
        './offline-worker.js',
      );
      if (!registration.active) {
        await new Promise((resolve, reject) => {
          const worker = registration.installing || registration.waiting;
          if (!worker) return reject(new Error('No offline worker available.'));
          worker.addEventListener('statechange', () => {
            if (worker.state === 'activated') resolve();
            if (worker.state === 'redundant')
              reject(new Error('App download failed.'));
          });
        });
      }
      status.textContent =
        'Ready for offline reading and practice on this browser.';
    } catch (error) {
      status.textContent = `Offline setup failed: ${error.message}`;
    }
  }
});

function navigationPage(route) {
  if (['study', 'lesson'].includes(route)) return 'study';
  if (['bank', 'papers', 'paper', 'exam-preparation'].includes(route))
    return 'bank';
  if (['exams', 'practice'].includes(route)) return 'exams';
  if (route === 'home' || route === 'settings') return route;
  return 'preparation';
}

function historyComparison(session) {
  const previous = state.history
    .filter(
      (item) =>
        item.endedAt < session.endedAt &&
        item.title === session.title &&
        item.ids.length === session.ids.length &&
        (item.rules?.marks || 1) === (session.rules?.marks || 1) &&
        (item.rules?.penalty || 0) === (session.rules?.penalty || 0),
    )
    .at(-1);
  if (!previous) return '';
  const scoreDifference = sessionScore(session) - sessionScore(previous);
  const timeDifference = Math.round(
    (session.endedAt -
      session.startedAt -
      (previous.endedAt - previous.startedAt)) /
      1000,
  );
  return `<p class="fine">Compared with the previous matching test: ${scoreDifference >= 0 ? '+' : ''}${scoreDifference} marks · ${Math.abs(timeDifference)} seconds ${timeDifference >= 0 ? 'longer' : 'faster'} elapsed time.</p>`;
}
function relatedPapers(lesson) {
  const papers = demoPapers.filter((paper) =>
    paper.questionIds.some((id) => {
      const question = questions[id];
      return (
        question.subject === lesson.subject &&
        question.chapter === lesson.chapter &&
        question.topic === lesson.topic
      );
    }),
  );
  return (
    papers
      .map(
        (paper) =>
          `<button class="text-button" data-action="open-paper" data-paper="${paper.id}">${esc(paper.title)}</button>`,
      )
      .join('') || '<p>No related papers available.</p>'
  );
}
