'use client';

import { useEffect, useState } from 'react';
import { ApiError, message, request, type Row } from './api';
import { formPayload, savePath, type Resource } from './resources';
import Lookup from './Lookup';

export default function Editor({
  resource,
  initial,
  onSaved,
  onCancel,
  onFailure,
}: {
  resource: Resource;
  initial: Row;
  onSaved: () => void;
  onCancel: () => void;
  onFailure: (error: unknown) => void;
}) {
  const [values, setValues] = useState<Row>(() => {
    const record = structuredClone(initial);
    if (record.publication_at) {
      const raw = String(record.publication_at).replace(' ', 'T');
      const date = new Date(
        /[zZ]|[+-]\d{2}:?\d{2}$/.test(raw) ? raw : `${raw}Z`,
      );
      record.publication_at = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16);
    }
    return record;
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!dirty && !pending) return;
    const preventLoss = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', preventLoss);
    return () => window.removeEventListener('beforeunload', preventLoss);
  }, [dirty, pending]);
  const update = (name: string, value: unknown) => {
    setDirty(true);
    setValues((current) => ({ ...current, [name]: value }));
  };
  const sections = (values.sections || []) as Row[];
  const options = (values.options || []) as Row[];
  const questionIds = (values.question_ids || []) as number[];
  const [questionChoice, setQuestionChoice] = useState<number | null>(null);

  function move<T>(items: T[], index: number, direction: number) {
    const next = [...items];
    [next[index], next[index + direction]] = [
      next[index + direction],
      next[index],
    ];
    return next;
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setError('');
    setErrors({});
    setPending(true);
    try {
      await request(
        savePath(resource, initial.id),
        initial.id ? 'PUT' : 'POST',
        formPayload(resource, values),
      );
      onSaved();
    } catch (failure) {
      setError(message(failure));
      if (failure instanceof ApiError) setErrors(failure.errors);
      onFailure(failure);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="admin-card">
      <h2>
        {initial.id
          ? `Edit ${resource.singular.toLowerCase()} #${initial.id}`
          : `New ${resource.singular.toLowerCase()}`}
      </h2>
      <p className="fine">Fields marked * are required.</p>
      <form onSubmit={save}>
        <fieldset disabled={pending}>
          <div className="admin-fields">
            {resource.fields.map((field) => {
              if (field.lookup)
                return (
                  <Lookup
                    key={field.name}
                    resourceKey={field.lookup}
                    value={values[field.name]}
                    label={field.label}
                    required={field.required}
                    onChange={(id) => update(field.name, id)}
                    onFailure={onFailure}
                  />
                );
              if (field.type === 'checkbox')
                return (
                  <label key={field.name} className="admin-check">
                    <input
                      type="checkbox"
                      checked={Boolean(values[field.name])}
                      onChange={(event) =>
                        update(field.name, event.target.checked)
                      }
                    />
                    {field.label}
                  </label>
                );
              return (
                <label key={field.name}>
                  {field.label}
                  {field.required ? ' *' : ''}
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={4}
                      required={field.required}
                      maxLength={field.max}
                      value={String(values[field.name] ?? '')}
                      onChange={(event) =>
                        update(field.name, event.target.value)
                      }
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      required={field.required}
                      min={field.min}
                      max={field.type === 'number' ? field.max : undefined}
                      maxLength={
                        field.type !== 'number' ? field.max : undefined
                      }
                      step={field.step}
                      value={String(values[field.name] ?? '')}
                      onChange={(event) =>
                        update(field.name, event.target.value)
                      }
                    />
                  )}
                  {field.help && <small className="fine">{field.help}</small>}
                </label>
              );
            })}
          </div>
          {['questions', 'papers'].includes(resource.key) && (
            <p className="fine">
              Real content must be verified before publication. Demo content
              cannot be marked verified.
            </p>
          )}

          {resource.key === 'lessons' && (
            <section className="admin-nested">
              <h3>Lesson sections</h3>
              {sections.map((section, index) => (
                <div className="admin-subcard" key={index}>
                  <h4>Section {index + 1}</h4>
                  <label>
                    Title *
                    <input
                      required
                      maxLength={200}
                      value={String(section.title || '')}
                      onChange={(event) =>
                        update(
                          'sections',
                          sections.map((item, position) =>
                            position === index
                              ? { ...item, title: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label>
                    Kind *
                    <select
                      value={String(section.kind)}
                      onChange={(event) =>
                        update(
                          'sections',
                          sections.map((item, position) =>
                            position === index
                              ? { ...item, kind: event.target.value }
                              : item,
                          ),
                        )
                      }
                    >
                      {[
                        'explanation',
                        'example',
                        'formula',
                        'important',
                        'mistake',
                      ].map((kind) => (
                        <option key={kind}>{kind}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Body *
                    <textarea
                      required
                      rows={5}
                      maxLength={20000}
                      value={String(section.body || '')}
                      onChange={(event) =>
                        update(
                          'sections',
                          sections.map((item, position) =>
                            position === index
                              ? { ...item, body: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <Lookup
                    resourceKey="media"
                    value={section.media_file_id}
                    label="Media attachment (published only)"
                    onChange={(id) =>
                      update(
                        'sections',
                        sections.map((item, position) =>
                          position === index
                            ? { ...item, media_file_id: id }
                            : item,
                        ),
                      )
                    }
                    onFailure={onFailure}
                  />
                  <div className="admin-actions">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() =>
                        update('sections', move(sections, index, -1))
                      }
                    >
                      Move up
                    </button>
                    <button
                      type="button"
                      disabled={index === sections.length - 1}
                      onClick={() =>
                        update('sections', move(sections, index, 1))
                      }
                    >
                      Move down
                    </button>
                    <button
                      type="button"
                      disabled={sections.length <= 1}
                      onClick={() =>
                        update(
                          'sections',
                          sections.filter((_, position) => position !== index),
                        )
                      }
                    >
                      Remove section
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                disabled={sections.length >= 50}
                onClick={() =>
                  update('sections', [
                    ...sections,
                    {
                      title: '',
                      kind: 'explanation',
                      body: '',
                      media_file_id: null,
                    },
                  ])
                }
              >
                Add section
              </button>
            </section>
          )}

          {resource.key === 'questions' && (
            <section className="admin-nested">
              <h3>Answer options</h3>
              <p className="fine">Select exactly one correct answer.</p>
              {options.map((option, index) => (
                <div className="admin-subcard" key={index}>
                  <label>
                    Option {index + 1} *
                    <textarea
                      required
                      maxLength={2000}
                      rows={2}
                      value={String(option.text || '')}
                      onChange={(event) =>
                        update(
                          'options',
                          options.map((item, position) =>
                            position === index
                              ? { ...item, text: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <div className="admin-actions">
                    <label className="admin-check">
                      <input
                        type="radio"
                        name="correct-option"
                        required
                        checked={Boolean(option.is_correct)}
                        onChange={() =>
                          update(
                            'options',
                            options.map((item, position) => ({
                              ...item,
                              is_correct: position === index,
                            })),
                          )
                        }
                      />
                      Correct answer
                    </label>
                    <button
                      type="button"
                      disabled={options.length <= 2}
                      onClick={() =>
                        update(
                          'options',
                          options.filter((_, position) => position !== index),
                        )
                      }
                    >
                      Remove option
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                disabled={options.length >= 10}
                onClick={() =>
                  update('options', [
                    ...options,
                    { text: '', is_correct: false },
                  ])
                }
              >
                Add option
              </button>
            </section>
          )}

          {['papers', 'current_affairs'].includes(resource.key) && (
            <section className="admin-nested">
              <h3>Linked questions ({questionIds.length})</h3>
              <p className="fine">
                {resource.key === 'papers'
                  ? 'Questions appear in this order. Publish every linked question before publishing the paper.'
                  : 'Link up to 50 published questions.'}
              </p>
              {questionIds.map((id, index) => (
                <div className="admin-linked" key={id}>
                  <span>
                    {index + 1}. Question #{id}
                  </span>
                  <div className="admin-actions">
                    <button
                      type="button"
                      aria-label={`Move question ${id} up`}
                      disabled={index === 0}
                      onClick={() =>
                        update('question_ids', move(questionIds, index, -1))
                      }
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={`Move question ${id} down`}
                      disabled={index === questionIds.length - 1}
                      onClick={() =>
                        update('question_ids', move(questionIds, index, 1))
                      }
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        update(
                          'question_ids',
                          questionIds.filter((question) => question !== id),
                        )
                      }
                    >
                      Remove #{id}
                    </button>
                  </div>
                </div>
              ))}
              <Lookup
                resourceKey="questions"
                value={questionChoice}
                label="Choose question"
                onChange={setQuestionChoice}
                onFailure={onFailure}
              />
              <button
                type="button"
                disabled={
                  !questionChoice ||
                  questionIds.includes(questionChoice) ||
                  questionIds.length >= (resource.key === 'papers' ? 500 : 50)
                }
                onClick={() => {
                  update('question_ids', [...questionIds, questionChoice]);
                  setQuestionChoice(null);
                }}
              >
                Add question
              </button>
            </section>
          )}
        </fieldset>
        {error && (
          <div className="admin-error" role="alert">
            <p>{error}</p>
            {Object.entries(errors).map(([field, details]) => (
              <p key={field}>
                <strong>{field}:</strong> {details.join(' ')}
              </p>
            ))}
          </div>
        )}
        <div className="admin-actions admin-form-footer">
          <button className="primary" disabled={pending}>
            {pending ? 'Saving…' : 'Save changes'}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!dirty || window.confirm('Discard unsaved changes?'))
                onCancel();
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
