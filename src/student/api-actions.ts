interface ApiStartOptions {
  paperId?: string;
  routineKey?: string;
  chapterId?: number;
}
let pendingApiStart: {
  key: string;
  requestId: string;
} | null = null;
function apiProfilePayload(next: StudentState = state) {
  return {
    name: next.profile.name,
    exam_id: apiExamIds.get(next.profile.exam) ?? null,
    daily_minutes: next.profile.minutes,
    daily_questions: next.profile.dailyGoal || goal(),
    target_date: next.profile.date || null,
    theme: next.preferences.theme,
    theme_chosen: Boolean(next.preferences.themeChosen),
    font_size: next.preferences.fontSize,
    low_data: next.preferences.lowData,
    reminder: next.preferences.reminder,
    reminder_time: next.preferences.reminderTime,
    streak_alert: next.preferences.streakAlert,
    timezone: apiTimezone,
    focus_subject_ids: (next.profile.focus || []).map((id) => subjects[id]?.serverId).filter(Boolean),
    reader_size: next.readerSize,
    last_lesson_id: apiLessonIds.get(next.lastLesson) ?? null,
    selected_paper_id: next.selectedPaper ? Number(next.selectedPaper) : null,
  };
}
async function saveApiProfile(next: StudentState): Promise<boolean> {
  return apiWrite(async () => {
    await apiRequest('/me', 'PUT', apiProfilePayload(next));
    state.profile = next.profile;
    state.preferences = next.preferences;
    state.readerSize = next.readerSize;
    state.lastLesson = next.lastLesson;
    state.selectedPaper = next.selectedPaper;
  });
}
async function saveApiPlan(date: string, plan: RoutinePlan, completed = state.completedTasks): Promise<boolean> {
  const tasks = plan.tasks.map((task) => ({
    client_id: task.id,
    title: task.title,
    minutes: task.minutes,
    questions: task.questions,
    kind: ['review', 'mixed'].includes(task.kind) ? task.kind : 'subject',
    subject_id: ['review', 'mixed'].includes(task.kind) ? null : subjects[Number(task.kind)]?.serverId,
    completed: Boolean(completed[taskKey(date, task.id)]),
  }));
  return apiWrite(async () => {
    const response = await apiRequest<{
      data: ApiPlan;
      tasks: ApiTask[];
    }>('/routine-plan', 'PUT', {
      date,
      goal: plan.goal,
      minutes: plan.minutes,
      custom: Boolean(plan.custom),
      tasks,
    });
    applyApiRoutine({
      plans: [response.data],
      data: response.tasks
    });
  });
}
async function startApiSession(ids: number[], title: string, mode: string, options: ApiStartOptions = {}): Promise<boolean> {
  if (!apiReady) {
    toast('Your study account is not connected yet.');
    return false;
  }
  if (state.session) {
    navigate('practice');
    toast('Finish your current session first.');
    return false;
  }
  if (!ids.length && !options.paperId) {
    toast('No questions available.');
    return false;
  }
  if (mode === 'exam' && !options.paperId) {
    toast('This test’s timer and marking options do not match the server yet.');
    return false;
  }
  if (!options.paperId && ids.length > 100) {
    toast('The server accepts up to 100 questions per practice session. Use Custom practice to choose fewer.');
    return false;
  }
  if (options.routineKey && !apiTaskIds.has(options.routineKey)) {
    const date = options.routineKey.slice(0, 10);
    if (!await saveApiPlan(date, planFor(date)))
      return false;
  }
  return apiWrite(async () => {
    const payload = {
      mode,
      title,
      ...(options.paperId ? { paper_id: Number(options.paperId) } : { question_ids: ids.map((id) => questions[id]?.serverId) }),
      ...(options.routineKey ? { routine_task_id: apiTaskIds.get(options.routineKey) } : {}),
    };
    const key = JSON.stringify(payload);
    if (pendingApiStart?.key !== key)
      pendingApiStart = {
        key,
        requestId: crypto.randomUUID()
      };
    const response = await apiRequest<ApiAttemptView>('/attempts', 'POST', {
      ...payload,
      request_id: pendingApiStart.requestId
    });
    state.session = mapApiAttempt(response);
    pendingApiStart = null;
    navigate('practice');
  });
}
async function answerApiQuestion(id: number, choice: number | null) {
  const session = state.session;
  if (!session?.serverId)
    return;
  await apiWrite(async () => {
    const response = await apiRequest<ApiAttemptView>(`/attempts/${session.serverId}/answers`, 'PUT', {
      answers: [{
          item_id: session.itemIds[id],
          choice,
          guess
        }],
    });
    const updated = mapApiAttempt(response);
    const answers = Array.isArray(session.answers) ? session.answers : Object.values(session.answers);
    session.answers = [...answers.filter((answer) => answer.id !== id), ...(updated.answers as Attempt[])];
    Object.assign(session.snapshots, updated.snapshots);
    render();
  });
}
async function finishApiSession() {
  const session = state.session;
  if (!session?.serverId)
    return;
  await apiWrite(async () => {
    const response = await apiRequest<ApiAttemptView>(`/attempts/${session.serverId}/submit`, 'POST', {});
    const result = mapApiAttempt(response) as CompletedSession;
    state.session = null;
    state.lastResult = result;
    state.history = [...state.history.filter((item) => item.serverId !== result.serverId), result];
    if (session.routineTask)
      state.completedTasks[session.routineTask] = true;
    navigate('result');
    try {
      await loadApiProgress();
      state.lastResult = result;
      render();
    }
    catch (error) {
      toast('Your result was saved. Reload to refresh progress.');
    }
  });
}
async function saveApiPosition(nextPage = state.session?.page || 0, nextIndex = state.session?.index || 0): Promise<boolean> {
  const session = state.session;
  if (!session?.serverId)
    return false;
  return apiWrite(async () => {
    await apiRequest(`/attempts/${session.serverId}/progress`, 'PUT', {
      current_index: nextIndex,
      current_page: nextPage
    });
    session.page = nextPage;
    session.index = nextIndex;
  });
}
async function bookmarkApiQuestion(id: number) {
  const saved = !state.saved.includes(id);
  await apiWrite(async () => {
    await apiRequest(`/questions/${questions[id].serverId}/bookmark`, 'PUT', { saved });
    state.saved = saved ? [...state.saved, id] : state.saved.filter((item) => item !== id);
    render();
    toast(saved ? 'Question bookmarked' : 'Bookmark removed');
  });
}
async function saveApiReading(id: string, key: 'done' | 'saved', value: boolean) {
  const serverId = apiLessonIds.get(id);
  if (!serverId)
    return;
  await apiWrite(async () => {
    if (key === 'saved')
      await apiRequest(`/lessons/${serverId}/bookmark`, 'PUT', { saved: value });
    else
      await apiRequest(`/lessons/${serverId}/progress`, 'PUT', {
        position: Math.round(state.reading[id]?.position || 0),
        completed: value
      });
    state.reading[id] = {
      ...state.reading[id],
      [key]: value
    };
    render();
  });
}
const apiNoteDrafts = new Map<string, string>();
const apiNoteTimers = new Map<string, ReturnType<typeof setTimeout>>();
const apiReadingWrites = new Map<string, Promise<void>>();
function saveApiNote(id: string, text: string) {
  apiNoteDrafts.set(id, text);
  clearTimeout(apiNoteTimers.get(id));
  const status = document.getElementById('note-status');
  if (status)
    status.textContent = 'Saving…';
  apiNoteTimers.set(id, setTimeout(() => {
    const previous = apiReadingWrites.get(id) || Promise.resolve();
    const write = previous.catch(() => { }).then(async () => {
      await apiRequest(`/lessons/${apiLessonIds.get(id)}/note`, 'PUT', { body: text });
      state.reading[id] = {
        ...state.reading[id],
        note: text
      };
      if (apiNoteDrafts.get(id) === text) apiNoteDrafts.delete(id);
      if (page === 'lesson' && activeLesson === id && $('#lesson-note')?.value === text) {
        $('#note-status').textContent = 'Saved.';
      }
    });
    apiReadingWrites.set(id, write);
    write.catch((error) => {
      if (page === 'lesson' && activeLesson === id)
        $('#note-status').textContent = 'Not saved. Edit the note to retry.';
      apiFailure(error);
    });
  }, 500));
}
async function saveApiReadingPosition(id: string, position: number) {
  if (!apiReady || !apiLessonIds.has(id))
    return;
  const previous = apiReadingWrites.get(id) || Promise.resolve();
  const write = previous.catch(() => { }).then(async () => {
    await apiRequest(`/lessons/${apiLessonIds.get(id)}/progress`, 'PUT', {
      position: Math.round(position),
      completed: Boolean(state.reading[id]?.done)
    });
    state.reading[id] = {
      ...state.reading[id],
      position
    };
  });
  apiReadingWrites.set(id, write);
  try {
    await write;
  }
  catch (error) {
    apiFailure(error);
  }
}
async function showApiResult(session: CompletedSession) {
  try {
    const response = await apiRequest<ApiAttemptView>(`/attempts/${session.serverId}`);
    state.lastResult = mapApiAttempt(response) as CompletedSession;
    navigate('result');
  }
  catch (error) {
    apiFailure(error);
  }
}
if (apiEnabled) {
  window.addEventListener('beforeunload', (event) => {
    if (apiNoteDrafts.size) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
  // Keep the existing controls visible. Unavailable contracts cannot mutate preview data.
  document.addEventListener('submit', (event) => {
    if (!apiReady) {
      event.preventDefault();
      event.stopImmediatePropagation();
      toast('Your study account is not connected yet.');
    }
  }, true);
  document.addEventListener('click', (event) => {
    const action = (event.target as Element).closest<HTMLElement>('[data-action]')?.dataset.action;
    const unavailable = ['confirm-restore', 'enable-offline'];
    if (unavailable.includes(action)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      toast(action === 'confirm-restore' ? 'Cloud backup restore is not supported by the API yet.' : 'Offline API practice is not supported yet.');
    }
  }, true);
  void initializeApi();
}
