// Sign in: Google, or email and password. Accounts are optional; planning works without one.
import { html, render, on, href } from '../ui.js';
import { navigate } from '../lib/navigate.js';
import { toast } from '../lib/announce.js';
import { getAccount, signIn, signInWithGoogle, sendPasswordReset } from '../account.js';
import { describeAuthError, isCancelled } from '../lib/cloud.js';
import { googleButton, divider, field, showFormError, setBusy, looksLikeEmail } from '../components/account-forms.js';
import { accountsOff } from './account-off.js';

export const title = () => 'Sign in';

/** Where to go after signing in: a same-app route only (never an outside URL). */
export const nextRoute = (query) => (/^\/[a-z/]*$/.test(query.next ?? '') ? query.next : '/dates');

export function mount(outlet, { query, signal }) {
  const account = getAccount();
  if (account.status === 'off') return accountsOff(outlet);
  if (account.status === 'signed-in') return navigate('/account', {}, { replace: true });

  render(
    outlet,
    html`<div class="page page--narrow auth-page">
      <header class="page-head">
        <h1>Welcome back</h1>
        <p>Sign in to keep your dates and house rules on every device. Only you can see what's in your account.</p>
      </header>
      <div class="auth-card">
        ${googleButton('Continue with Google')}
        ${divider()}
        <form class="auth-form" data-signin novalidate>
          <p class="banner banner--danger" role="alert" data-form-error hidden></p>
          ${field({ name: 'email', label: 'Email', type: 'email', autocomplete: 'email' })}
          ${field({ name: 'password', label: 'Password', type: 'password', autocomplete: 'current-password' })}
          <button class="button button--primary" type="submit">Sign in</button>
          <button class="button button--ghost" type="button" data-reset>Forgot your password?</button>
          <p class="muted" role="status" data-reset-status></p>
        </form>
      </div>
      <p class="auth-switch">New to dateLime? <a href="${href('/signup', { next: query.next })}">Create an account</a></p>
      <p class="muted auth-switch">You don't need an account to plan a date. <a href="#/">Keep going without one</a>.</p>
    </div>`,
  );

  const form = outlet.querySelector('[data-signin]');
  const done = () => {
    toast(`Signed in as ${getAccount().user.name || getAccount().user.email}.`);
    navigate(nextRoute(query), {}, { replace: true });
  };

  on(outlet, 'click', '[data-google]', async (event, button) => {
    if (button.getAttribute('aria-disabled')) return;
    setBusy(button, true, 'Opening Google…');
    try {
      const { isNew } = await signInWithGoogle();
      if (isNew) navigate('/account', { welcome: 1 }, { replace: true });
      else done();
    } catch (err) {
      if (!signal.aborted && !isCancelled(err)) showFormError(form, describeAuthError(err));
    } finally {
      if (button.isConnected) setBusy(button, false);
    }
  }, { signal });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('[type="submit"]');
    if (button.getAttribute('aria-disabled')) return;
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    if (!looksLikeEmail(email)) return showFormError(form, 'Enter the email address you signed up with.', ['email']);
    if (!password) return showFormError(form, 'Enter your password.', ['password']);
    showFormError(form, '');
    setBusy(button, true, 'Signing in…');
    try {
      await signIn({ email, password });
      done();
    } catch (err) {
      if (signal.aborted) return;
      const bad = ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'].includes(err?.code);
      showFormError(form, describeAuthError(err), bad ? ['password'] : []);
    } finally {
      if (button.isConnected) setBusy(button, false);
    }
  }, { signal });

  on(outlet, 'click', '[data-reset]', async () => {
    const email = form.elements.email.value.trim();
    const status = outlet.querySelector('[data-reset-status]');
    if (!looksLikeEmail(email)) return showFormError(form, 'Enter your email above, then choose "Forgot your password?" again.', ['email']);
    showFormError(form, '');
    try {
      await sendPasswordReset(email);
    } catch (err) {
      // Say the same thing whether or not the account exists, so the form can't be used to
      // find out who has one. Only a broken connection is worth reporting.
      if (err?.code === 'auth/network-request-failed') return showFormError(form, describeAuthError(err));
    }
    status.textContent = `If there's an account for ${email}, we've sent it a link to reset the password.`;
  }, { signal });
}
