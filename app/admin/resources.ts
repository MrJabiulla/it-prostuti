import type { Row } from './api';

export type Field = {
  name: string;
  label: string;
  type?:
    | 'text'
    | 'textarea'
    | 'number'
    | 'checkbox'
    | 'date'
    | 'datetime-local';
  required?: boolean;
  max?: number;
  min?: number;
  step?: string;
  lookup?: string;
  help?: string;
};
export type Resource = {
  key: string;
  label: string;
  singular: string;
  catalogue?: boolean;
  fields: Field[];
  defaults: Row;
};
const title: Field = {
  name: 'title',
  label: 'Title',
  required: true,
  max: 200,
};
const slug: Field = {
  name: 'slug',
  label: 'Slug',
  required: true,
  max: 100,
  help: 'Unique identifier using English letters, numbers, hyphens or underscores.',
};
const position: Field = {
  name: 'position',
  label: 'Position',
  type: 'number',
  required: true,
  min: 0,
  max: 10000,
};
const translations: Field[] = [
  { name: 'english', label: 'English name', max: 255 },
  { name: 'bengali', label: 'Bengali name', max: 255 },
  position,
];
const published: Field = {
  name: 'published',
  label: 'Published',
  type: 'checkbox',
};
const demo: Field = {
  name: 'is_demo',
  label: 'Demo content',
  type: 'checkbox',
};
const source: Field = {
  name: 'source',
  label: 'Source',
  type: 'textarea',
  required: true,
  max: 2000,
};
const verified: Field = {
  name: 'verified',
  label: 'Verified',
  type: 'checkbox',
};
const publication = [source, demo, verified, published];
const relation = (name: string, label: string, lookup: string): Field => ({
  name,
  label,
  lookup,
  required: true,
});
const draft = { published: false, is_demo: true, verified: false };

