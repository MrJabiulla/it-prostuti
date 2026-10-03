// Authentication uses the existing Laravel session, never browser-stored tokens.
let accountUser: string | null = null;
let authMode: 'login' | 'register' = 'login';
let authEmail = '';
let authName = '';
let authCodeSent = false;
let authPending = false;
let authResendAt = 0;

function setAccountUser(name: string | null) {
  accountUser = name;
  const controls = document.getElementById('account-controls');
  if (!controls) return;
  controls.innerHTML = name !== null
    ? `<span class="fine">${esc(name)}</span><button class="text-button" data-auth="logout">Log out</button>`
    : '<button class="text-button" data-auth="login">Log in</button><button class="primary" data-auth="register">Create account</button>';
}

function renderAuthForm() {
  const dialog = document.getElementById('auth-dialog');
  if (!dialog) return;
  const title = authCodeSent ? 'Check your email' : authMode === 'register' ? 'Create your account' : 'Welcome back';
  dialog.innerHTML = `<form id="auth-form">
    <div class="row between"><h2 id="auth-title">${title}</h2><button type="button" class="icon-button" data-auth="close" aria-label="Close">✕</button></div>
    <p class="fine">${authCodeSent ? `Enter the 6-digit code sent to ${esc(authEmail)}. It expires in 10 minutes.` : 'Continue with an email code. No password needed.'}</p>
    ${authCodeSent ? '<label>Verification code<input name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" minlength="6" maxlength="6" required autofocus></label>' : `${authMode === 'register' ? `<label>Your name<input name="name" autocomplete="name" maxlength="80" value="${esc(authName)}" required></label>` : ''}<label>Email address<input name="email" type="email" autocomplete="email" maxlength="254" value="${esc(authEmail)}" required></label>`}
    <p id="auth-message" class="fine" role="status" aria-live="polite"></p>
    <button class="primary full" type="submit">${authCodeSent ? 'Verify and continue' : 'Send code'}</button>
    <div class="row between auth-links">${authCodeSent ? '<button type="button" class="text-button" data-auth="change-email">Change email</button><button type="button" class="text-button" data-auth="resend">Resend code</button>' : `<span class="fine">${authMode === 'login' ? 'New to Prosthuti?' : 'Already have an account?'}</span><button type="button" class="text-button" data-auth="${authMode === 'login' ? 'register' : 'login'}">${authMode === 'login' ? 'Create account' : 'Log in'}</button>`}</div>
  </form>`;
}

function openAuth(mode: 'login' | 'register') {
  authMode = mode;
  authCodeSent = false;
  renderAuthForm();
  const dialog = document.getElementById('auth-dialog') as HTMLDialogElement;
  if (!dialog.open) dialog.showModal();
}

function authMessage(message: string) {
  const element = document.getElementById('auth-message');
  if (element) element.textContent = message;
}

async function sendAuthCode() {
  if (Date.now() < authResendAt) {
    throw new Error(`Please wait ${Math.ceil((authResendAt - Date.now()) / 1000)} seconds before requesting another code.`);
  }
  await apiRequest('/auth/otp/request', 'POST', {
    email: authEmail,
    ...(authMode === 'register' ? { name: authName } : {}),
  });
  authResendAt = Date.now() + 60000;
  authCodeSent = true;
  renderAuthForm();
  authMessage('Code sent. Check your inbox and spam folder.');
}

async function verifyAuthCode(code: string) {
  await apiRequest('/auth/otp/verify', 'POST', { email: authEmail, code });
  // A new document clears all previous account state and refreshes CSRF after rotation.
  location.reload();
}

async function logoutAccount() {
  if (apiMutationPending || apiNoteDrafts.size) {
    toast('Please finish saving your changes before logging out.');
    return;
  }
  await apiRequest('/auth/logout', 'POST');
  apiReady = false;
  setAccountUser(null);
  location.reload();
}

async function runAuthAction(action: () => Promise<void>) {
  if (authPending) return;
  authPending = true;
  const dialog = document.getElementById('auth-dialog');
  const controls = document.getElementById('account-controls');
  const setBusy = (busy: boolean) => {
    for (const container of [dialog, controls]) {
      container?.querySelectorAll<HTMLButtonElement | HTMLInputElement>('button, input').forEach((input) => { input.disabled = busy; });
    }
    dialog?.setAttribute('aria-busy', String(busy));
  };
  authMessage('Please wait…');
  setBusy(true);
  try {
    await action();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to continue. Please try again.';
    authMessage(message);
    if (!(dialog as HTMLDialogElement)?.open) toast(message);
  } finally {
    authPending = false;
    setBusy(false);
  }
}

if (apiEnabled) {
  setAccountUser(null);
  document.getElementById('auth-dialog')?.addEventListener('cancel', (event) => {
    if (authPending) event.preventDefault();
  });
  document.addEventListener('click', (event) => {
    const action = (event.target as Element).closest<HTMLElement>('[data-auth]')?.dataset.auth;
    if (!action) return;
    event.preventDefault();
    if (authPending) return;
    if (action === 'login' || action === 'register') openAuth(action);
    if (action === 'close') (document.getElementById('auth-dialog') as HTMLDialogElement).close();
    if (action === 'change-email') { authCodeSent = false; renderAuthForm(); }
    if (action === 'resend') void runAuthAction(sendAuthCode);
    if (action === 'logout') void runAuthAction(logoutAccount);
  });
  document.addEventListener('submit', (event) => {
    const form = event.target as HTMLFormElement;
    if (form.id !== 'auth-form') return;
    event.preventDefault();
    const data = new FormData(form);
    if (authCodeSent) {
      void runAuthAction(() => verifyAuthCode(String(data.get('code') || '')));
    } else {
      authEmail = String(data.get('email') || '').trim().toLowerCase();
      authName = String(data.get('name') || '').trim();
      void runAuthAction(sendAuthCode);
    }
  });
}
