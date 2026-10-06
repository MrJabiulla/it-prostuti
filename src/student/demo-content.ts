// Deliberately synthetic fixtures for local UI testing; never historical papers.
const demoExams = [
  {
    name: 'BCS Preliminary',
    institute: 'bpsc',
    post: 'Demo general cadre',
    subjects: [0, 1, 2, 3],
  },
  {
    name: 'Bank',
    institute: 'bank',
    post: 'Demo officer',
    subjects: [0, 1, 2],
  },
  {
    name: 'Primary',
    institute: 'primary',
    post: 'Demo assistant teacher',
    subjects: [0, 1, 2, 3],
  },
  {
    name: 'NTRCA',
    institute: 'ntrc',
    post: 'Demo teacher',
    subjects: [0, 1, 3],
  },
];
const demoPapers = demoExams.flatMap((exam, examIndex) =>
  [2024, 2025].map((year) => ({
    id: `demo-${exam.institute}-${year}`,
    title: `${exam.name} · ${year} · Demo paper`,
    exam: exam.name,
    institute: exam.institute,
    post: exam.post,
    year,
    stage: 'Demo preliminary',
    source: 'Synthetic local fixture, adapted from the existing practice set',
    verified: false,
    demo: true,
    rules: {
      minutes: 8 + examIndex * 2,
      marks: 1,
      penalty: examIndex % 2 ? 0.25 : 0.5,
    },
    questionIds: [],
  })),
);
const originalQuestions = questions.slice();
for (const paper of demoPapers) {
  const exam = demoExams.find((item) => item.name === paper.exam);
  const pool = originalQuestions
    .filter((question) => exam.subjects.includes(question.subject))
    .slice(paper.year === 2024 ? 0 : 2, paper.year === 2024 ? 6 : 8);
  for (const question of pool) {
    const id = questions.length;
    questions.push({
      ...question,
      id,
      paperId: paper.id,
      exam: paper.exam,
      institute: paper.institute,
      post: paper.post,
      year: paper.year,
      stage: paper.stage,
      source: paper.source,
      verified: false,
      demo: true,
    });
    paper.questionIds.push(id);
  }
}
for (const question of originalQuestions) {
  question.source = 'Existing local practice set';
  question.verified = false;
}
const demoAffairs: Affair[] = [
  {
    id: 'demo-affairs-1',
    month: '2026-10',
    date: '2026-10-01',
    title: 'Demo: a new public learning programme',
    text: 'This fictional programme offers free weekly study sessions. This article demonstrates dated reading material and an associated quiz; it does not describe a real announcement.',
    source: 'Synthetic local demo',
    question:
      'In this fictional programme, how often are the study sessions held?',
    options: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
    answer: 1,
  },
  {
    id: 'demo-affairs-2',
    month: '2026-09',
    date: '2026-09-01',
    title: 'Demo: a digital reading initiative',
    text: 'In this fictional initiative, learners can save reading notes offline. This is sample content for testing the monthly archive, not a real news report.',
    source: 'Synthetic local demo',
    question: 'What can learners save in this fictional initiative?',
    options: [
      'Reading notes',
      'Travel tickets',
      'Bank cards',
      'Exam certificates',
    ],
    answer: 0,
  },
];
for (const article of demoAffairs) {
  article.questionId = questions.length;
  questions.push({
    id: article.questionId,
    subject: 3,
    chapter: 2,
    topic: 'Demo current affairs',
    text: article.question,
    options: article.options,
    answer: article.answer,
    explanation: article.text,
    source: article.source,
    verified: false,
    demo: true,
    affairId: article.id,
  });
}

// Every topic can exercise the reading flow. Existing notes are kept intact.
const demoLessons: Record<string, LessonNote> = {};
subjects.forEach((subject, subjectIndex) => {
  subject.chapters.forEach((chapter, chapterIndex) => {
    chapter.topics.forEach((topic) => {
      const existing = topicNotes[topic.name];
      const example = originalQuestions.find(
        (question) =>
          question.subject === subjectIndex &&
          question.chapter === chapterIndex &&
          question.topic === topic.name,
      );
      demoLessons[topic.name] = {
        readTime: existing?.readTime || '3 min read',
        summary:
          existing?.summary ||
          `Demo lesson for ${topic.name}. This sample demonstrates the reading flow; a reviewed lesson has not yet been supplied.`,
        demo: !existing,
        points: [
          ...(existing?.points || [
            {
              label: 'Learning objective · Demo',
              desc: `Identify the core ideas of ${topic.name}, explain them in your own words, and apply them to a practice question.`,
            },
          ]),
          {
            label: 'Worked example',
            desc: example
              ? `${example.text}\nAnswer: ${example.options[example.answer]}\n${example.explanation}`
              : `Demo exercise: write down one concept you already know about ${topic.name}. Explain it in one sentence, then compare it with your textbook. A subject-specific worked example is pending.`,
          },
          {
            label: 'Important points',
            desc: 'Read each definition carefully. Record the condition under which a rule applies and keep any exception beside it in your personal note.',
          },
          {
            label: 'Common mistake',
            desc: 'Do not treat a single example as a rule for every question. Check the wording, units and conditions before choosing an answer.',
          },
          {
            label: 'Quick revision',
            desc: 'Close the lesson and recall its main points. Reopen the sections you could not explain, then attempt the related practice.',
          },
        ],
      };
    });
  });
});

const studyFormulas = [
  {
    topic: 'শতকরা',
    text: 'Percentage = (part ÷ whole) × 100. Example: 15 out of 60 = 25%.',
  },
  {
    topic: 'গড় ও অনুপাত',
    text: 'Arithmetic mean = sum of values ÷ number of values. Example: mean of 2, 4 and 6 = 4.',
  },
  {
    topic: 'বীজগণিত',
    text: '(a + b)² = a² + 2ab + b². Example: (2 + 3)² = 4 + 12 + 9 = 25.',
  },
  {
    topic: 'সূচক ও লগারিদম',
    text: 'For a positive base a, aᵐ × aⁿ = aᵐ⁺ⁿ. Example: 2² × 2³ = 2⁵ = 32.',
  },
  {
    topic: 'পরিমিতি ও বৃত্ত',
    text: 'Circle area = πr²; circumference = 2πr, where r is the radius.',
  },
];
for (const formula of studyFormulas) {
  demoLessons[formula.topic].points.push({
    label: 'Formula & example',
    desc: formula.text,
  });
}