export const resources: Resource[] = [
  {
    key: 'subjects',
    label: 'Subjects',
    singular: 'Subject',
    catalogue: true,
    defaults: { position: 0 },
    fields: [
      title,
      slug,
      ...translations,
      { name: 'short', label: 'Short name', max: 80 },
      { name: 'symbol', label: 'Symbol', max: 40 },
      {
        name: 'color',
        label: 'Color',
        help: 'Hex color, for example #1f5f4a.',
      },
    ],
  },
  {
    key: 'chapters',
    label: 'Chapters',
    singular: 'Chapter',
    catalogue: true,
    defaults: { position: 0 },
    fields: [
      relation('subject_id', 'Subject', 'subjects'),
      title,
      ...translations,
      { name: 'overview', label: 'Overview', type: 'textarea', max: 4000 },
    ],
  },
  {
    key: 'topics',
    label: 'Topics',
    singular: 'Topic',
    catalogue: true,
    defaults: { position: 0 },
    fields: [
      relation('chapter_id', 'Chapter', 'chapters'),
      title,
      ...translations,
    ],
  },
  {
    key: 'lessons',
    label: 'Lessons',
    singular: 'Lesson',
    defaults: {
      ...draft,
      reading_minutes: 5,
      sections: [
        { title: '', kind: 'explanation', body: '', media_file_id: null },
      ],
    },
    fields: [
      relation('topic_id', 'Topic', 'topics'),
      {
        name: 'summary',
        label: 'Summary',
        type: 'textarea',
        required: true,
        max: 10000,
      },
      {
        name: 'reading_minutes',
        label: 'Reading minutes',
        type: 'number',
        required: true,
        min: 1,
        max: 240,
      },
      demo,
      published,
    ],
  },
  {
    key: 'questions',
    label: 'Questions',
    singular: 'Question',
    defaults: {
      ...draft,
      options: [
        { text: '', is_correct: true },
        { text: '', is_correct: false },
      ],
    },
    fields: [
      relation('topic_id', 'Topic', 'topics'),
      {
        name: 'text',
        label: 'Question',
        type: 'textarea',
        required: true,
        max: 10000,
      },
      {
        name: 'explanation',
        label: 'Explanation',
        type: 'textarea',
        required: true,
        max: 20000,
      },
      ...publication,
    ],
  },
  {
    key: 'exams',
    label: 'Exams & syllabus',
    singular: 'Exam',
    catalogue: true,
    defaults: {},
    fields: [title, slug],
  },
  {
    key: 'institutes',
    label: 'Institutes',
    singular: 'Institute',
    catalogue: true,
    defaults: {},
    fields: [title, slug],
  },
  {
    key: 'posts',
    label: 'Posts',
    singular: 'Post',
    catalogue: true,
    defaults: {},
    fields: [relation('institute_id', 'Institute', 'institutes'), title],
  },
  {
    key: 'papers',
    label: 'Papers',
    singular: 'Paper',
    defaults: {
      ...draft,
      year: new Date().getFullYear(),
      duration_minutes: 20,
      correct_marks: 1,
      wrong_penalty: 0,
      question_ids: [],
    },
    fields: [
      title,
      relation('exam_id', 'Exam', 'exams'),
      relation('post_id', 'Post', 'posts'),
      {
        name: 'year',
        label: 'Year',
        type: 'number',
        required: true,
        min: 1900,
        max: 2200,
      },
      { name: 'stage', label: 'Stage', required: true, max: 80 },
      {
        name: 'duration_minutes',
        label: 'Duration (minutes)',
        type: 'number',
        required: true,
        min: 1,
        max: 360,
      },
      {
        name: 'correct_marks',
        label: 'Marks per correct answer',
        type: 'number',
        required: true,
        min: 0.01,
        max: 100,
        step: '0.01',
      },
      {
        name: 'wrong_penalty',
        label: 'Wrong answer penalty',
        type: 'number',
        required: true,
        min: 0,
        max: 100,
        step: '0.01',
      },
      ...publication,
    ],
  },
  {
    key: 'current_affairs',
    label: 'Current affairs',
    singular: 'Current affair',
    defaults: { ...draft, question_ids: [] },
    fields: [
      title,
      {
        name: 'body',
        label: 'Body',
        type: 'textarea',
        required: true,
        max: 30000,
      },
      source,
      {
        name: 'publication_date',
        label: 'Publication date',
        type: 'date',
        required: true,
      },
      { name: 'category', label: 'Category', max: 100 },
      demo,
      published,
    ],
  },
  {
    key: 'notices',
    label: 'Notices',
    singular: 'Notice',
    defaults: { published: false },
    fields: [
      title,
      { name: 'meta', label: 'Subtitle', max: 255 },
      { name: 'body', label: 'Body', type: 'textarea', max: 10000 },
      {
        name: 'publication_at',
        label: 'Publication time',
        type: 'datetime-local',
        help: 'Your local time. Leave empty for no scheduled time.',
      },
      published,
    ],
  },
  { key: 'media', label: 'Media', singular: 'Media', defaults: {}, fields: [] },
];

export function listPath(resource: Resource) {
  if (resource.key === 'media') return '/admin/media';
  return `/admin/${resource.catalogue ? 'catalogue' : 'content'}/${resource.key}`;
}

export function savePath(resource: Resource, id?: number) {
  const base = resource.catalogue
    ? listPath(resource)
    : `/admin/${resource.key.replaceAll('_', '-')}`;
  return id ? `${base}/${id}` : base;
}

export function rowLabel(row: Row) {
  return String(
    row.title || row.text || row.name || row.summary || `#${row.id}`,
  );
}

export function formPayload(resource: Resource, values: Row): Row {
  const payload: Row = {};
  for (const field of resource.fields) {
    const value = values[field.name];
    if (field.type === 'checkbox') payload[field.name] = Boolean(value);
    else if (field.type === 'number' || field.lookup)
      payload[field.name] =
        value === '' || value == null ? null : Number(value);
    else if (field.type === 'datetime-local')
      payload[field.name] = value
        ? new Date(String(value)).toISOString()
        : null;
    else payload[field.name] = value || (field.required ? '' : null);
  }
  if (resource.key === 'lessons') payload.sections = values.sections;
  if (resource.key === 'questions') payload.options = values.options;
  if (resource.key === 'papers' || resource.key === 'current_affairs')
    payload.question_ids = values.question_ids;
  return payload;
}
