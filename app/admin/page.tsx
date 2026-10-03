'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ApiError,
  message,
  refreshCsrf,
  request,
  type Page,
  type Row,
} from './api';
import { listPath, resources, rowLabel, savePath } from './resources';
import Editor from './Editor';
import Login from './Login';
import Syllabus from './Syllabus';
import './admin.css';

type User = { name: string; email: string; role: string };

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [accessError, setAccessError] = useState('');
  const [resourceKey, setResourceKey] = useState('subjects');
  const resource = resources.find((item) => item.key === resourceKey)!;
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Page | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [revision, setRevision] = useState(0);
  const [editing, setEditing] = useState<Row | null>(null);
  const [syllabus, setSyllabus] = useState<Row | null>(null);
  const [pendingAction, setPendingAction] = useState('');
  const pending = pendingAction !== '';
  const uploadForm = useRef<HTMLFormElement>(null);

  const checkSession = useCallback(async () => {
    setChecking(true);
    setAccessError('');
    try {
      const response = await request<{ data: User }>('/me');
      setUser(response.data);
    } catch (failure) {
      setUser(null);
      if (!(failure instanceof ApiError && failure.status === 401))
        setAccessError(message(failure));
    } finally {
      setChecking(false);
    }
  }, []);

  const onFailure = useCallback((failure: unknown) => {
    if (failure instanceof ApiError && [401, 403].includes(failure.status)) {
      setEditing(null);
      setSyllabus(null);
      setResult(null);
      setUser(null);
      if (failure.status === 403) setAccessError(message(failure));
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    let active = true;
    setLoading(true);
    setError('');
    setResult(null);
    request<Page>(`${listPath(resource)}?page=${page}&per_page=20`)
      .then((data) => {
        if (!active) return;
        if (data.last_page < page) setPage(Math.max(1, data.last_page));
        else setResult(data);
      })
      .catch((failure) => {
        if (!active) return;
        setError(message(failure));
        onFailure(failure);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, resource, page, revision, onFailure]);

  async function logout() {
    if (pending) return;
    setPendingAction('logout');
    try {
      await request('/auth/logout', 'POST');
      setUser(null);
      setResult(null);
      setEditing(null);
      setSyllabus(null);
      setNotice('');
      await refreshCsrf();
    } catch (failure) {
      setError(message(failure));
      onFailure(failure);
    } finally {
      setPendingAction('');
    }
  }

  async function edit(row: Row) {
    setPendingAction(`edit:${row.id}`);
    setError('');
    setNotice('');
    try {
      if (resource.catalogue) setEditing(row);
      else {
        const { data, ...related } = await request<
          { data: Row } & Record<string, unknown>
        >(`${listPath(resource)}/${row.id}`);
        setEditing({ ...data, ...related });
      }
    } catch (failure) {
      setError(message(failure));
      onFailure(failure);
    } finally {
      setPendingAction('');
    }
  }

  function saved() {
    setEditing(null);
    setSyllabus(null);
    setNotice('Changes saved.');
    setRevision((current) => current + 1);
  }

  async function remove(row: Row) {
    if (
      !window.confirm(
        `Delete “${rowLabel(row)}”? This cannot be undone. Referenced records cannot be deleted.`,
      )
    )
      return;
    setPendingAction(`delete:${row.id}`);
    setError('');
    setNotice('');
    try {
      await request(savePath(resource, row.id), 'DELETE');
      setNotice('Record deleted.');
      setRevision((current) => current + 1);
    } catch (failure) {
      setError(message(failure));
      onFailure(failure);
    } finally {
      setPendingAction('');
    }
  }

  async function publishMedia(row: Row) {
    setPendingAction(`publish:${row.id}`);
    setError('');
    setNotice('');
    try {
      await request(`/admin/media/${row.id}`, 'PUT', {
        published: !row.published,
      });
      saved();
    } catch (failure) {
      setError(message(failure));
      onFailure(failure);
    } finally {
      setPendingAction('');
    }
  }

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const file = data.get('file');
    if (
      !(file instanceof File) ||
      file.size === 0 ||
      file.size > 10 * 1024 * 1024
    ) {
      setError('Choose a non-empty JPEG, PNG, WebP or PDF file up to 10 MiB.');
      return;
    }
    setPendingAction('upload');
    setError('');
    setNotice('');
    try {
      await request('/admin/media', 'POST', data);
      uploadForm.current?.reset();
      setNotice(
        'File uploaded as draft. Publish it before attaching it to a lesson.',
      );
      setPage(1);
      setRevision((current) => current + 1);
    } catch (failure) {
      setError(message(failure));
      onFailure(failure);
    } finally {
      setPendingAction('');
    }
  }

  if (checking)
    return (
      <div className="admin-root">
        <main className="admin-login admin-card" role="status">
          Checking your session…
        </main>
      </div>
    );
  if (accessError)
    return (
      <div className="admin-root">
        <main className="admin-login admin-card">
          <h1>Admin access unavailable</h1>
          <p role="alert">{accessError}</p>
          <button onClick={checkSession}>Retry</button>
          <a href="/">Back to Student Web</a>
        </main>
      </div>
    );
  if (!user)
    return (
      <div className="admin-root">
        <Login onVerified={checkSession} />
      </div>
    );
  if (user.role !== 'admin')
    return (
      <div className="admin-root">
        <main className="admin-login admin-card">
          <h1>Admin access required</h1>
          <p>
            {user.email} does not have administrator access. Contact the account
            owner to request access.
          </p>
          {error && <p role="alert">{error}</p>}
          <button disabled={pending} onClick={logout}>
            Sign out
          </button>
          <a href="/">Back to Student Web</a>
        </main>
      </div>
    );

  const visibleRows = (result?.data || []).filter((row) =>
    `${row.id} ${rowLabel(row)}`.toLowerCase().includes(query.toLowerCase()),
  );
  const inEditor = Boolean(editing || syllabus);

  return (
    <div className="admin-root admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/admin">
          Prosthuti <span>Admin</span>
        </a>
        <nav aria-label="Admin navigation">
          {resources.map((item) => (
            <button
              key={item.key}
              aria-current={item.key === resourceKey ? 'page' : undefined}
              disabled={pending || inEditor}
              onClick={() => {
                setResult(null);
                setResourceKey(item.key);
                setPage(1);
                setQuery('');
                setNotice('');
                setError('');
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <a href="/">Open Student Web</a>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p className="fine">Content management</p>
            <h1>{resource.label}</h1>
          </div>
          <div className="admin-account">
            <span>
              {user.name}
              <small>{user.email}</small>
            </span>
            <button disabled={pending || inEditor} onClick={logout}>
              {pendingAction === 'logout' ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </header>
        {notice && (
          <p className="admin-success" role="status">
            {notice}
          </p>
        )}
        {error && (
          <p className="admin-error" role="alert">
            {error}{' '}
            <button
              disabled={pending}
              onClick={() => setRevision(revision + 1)}
            >
              Retry list
            </button>
          </p>
        )}
        {editing && (
          <Editor
            resource={resource}
            initial={editing}
            onSaved={saved}
            onCancel={() => setEditing(null)}
            onFailure={onFailure}
          />
        )}
        {syllabus && (
          <Syllabus
            exam={syllabus}
            onSaved={saved}
            onCancel={() => setSyllabus(null)}
            onFailure={onFailure}
          />
        )}
        {!inEditor && (
          <>
            {resource.key === 'media' && (
              <form ref={uploadForm} className="admin-card" onSubmit={upload}>
                <h2>Upload media</h2>
                <p className="fine">
                  JPEG, PNG, WebP or PDF, up to 10 MiB. Uploads start as drafts.
                </p>
                <fieldset disabled={pending}>
                  <label>
                    File
                    <input
                      name="file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      required
                    />
                  </label>
                  <button className="primary">
                    {pendingAction === 'upload' ? 'Uploading…' : 'Upload file'}
                  </button>
                </fieldset>
              </form>
            )}
            <section className="admin-card" aria-busy={loading}>
              <div className="admin-toolbar">
                <label>
                  Filter this page
                  <input
                    type="search"
                    placeholder="Title or ID"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
                {resource.key !== 'media' && (
                  <button
                    className="primary"
                    disabled={pending}
                    onClick={() => {
                      setNotice('');
                      setEditing(structuredClone(resource.defaults));
                    }}
                  >
                    New {resource.singular.toLowerCase()}
                  </button>
                )}
              </div>
              {loading ? (
                <p role="status">Loading {resource.label.toLowerCase()}…</p>
              ) : (
                result && (
                  <>
                    <div className="admin-table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>
                              {resource.key === 'media' ? 'File' : 'Content'}
                            </th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleRows.map((row) => (
                            <tr key={row.id}>
                              <td>#{row.id}</td>
                              <td>
                                <span className="admin-row-title">
                                  {rowLabel(row)}
                                </span>
                                {row.mime ? (
                                  <small>
                                    {String(row.mime)} ·{' '}
                                    {(Number(row.size) / 1024).toFixed(0)} KiB
                                  </small>
                                ) : null}
                              </td>
                              <td>
                                {'published' in row
                                  ? row.published
                                    ? 'Published'
                                    : 'Draft'
                                  : '—'}
                                {row.is_demo ? <small>Demo</small> : null}
                                {row.verified ? <small>Verified</small> : null}
                              </td>
                              <td>
                                <div className="admin-actions">
                                  {resource.key === 'media' ? (
                                    <>
                                      <a
                                        href={`/api/v1/media/${row.id}/download`}
                                      >
                                        Download
                                      </a>
                                      <button
                                        disabled={pending}
                                        onClick={() => publishMedia(row)}
                                      >
                                        {pendingAction === `publish:${row.id}`
                                          ? 'Saving…'
                                          : row.published
                                            ? 'Unpublish'
                                            : 'Publish'}
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      disabled={pending}
                                      onClick={() => edit(row)}
                                    >
                                      {pendingAction === `edit:${row.id}`
                                        ? 'Opening…'
                                        : 'Edit'}
                                    </button>
                                  )}
                                  {resource.key === 'exams' && (
                                    <button
                                      disabled={pending}
                                      onClick={() => {
                                        setNotice('');
                                        setSyllabus(row);
                                      }}
                                    >
                                      Syllabus
                                    </button>
                                  )}
                                  {resource.catalogue && (
                                    <button
                                      disabled={pending}
                                      onClick={() => remove(row)}
                                    >
                                      {pendingAction === `delete:${row.id}`
                                        ? 'Deleting…'
                                        : 'Delete'}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {!visibleRows.length && (
                      <p className="fine">
                        {query
                          ? 'No matching records on this page.'
                          : 'No records yet.'}
                      </p>
                    )}
                    <div className="admin-pagination">
                      <span>
                        {result.total} records · Page {result.current_page} of{' '}
                        {result.last_page}
                      </span>
                      <button
                        disabled={pending || page <= 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Previous
                      </button>
                      <button
                        disabled={pending || page >= result.last_page}
                        onClick={() => setPage(page + 1)}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
