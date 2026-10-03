'use client';

import { useEffect, useId, useState } from 'react';
import { message, request, type Page } from './api';
import { listPath, resources, rowLabel } from './resources';

export default function Lookup({
  resourceKey,
  value,
  onChange,
  label,
  required = false,
  onFailure,
}: {
  resourceKey: string;
  value: unknown;
  onChange: (id: number | null) => void;
  label: string;
  required?: boolean;
  onFailure: (error: unknown) => void;
}) {
  const controlId = useId();
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Page | null>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const resource = resources.find((item) => item.key === resourceKey)!;

  useEffect(() => {
    let active = true;
    setResult(null);
    setError('');
    request<Page>(`${listPath(resource)}?page=${page}&per_page=50`)
      .then((data) => {
        if (active) setResult(data);
      })
      .catch((failure) => {
        if (!active) return;
        setError(message(failure));
        onFailure(failure);
      });
    return () => {
      active = false;
    };
  }, [resource, page, revision, onFailure]);

  const rows = result?.data || [];
  const selectedVisible = rows.some((row) => row.id === Number(value));
  return (
    <div className="admin-lookup">
      <label htmlFor={controlId}>
        {label}
        {required ? ' *' : ''}
      </label>
      <select
        id={controlId}
        value={value == null ? '' : String(value)}
        required={required}
        onChange={(event) =>
          onChange(event.target.value ? Number(event.target.value) : null)
        }
      >
        <option value="">Select {resource.singular.toLowerCase()}</option>
        {value && !selectedVisible ? (
          <option value={String(value)}>
            Selected #{String(value)} (another page)
          </option>
        ) : null}
        {rows.map((row) => (
          <option key={row.id} value={row.id}>
            #{row.id} · {rowLabel(row).slice(0, 120)}
            {row.published === false || row.published === 0 ? ' (draft)' : ''}
          </option>
        ))}
      </select>
      {!result && !error && <small role="status">Loading choices…</small>}
      {error && (
        <p role="alert">
          {error}{' '}
          <button
            type="button"
            onClick={() => setRevision((current) => current + 1)}
          >
            Retry
          </button>
        </p>
      )}
      {result && result.last_page > 1 && (
        <div className="admin-pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous choices
          </button>
          <small>
            {page} / {result.last_page}
          </small>
          <button
            type="button"
            disabled={page >= result.last_page}
            onClick={() => setPage(page + 1)}
          >
            Next choices
          </button>
        </div>
      )}
    </div>
  );
}
