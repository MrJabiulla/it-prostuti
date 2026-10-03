'use client';

import { useEffect, useState } from 'react';
import { message, refreshCsrf, request } from './api';

export default function Login({
  onVerified,
}: {
  onVerified: () => Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function sendCode() {
    if (pending || cooldown) return;
    setPending(true);
    setError('');
    try {
      await request('/auth/otp/request', 'POST', { email });
      setSent(true);
      setCooldown(60);
    } catch (failure) {
      setError(message(failure));
    } finally {
      setPending(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!sent) return sendCode();
    if (pending) return;
    setPending(true);
    setError('');
    try {
      await request('/auth/otp/verify', 'POST', { email, code });
      await refreshCsrf();
      await onVerified();
    } catch (failure) {
      setError(message(failure));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="admin-login admin-card">
      <p className="fine">Prosthuti · Administration</p>
      <h1>Admin sign in</h1>
      <p>Use the email address of your administrator account.</p>
      <form onSubmit={submit}>
        <fieldset disabled={pending}>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              readOnly={sent}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          {sent && (
            <>
              <p role="status">
                A code was requested for {email}. It expires in 10 minutes.
              </p>
              <label>
                Six-digit code
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
              </label>
            </>
          )}
          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}
          <button className="primary" disabled={!sent && cooldown > 0}>
            {pending
              ? 'Please wait…'
              : sent
                ? 'Verify and sign in'
                : cooldown
                  ? `Request code in ${cooldown}s`
                  : 'Request code'}
          </button>
          {sent && (
            <div className="admin-actions">
              <button type="button" disabled={cooldown > 0} onClick={sendCode}>
                {cooldown ? `Resend in ${cooldown}s` : 'Resend code'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setCode('');
                  setError('');
                }}
              >
                Change email
              </button>
            </div>
          )}
        </fieldset>
      </form>
      <p className="fine">
        Access is granted by an administrator. Signing in does not grant admin
        permissions.
      </p>
      <a href="/">Back to Student Web</a>
    </main>
  );
}
