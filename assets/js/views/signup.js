// Create an account: with Google, or with a name, email and password, plus the region and
// diet that start the account's house rules.
import { html, render, on, href } from '../ui.js';
import { navigate } from '../lib/navigate.js';
import { toast } from '../lib/announce.js';
import { getAccount, signUp, signInWithGoogle } from '../account.js';
import { getRules } from '../state.js';
import { describeAuthError, isCancelled } from '../lib/cloud.js';
import { googleButton, divider, field, regionField, dietField, showFormError, setBusy, looksLikeEmail, MIN_PASSWORD } from '../components/account-forms.js';
import { accountsOff } from './account-off.js';
import { nextRoute } from './signin.js';

export const title = () => 'Create an account';

export function mount(outlet, { query, signal }) {
  const account = getAccount();
  if (account.status === 'off') return accountsOff(outlet);
  if (account.status === 'signed-in') return navigate('/account', {}, { replace: true });
  const rules = getRules(); // this device's choices make good defaults

  render(
    outlet,
    html`<div class="page page--narrow auth-page">
      <header class="page-head">
        <h1>Create your account</h1>
        <p>Keep your dates and house rules on every device you sign in on. Your account is private: only you can see what's in it.</p>
      </header>
      <div class="auth-card">
        ${googleButton('Sign up with Google')}
        ${divider()}
        <form class="auth-form" data-signup novalidate>
          <p class="banner banner--danger" role="alert" data-form-error hidden></p>
          ${field({ name: 'name', label: 'Your name', autocomplete: 'name', hint: 'Shown only to you, in your account.', extra: html`maxlength="60"` })}
          ${field({ name: 'email', label: 'Email', type: 'email', autocomplete: 'email' })}
          ${field({ name: 'password', label: 'Password', type: 'password', autocomplete: 'new-password', hint: `At least ${MIN_PASSWORD} characters.`, extra: html`minlength="${MIN_PASSWORD}"` })}
          ${regionField(rules.region)}
          ${dietField(rules.diet)}
          <button class="button button--primary" type="submit">Create account</button>
        </form>
      </div>
      <p class="auth-switch">Already have an account? <a href="${href('/signin', { next: query.next })}">Sign in</a></p>
    </div>`,
  );

  const form = outlet.querySelector('[data-signup]');

  on(outlet, 'click', '[data-google]', async (event, button) => {
    if (button.getAttribute('aria-disabled')) return;
    setBusy(button, true, 'Opening Google…');
    try {
      const { isNew } = await signInWithGoogle();
      // New Google accounts confirm their name, region and diet on the account page.
      if (isNew) navigate('/account', { welcome: 1 }, { replace: true });
      else navigate(nextRoute(query), {}, { replace: true });
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
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    const region = form.elements.region.value;
    const diet = form.elements.diet.value;
    if (!name) return showFormError(form, 'Tell us your name.', ['name']);
    if (!looksLikeEmail(email)) return showFormError(form, "That doesn't look like an email address.", ['email']);
    if (password.length < MIN_PASSWORD) return showFormError(form, `Choose a password of at least ${MIN_PASSWORD} characters.`, ['password']);
    showFormError(form, '');
    setBusy(button, true, 'Creating your account…');
    try {
      await signUp({ name, email, password, region, diet });
      toast(`Welcome, ${name}! Your account is ready.`);
      navigate(nextRoute(query), {}, { replace: true });
    } catch (err) {
      if (signal.aborted) return;
      const at = { 'auth/email-already-in-use': ['email'], 'auth/invalid-email': ['email'], 'auth/weak-password': ['password'] }[err?.code] ?? [];
      showFormError(form, describeAuthError(err), at);
    } finally {
      if (button.isConnected) setBusy(button, false);
    }
  }, { signal });
}
