'use client';

import { useEffect, useState } from 'react';
import { message, request, type Row } from './api';
import Lookup from './Lookup';

type Subject = { subject_id: number | null; syllabus: string };

export default function Syllabus({
  exam,
  onSaved,
  onCancel,
  onFailure,
}: {
  exam: Row;
  onSaved: () => void;
  onCancel: () => void;
  onFailure: (error: unknown) => void;
}) {
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [revision, setRevision] = useState(0);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!dirty && !pending) return;
    const preventLoss = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', preventLoss);
    return () => window.removeEventListener('beforeunload', preventLoss);
  }, [dirty, pending]);

  useEffect(() => {
    let active = true;
    setError('');
    request<{ subjects: { id: number; syllabus: string }[] }>(
      `/exams/${exam.id}`,
    )
      .then((result) => {
        if (active)
          setSubjects(
            result.subjects.map((subject) => ({
              subject_id: subject.id,
              syllabus: subject.syllabus,
            })),
          );
      })
      .catch((failure) => {
        if (!active) return;
        setError(message(failure));
        onFailure(failure);
      });
    return () => {
      active = false;
    };
  }, [exam.id, revision, onFailure]);

  function change(next: Subject[]) {
    setDirty(true);
    setSubjects(next);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (pending || !subjects) return;
    if (
      new Set(subjects.map((subject) => subject.subject_id)).size !==
      subjects.length
    ) {
      setError('Each subject can appear only once.');
      return;
    }
    setPending(true);
    setError('');
    try {
      await request(`/admin/exams/${exam.id}/syllabus`, 'PUT', { subjects });
      onSaved();
    } catch (failure) {
      setError(message(failure));
      onFailure(failure);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="admin-card">
      <h2>Syllabus · {String(exam.title)}</h2>
      <p className="fine">
        Saving replaces this exam’s subject syllabus. Removing a row removes
        that subject from the syllabus.
      </p>
      {!subjects && !error && <p role="status">Loading syllabus…</p>}
      {error && (
        <p className="admin-error" role="alert">
          {error}{' '}
          {!subjects && (
            <button type="button" onClick={() => setRevision(revision + 1)}>
              Retry
            </button>
          )}
        </p>
      )}
      <form onSubmit={save}>
        <fieldset disabled={pending}>
          {subjects?.map((subject, index) => (
            <div className="admin-subcard" key={index}>
              <Lookup
                resourceKey="subjects"
                value={subject.subject_id}
                label={`Subject ${index + 1}`}
                required
                onChange={(id) =>
                  change(
                    subjects.map((row, position) =>
                      position === index ? { ...row, subject_id: id } : row,
                    ),
                  )
                }
                onFailure={onFailure}
              />
              <label>
                Syllabus *
                <textarea
                  required
                  maxLength={10000}
                  rows={5}
                  value={subject.syllabus}
                  onChange={(event) =>
                    change(
                      subjects.map((row, position) =>
                        position === index
                          ? { ...row, syllabus: event.target.value }
                          : row,
                      ),
                    )
                  }
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  change(subjects.filter((_, position) => position !== index))
                }
              >
                Remove subject
              </button>
            </div>
          ))}
          {subjects && (
            <button
              type="button"
              disabled={subjects.length >= 100}
              onClick={() =>
                change([...subjects, { subject_id: null, syllabus: '' }])
              }
            >
              Add subject
            </button>
          )}
        </fieldset>
        <div className="admin-actions admin-form-footer">
          <button className="primary" disabled={pending || !subjects}>
            {pending ? 'Saving…' : 'Save syllabus'}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!dirty || window.confirm('Discard unsaved syllabus changes?'))
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
