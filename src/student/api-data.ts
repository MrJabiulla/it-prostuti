interface ApiSubject {
  id: number;
  title: string;
  bengali: string;
  short: string;
  symbol: string;
  color: string;
}
interface ApiChapter {
  id: number;
  title: string;
  english: string;
}
interface ApiTopic {
  id: number;
  title: string;
  english: string;
  lesson_id: number | null;
  reading_minutes: number;
  completed_at: string | null;
  reading_position: number;
}
interface ApiQuestion {
  id: number;
  topic_id: number;
  subject_id: number;
  chapter_id: number;
  topic: string;
  text: string;
  explanation?: string;
  source: string;
  verified: boolean;
  is_demo: boolean;
  options: {
    text: string;
    position: number;
    is_correct?: boolean;
  }[];
  papers?: {
    paper_id: number;
    exam: string;
    institute: string;
    post: string;
    year: number;
    stage: string;
  }[];
}
interface ApiPaper {
  id: number;
  title: string;
  exam_id: number;
  institute_id: number;
  post_title: string;
  year: number;
  stage: string;
  source: string;
  verified: boolean;
  is_demo: boolean;
  duration_minutes: number;
  correct_marks: number;
  wrong_penalty: number;
}
interface ApiPreferences {
  exam_id: number | null;
  daily_minutes: number;
  daily_questions: number;
  target_date: string | null;
  focus_subject_ids: number[];
  theme: string;
  theme_chosen: boolean;
  font_size: string;
  low_data: boolean;
  reminder: boolean;
  reminder_time: string;
  streak_alert: boolean;
  reader_size: number;
  last_lesson_id: number | null;
  selected_paper_id: number | null;
  timezone: string;
}
interface ApiAttempt {
  id: string;
  title: string;
  mode: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  submitted_at: string | null;
  paper_id: number | null;
  correct_marks: number;
  wrong_penalty: number;
  score: number | null;
  current_index: number;
  current_page: number;
  routine_task_id: number | null;
}
interface ApiAttemptItem {
  id: number;
  question_id: number;
  subject_id: number;
  text: string;
  options: string[];
  correct_option?: number;
  explanation?: string;
  source: string;
  verified: boolean;
  is_demo: boolean;
  selected_option: number | null;
  is_correct?: boolean;
  guess: boolean;
  answered_at: string | null;
}
interface ApiAttemptView {
  data: ApiAttempt;
  items: ApiAttemptItem[];
  server_time: string;
}
interface ApiActivity {
  attempt_id: string;
  question_id: number;
  subject_id: number;
  chapter_id: number;
  topic_id: number;
  selected_option: number | null;
  is_correct: boolean;
  guess: boolean;
  at: string;
  day: string;
}
interface ApiTask {
  id: number;
  date: string;
  client_id: string | null;
  title: string;
  kind: string;
  subject_id: number | null;
  questions: number;
  minutes: number;
  completed_at: string | null;
}
interface ApiPlan {
  date: string;
  goal: number;
  minutes: number;
  custom: boolean;
}
interface ApiRoutine {
  data: ApiTask[];
  plans: ApiPlan[];
}
interface ApiAffair {
  id: number;
  title: string;
  body: string;
  source: string;
  publication_date: string;
  category: string | null;
  questions: ApiQuestion[];
}
const apiSubjectIndexes = new Map<number, number>();
const apiChapterIndexes = new Map<number, {
  subject: number;
  chapter: number;
}>();
const apiQuestionIndexes = new Map<number, number>();
const apiLessonIds = new Map<string, number>();
const apiTaskIds = new Map<string, number>();
const apiAffairQuestionIds = new Map<string, number[]>();
const apiExamIds = new Map<string, number>();
const apiLoadedLessons = new Set<string>();
const apiLoadedRoutineMonths = new Set<string>();
let apiNotices: {
  title: string;
  meta: string;
}[] = [];
let apiAffairHeadlines: {
  title: string;
  meta: string;
}[] = [];
function apiTime(value: string | null): number {
  if (!value)
    return 0;
  // MySQL timestamps are UTC even when their JSON representation has no offset.
  const normalized = value.includes('T') ? value : value.replace(' ', 'T') + 'Z';
  return Date.parse(normalized);
}
function apiQuestion(row: ApiQuestion, id: number): Question {
  const identity = row.papers?.[0];
  const chapter = apiChapterIndexes.get(row.chapter_id);
  return {
    id,
    serverId: row.id,
    subject: apiSubjectIndexes.get(row.subject_id) ?? chapter?.subject ?? 0,
    chapter: chapter?.chapter ?? 0,
    topic: row.topic || '',
    text: row.text,
    options: row.options.slice().sort((a, b) => a.position - b.position).map((option) => option.text),
    answer: row.options.find((option) => option.is_correct)?.position ?? -1,
    explanation: row.explanation || '',
    source: row.source,
    verified: Boolean(row.verified),
    demo: Boolean(row.is_demo),
    ...(identity ? {
      paperId: String(identity.paper_id),
      exam: identity.exam,
      institute: identity.institute,
      post: identity.post,
      year: identity.year,
      stage: identity.stage
    } : {}),
  };
}
async function loadApiCatalogue() {
  const [subjectResponse, questionRows, examResponse, paperRows, filters] = await Promise.all([
    apiRequest<{
      data: ApiSubject[];
    }>('/subjects'), apiPages<ApiQuestion>('/questions?solutions=1'),
    apiRequest<{
      data: {
        id: number;
        title: string;
      }[];
    }>('/exams'), apiPages<ApiPaper>('/papers'),
    apiRequest<{
      institutes: {
        id: number;
        title: string;
      }[];
    }>('/papers/filters'),
  ]);
  const trees = await apiMap(subjectResponse.data, async (subject) => {
    const detail = await apiRequest<{
      chapters: ApiChapter[];
    }>(`/subjects/${subject.id}`);
    const chapters = await apiMap(detail.chapters, async (chapter) => ({
      ...chapter,
      ...(await apiRequest<{
        topics: ApiTopic[];
      }>(`/chapters/${chapter.id}`)),
    }));
    return {
      ...subject,
      chapters
    };
  });
  subjects.splice(0);
  lessons.splice(0);
  apiSubjectIndexes.clear();
  apiChapterIndexes.clear();
  apiLessonIds.clear();
  apiQuestionIndexes.clear();
  apiExamIds.clear();
  apiLoadedLessons.clear();
  Object.keys(demoLessons).forEach((key) => delete demoLessons[key]);
  studyFormulas.splice(0);
  trees.forEach((subject, subjectIndex) => {
    apiSubjectIndexes.set(subject.id, subjectIndex);
    subjects.push({
      serverId: subject.id,
      name: subject.title,
      bengali: subject.bengali || subject.title,
      short: subject.short || subject.title,
      symbol: subject.symbol || '',
      color: /^#[\da-f]{3,6}$/i.test(subject.color || '') ? subject.color : '#eef1e8',
      chapters: subject.chapters.map((chapter, chapterIndex) => {
        apiChapterIndexes.set(chapter.id, {
          subject: subjectIndex,
          chapter: chapterIndex
        });
        chapter.topics.forEach((topic, topicIndex) => {
          const id = `${chapter.id}-${topicIndex}`;
          const note: LessonNote = topic.lesson_id ? {
            readTime: `${topic.reading_minutes} min`,
            summary: '',
            demo: false,
            points: []
          } : undefined;
          lessons.push({
            id,
            subject: subjectIndex,
            chapter: chapterIndex,
            topic: topic.title,
            chapterTitle: chapter.title,
            note
          });
          if (topic.lesson_id)
            apiLessonIds.set(id, topic.lesson_id);
          state.reading[id] = {
            done: Boolean(topic.completed_at),
            position: topic.reading_position || 0
          };
        });
        return {
          id: String(chapter.id),
          title: chapter.title,
          english: chapter.english || '',
          topics: chapter.topics.map((topic) => ({
            name: topic.title,
            english: topic.english || ''
          }))
        };
      }),
    });
  });
  questions.splice(0);
  questionRows.forEach((row, index) => {
    apiQuestionIndexes.set(row.id, index);
    questions.push(apiQuestion(row, index));
  });
  originalQuestions.splice(0, originalQuestions.length, ...questions);
  demoExams.splice(0, demoExams.length, ...examResponse.data.map((exam) => {
    apiExamIds.set(exam.title, exam.id);
    const paper = paperRows.find((item) => item.exam_id === exam.id);
    return {
      name: exam.title,
      institute: String(paper?.institute_id || ''),
      post: paper?.post_title || '',
      subjects: []
    };
  }));
  await apiMap(examResponse.data, async (exam) => {
    const detail = await apiRequest<{
      subjects: {
        id: number;
      }[];
    }>(`/exams/${exam.id}`);
    demoExams.find((item) => item.name === exam.title).subjects = detail.subjects.map((item) => apiSubjectIndexes.get(item.id)).filter((id) => id !== undefined);
  });
  demoPapers.splice(0, demoPapers.length, ...paperRows.map((paper) => ({
    id: String(paper.id),
    title: paper.title,
    exam: examResponse.data.find((exam) => exam.id === paper.exam_id)?.title || '',
    institute: String(paper.institute_id),
    post: paper.post_title,
    year: paper.year,
    stage: paper.stage,
    source: paper.source,
    verified: Boolean(paper.verified),
    rules: {
      minutes: paper.duration_minutes,
      marks: Number(paper.correct_marks),
      penalty: Number(paper.wrong_penalty)
    },
    questionIds: questionRows.filter((question) => question.papers?.some((item) => item.paper_id === paper.id)).map((question) => apiQuestionIndexes.get(question.id)),
  })));
  // The existing paper select uses institute labels from paper data.
  for (const paper of demoPapers) {
    const label = filters.institutes.find((item) => String(item.id) === paper.institute)?.title;
    if (label)
      apiInstituteLabels.set(paper.institute, label);
  }
}
const apiInstituteLabels = new Map<string, string>();
function applyApiProfile(profile: {
  data: {
    name: string;
  };
  preferences: ApiPreferences | null;
}) {
  const p = profile.preferences;
  state.profile.name = profile.data.name;
  if (!p) {
    state.profile.exam = demoExams[0]?.name || '';
    return;
  }
  apiTimezone = p.timezone;
  state.profile = {
    name: profile.data.name,
    exam: [...apiExamIds].find(([, id]) => id === p.exam_id)?.[0] || demoExams[0]?.name || '',
    minutes: p.daily_minutes,
    dailyGoal: p.daily_questions,
    date: p.target_date || '',
    focus: (p.focus_subject_ids || []).map((id) => apiSubjectIndexes.get(id)).filter((id) => id !== undefined)
  };
  state.preferences = {
    theme: p.theme,
    themeChosen: Boolean(p.theme_chosen),
    fontSize: p.font_size,
    lowData: Boolean(p.low_data),
    reminder: Boolean(p.reminder),
    reminderTime: p.reminder_time.slice(0, 5),
    streakAlert: Boolean(p.streak_alert)
  };
  state.readerSize = p.reader_size;
  state.lastLesson = [...apiLessonIds].find(([, id]) => id === p.last_lesson_id)?.[0];
  state.selectedPaper = p.selected_paper_id ? String(p.selected_paper_id) : undefined;
}
async function loadApiLesson(id: string) {
  const serverId = apiLessonIds.get(id);
  if (!serverId || apiLoadedLessons.has(id))
    return;
  const response = await apiRequest<{
    data: {
      summary: string;
      reading_minutes: number;
      is_demo: boolean;
    };
    sections: {
      title: string;
      body: string;
      kind: string;
      media_file_id: number | null;
    }[];
    progress: {
      position: number;
      completed_at: string | null;
    } | null;
    note: string | null;
    bookmarked: boolean;
  }>(`/lessons/${serverId}`);
  const lesson = lessons.find((item) => item.id === id);
  lesson.note = {
    summary: response.data.summary,
    readTime: `${response.data.reading_minutes} min`,
    demo: Boolean(response.data.is_demo),
    points: response.sections.map((section) => ({
      label: section.title,
      desc: section.body
    }))
  };
  demoLessons[lesson.topic] = lesson.note;
  for (const section of response.sections.filter((item) => item.kind === 'formula')) {
    studyFormulas.push({
      topic: lesson.topic,
      text: section.body
    });
  }
  state.reading[id] = {
    done: Boolean(response.progress?.completed_at),
    position: response.progress?.position || 0,
    note: response.note || '',
    saved: Boolean(response.bookmarked)
  };
  apiLoadedLessons.add(id);
}
function applyApiRoutine(response: ApiRoutine) {
  for (const plan of response.plans)
    state.routinePlans[plan.date] = {
      goal: plan.goal,
      minutes: plan.minutes,
      custom: Boolean(plan.custom),
      tasks: []
    };
  const dates = new Set(response.data.map((task) => task.date));
  for (const date of dates) {
    state.routinePlans[date] ||= {
      goal: 0,
      minutes: 0,
      tasks: []
    };
    state.routinePlans[date].tasks = [];
  }
  for (const task of response.data) {
    const id = task.client_id || String(task.id);
    const key = taskKey(task.date, id);
    apiTaskIds.set(key, task.id);
    state.routinePlans[task.date].tasks.push({
      id,
      title: task.title,
      kind: task.kind === 'subject' ? String(apiSubjectIndexes.get(task.subject_id)) : task.kind,
      questions: task.questions,
      minutes: task.minutes
    });
    state.completedTasks[key] = Boolean(task.completed_at);
  }
}
async function loadApiRoutineMonth(month: string) {
  if (apiLoadedRoutineMonths.has(month))
    return;
  const last = new Date(Number(month.slice(0, 4)), Number(month.slice(5)), 0).getDate();
  const response = await apiRequest<ApiRoutine>(`/routine?from=${month}-01&to=${month}-${last}`);
  applyApiRoutine(response);
  apiLoadedRoutineMonths.add(month);
}
async function loadApiAffairs(month: string) {
  const rows = await apiPages<ApiAffair>(`/current-affairs?month=${encodeURIComponent(month)}&solutions=1`);
  demoAffairs.splice(0, demoAffairs.length, ...rows.map((row) => {
    apiAffairQuestionIds.set(String(row.id), row.questions.map((item) => apiQuestionIndexes.get(item.id)).filter((id) => id !== undefined));
    const question = row.questions[0];
    return {
      id: String(row.id),
      month,
      date: row.publication_date,
      title: row.title,
      text: row.body,
      source: row.source,
      question: question?.text || '',
      options: question?.options.map((option) => option.text) || [],
      answer: question?.options.find((option) => option.is_correct)?.position ?? -1,
      questionId: question ? apiQuestionIndexes.get(question.id) : undefined
    };
  }));
  apiAffairHeadlines = rows.map((row) => ({
    title: row.title,
    meta: [row.publication_date, row.category].filter(Boolean).join(' · ')
  }));
}
function apiAnswer(row: ApiActivity): Attempt {
  const id = apiQuestionIndexes.get(row.question_id) ?? -row.question_id;
  if (!questions[id]) {
    // Historical-only entries are not part of the catalogue array or practice pools.
    questions[id] = {
      id,
      serverId: row.question_id,
      subject: apiSubjectIndexes.get(row.subject_id) ?? 0,
      chapter: apiChapterIndexes.get(row.chapter_id)?.chapter ?? 0,
      topic: '',
      text: 'Unavailable question',
      options: [],
      answer: -1,
      explanation: ''
    };
  }
  return {
    id,
    choice: row.selected_option,
    correct: Boolean(row.is_correct),
    guess: Boolean(row.guess),
    at: apiTime(row.at),
    day: row.day
  };
}
async function loadApiProgress() {
  const [activity, history, reviews, reading, reports] = await Promise.all([
    apiPages<ApiActivity>('/activity'), apiPages<ApiAttempt>('/attempts'),
    apiPages<{
      id: number;
      bookmarked_at: string | null;
      due_at: string | null;
      level: number;
    }>('/revision?type=questions'),
    apiPages<{
      id: number;
      note: string | null;
      completed_at: string | null;
      bookmarked_at: string | null;
    }>('/revision?type=lessons'),
    apiPages<{
      question_id: number;
      type: string;
      detail: string;
      created_at: string;
    }>('/reports'),
  ]);
  state.attempts = activity.slice().reverse().map(apiAnswer);
  state.saved = [];
  state.reviews = {};
  for (const review of reviews) {
    const id = apiQuestionIndexes.get(review.id);
    if (id === undefined)
      continue;
    if (review.bookmarked_at)
      state.saved.push(id);
    if (review.due_at)
      state.reviews[id] = {
        due: apiTime(review.due_at),
        level: review.level
      };
  }
  for (const row of reading) {
    const id = [...apiLessonIds].find(([, serverId]) => serverId === row.id)?.[0];
    if (id)
      state.reading[id] = {
        ...state.reading[id],
        done: Boolean(row.completed_at),
        saved: Boolean(row.bookmarked_at),
        note: row.note || ''
      };
  }
  state.reports = reports.map((row) => ({
    id: apiQuestionIndexes.get(row.question_id) ?? -row.question_id,
    type: row.type,
    detail: row.detail,
    at: apiTime(row.created_at)
  }));
  state.history = history.filter((row) => row.status === 'submitted').reverse().map((row) => {
    const answers = activity.filter((item) => item.attempt_id === row.id).reverse().map(apiAnswer);
    return {
      serverId: row.id,
      serverScore: Number(row.score),
      ids: answers.map((answer) => answer.id),
      title: row.title,
      mode: row.mode,
      answers,
      startedAt: apiTime(row.started_at),
      endedAt: apiTime(row.submitted_at),
      rules: {
        marks: Number(row.correct_marks),
        penalty: Number(row.wrong_penalty)
      }
    };
  });
  state.lastResult = state.history.at(-1);
  const active = history.find((row) => row.status === 'active');
  state.session = active ? mapApiAttempt(await apiRequest<ApiAttemptView>(`/attempts/${active.id}`)) : null;
  if (active && state.session?.endedAt) {
    // Reading an expired attempt submits it; refresh its newly created history.
    await loadApiProgress();
  }
}
function mapApiAttempt(response: ApiAttemptView): StudySession {
  const row = response.data;
  const snapshots: Record<number, Question> = {};
  const itemIds: Record<number, number> = {};
  const answers: Attempt[] = [];
  const ids = response.items.map((item) => {
    const id = apiQuestionIndexes.get(item.question_id) ?? -item.question_id;
    const base = questions[id];
    const question: Question = {
      ...base,
      id,
      serverId: item.question_id,
      subject: apiSubjectIndexes.get(item.subject_id) ?? 0,
      chapter: base?.chapter ?? 0,
      topic: base?.topic || '',
      text: item.text,
      options: item.options,
      answer: item.correct_option ?? -1,
      explanation: item.explanation || '',
      source: item.source,
      demo: Boolean(item.is_demo),
      verified: Boolean(item.verified)
    };
    snapshots[id] = question;
    if (!base)
      questions[id] = question;
    itemIds[id] = item.id;
    if (item.answered_at || row.status === 'submitted') {
      const at = apiTime(item.answered_at || row.submitted_at);
      answers.push({
        id,
        choice: item.selected_option,
        correct: Boolean(item.is_correct),
        guess: Boolean(item.guess),
        at,
        day: dayKey(new Date(at))
      });
    }
    return id;
  });
  return {
    serverId: row.id,
    serverScore: row.score === null ? undefined : Number(row.score),
    ids,
    title: row.title,
    mode: row.mode,
    snapshots,
    itemIds,
    answers,
    index: row.current_index,
    page: row.current_page,
    startedAt: apiTime(row.started_at),
    deadline: row.expires_at ? Date.now() + apiTime(row.expires_at) - apiTime(response.server_time) : undefined,
    endedAt: row.submitted_at ? apiTime(row.submitted_at) : undefined,
    paperId: row.paper_id ? String(row.paper_id) : undefined,
    routineTask: [...apiTaskIds].find(([, id]) => id === row.routine_task_id)?.[0],
    rules: {
      marks: Number(row.correct_marks),
      penalty: Number(row.wrong_penalty)
    }
  };
}
async function initializeApi() {
  apiStatus('Loading your study data…');
  try {
    const profile = await apiRequest<{
      data: {
        name: string;
      };
      preferences: ApiPreferences | null;
    }>('/me');
    await loadApiCatalogue();
    applyApiProfile(profile);
    affairsMonth = new Date().toISOString().slice(0, 7);
    await Promise.all([loadApiRoutineMonth(dayKey().slice(0, 7)), loadApiAffairs(affairsMonth)]);
    await loadApiProgress();
    apiNotices = await apiPages<{
      title: string;
      meta: string;
    }>('/notices');
    activeLesson = state.lastLesson || lessons[0]?.id;
    selectedPaper = state.selectedPaper || demoPapers[0]?.id;
    if (page === 'lesson' && activeLesson)
      await loadApiLesson(activeLesson);
    if (page === 'paper' && selectedPaper)
      await loadApiPaper(selectedPaper);
    if (page === 'result' && state.lastResult?.serverId) {
      const result = await apiRequest<ApiAttemptView>(`/attempts/${state.lastResult.serverId}`);
      state.lastResult = mapApiAttempt(result) as CompletedSession;
    }
    apiReady = true;
    apiStatus('');
  }
  catch (error) {
    apiStatus(`${error.message} Reload to try again. Preview only; changes are not saved.`);
  }
  render();
}
async function loadApiPaper(id: string) {
  const ids: number[] = [];
  let current = 1;
  let last = 1;
  do {
    const response = await apiRequest<{
      questions: ApiPage<ApiQuestion>;
    }>(`/papers/${id}?solutions=1&per_page=50&page=${current}`);
    for (const question of response.questions.data) {
      const index = apiQuestionIndexes.get(question.id);
      if (index !== undefined)
        ids.push(index);
    }
    last = response.questions.last_page;
    current++;
  } while (current <= last);
  const paper = demoPapers.find((item) => item.id === id);
  if (paper)
    paper.questionIds = ids;
}
async function loadApiRoutineWeek(date: string) {
  const first = weekStart(date);
  const last = dateShift(first, 6);
  await loadApiRoutineMonth(first.slice(0, 7));
  await loadApiRoutineMonth(last.slice(0, 7));
}
