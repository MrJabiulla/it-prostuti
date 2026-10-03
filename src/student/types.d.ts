// Shared browser-script types. Storage keys and persisted shapes stay unchanged.
interface Subject {
  serverId?: number;
  name: string;
  bengali: string;
  short: string;
  symbol: string;
  color: string;
  chapters: {
    id: string;
    title: string;
    english: string;
    topics: { name: string; english: string }[];
  }[];
  topics?: string[];
}
type QuestionRow = [number, number, string, string, string[], number, string];
interface Question {
  id: number;
  serverId?: number;
  subject: number;
  chapter: number;
  topic: string;
  text: string;
  options: string[];
  answer: number;
  explanation: string;
  paperId?: string;
  exam?: string;
  institute?: string;
  post?: string;
  year?: number;
  stage?: string;
  source?: string;
  verified?: boolean;
  demo?: boolean;
  affairId?: string;
}
interface Attempt {
  id: number;
  choice: number | null;
  correct: boolean;
  guess: boolean;
  at: number;
  day: string;
}
interface StudySession {
  serverId?: string;
  serverScore?: number;
  snapshots?: Record<number, Question>;
  itemIds?: Record<number, number>;
  ids: number[];
  title: string;
  mode: string;
  index?: number;
  page?: number;
  answers: Record<number, Attempt> | Attempt[];
  startedAt: number;
  deadline?: number;
  endedAt?: number;
  routineTask?: string;
  paperId?: string;
  rules?: { marks: number; penalty: number };
}
interface CompletedSession extends StudySession {
  answers: Attempt[];
  endedAt: number;
}
interface ReadingProgress {
  done?: boolean;
  saved?: boolean;
  note?: string;
  position?: number;
}
interface RoutineTask {
  id: string;
  title: string;
  kind: string;
  questions: number;
  minutes: number;
}
interface RoutinePlan {
  goal: number;
  minutes: number;
  tasks: RoutineTask[];
  custom?: boolean;
}
interface StudentState {
  profile: {
    name: string;
    exam: string;
    minutes: number;
    date: string;
    focus?: number[];
    dailyGoal?: number;
  };
  attempts: Attempt[];
  saved: number[];
  reviews: Record<number, { due: number; level: number }>;
  reports: {
    id: number;
    type: FormDataEntryValue;
    detail: FormDataEntryValue;
    at: number;
  }[];
  session: StudySession | null;
  lastResult?: CompletedSession;
  history?: CompletedSession[];
  reading?: Record<string, ReadingProgress>;
  readerSize?: number;
  lastLesson?: string;
  selectedPaper?: string;
  preferences?: {
    theme: string;
    themeChosen?: boolean;
    fontSize: string;
    lowData: boolean;
    reminder: boolean;
    reminderTime: string;
    streakAlert: boolean;
  };
  routinePlans?: Record<string, RoutinePlan>;
  completedTasks?: Record<string, boolean>;
  lastReminder?: string;
}
interface WeakPoint {
  subjectId: number;
  subjectName: string;
  chapTitle: string;
  topicName: string;
  total: number;
  correct: number;
}
interface Affair {
  id: string;
  month: string;
  date: string;
  title: string;
  text: string;
  source: string;
  question: string;
  options: string[];
  answer: number;
  questionId?: number;
}
interface LessonNote {
  readTime: string;
  summary: string;
  demo: boolean;
  points: { label: string; desc: string }[];
}
interface Window {
  toastTimer?: number;
}
interface Document {
  modelContext?: {
    registerTool(tool: {
      name: string;
      description: string;
      inputSchema: {
        type: string;
        properties: Record<string, unknown>;
        additionalProperties: boolean;
      };
      annotations: { readOnlyHint: boolean };
      execute(input: unknown): {
        attempts: number;
        accuracy: number;
        due: number;
        today: number;
      };
    }): unknown;
  };
}
