// Your account: name, region and diet; where the data lives; sign out; delete the account.
import { html, render, on, icon } from '../ui.js';
import { navigate } from '../lib/navigate.js';
import { toast } from '../lib/announce.js';
import { openSheet } from '../components/sheet.js';
import { getAccount, subscribeAccount, updateProfile, signOut, deleteAccount } from '../account.js';
import { getRules, getSaved } from '../state.js';
import { describeAuthError } from '../lib/cloud.js';
import { field, regionField, dietField, showFormError, setBusy } from '../components/account-forms.js';
import { accountsOff } from './account-off.js';

export const title = () => 'Your account';

export function mount(outlet, { query, signal }) {
  if (getAccount().status === 'off') return accountsOff(outlet);
  if (getAccount().status !== 'signed-in') return navigate('/signin', { next: '/account' }, { replace: true });
  const welcome = query.welcome === '1';

  function renderAll() {
    const { user, profile, syncError } = getAccount();
    const rules = getRules();
    const name = profile?.name || user.name;
    const n = getSaved().length;
    render(
      outlet,
      html`<div class="page page--narrow">
        <header class="page-head">
          <h1>${welcome ? `Welcome to dateLime, ${name}` : 'Your account'}</h1>
          <p>${welcome ? 'Check your name, region and diet. You can change them any time.' : html`Signed in as <strong>${user.email}</strong>${user.provider === 'google' ? ' with Google' : ''}.`}</p>
        </header>
        ${syncError
          ? html`<p class="banner banner--warning" role="status">${icon('wifi-off')}<span>We can't reach your account right now. Changes are kept on this device and sync when you're back online.</span></p>`
          : html`<p class="banner" role="status">${icon('check')}<span>Your house rules and ${n === 1 ? '1 saved date are' : `${n} saved dates are`} in your account. Only you can see them.</span></p>`}
        <section class="account-section" aria-labelledby="profile-title">
          <h2 id="profile-title">Profile</h2>
          <form class="auth-form" data-profile novalidate>
            <p class="banner banner--danger" role="alert" data-form-error hidden></p>
            ${field({ name: 'name', label: 'Your name', value: name, autocomplete: 'name', extra: html`maxlength="60"` })}
            ${regionField(rules.region)}
            ${dietField(rules.diet)}
            <button class="button button--primary" type="submit">Save</button>
          </form>
        </section>
        <section class="account-section" aria-labelledby="session-title">
          <h2 id="session-title">This device</h2>
          <p>Signing out removes your account's data from this browser. It stays safe in your account.</p>
          <button class="button button--secondary" type="button" data-signout>${icon('log-out')} Sign out</button>
        </section>
        <section class="account-section account-section--danger" aria-labelledby="delete-title">
          <h2 id="delete-title">Delete your account</h2>
          <p>Deletes your profile, house rules and saved dates for good.</p>
          <button class="button button--danger" type="button" data-delete-account>${icon('trash')} Delete account</button>
        </section>
      </div>`,
    );
  }
  renderAll();
  // The profile and sync status arrive from Firestore after the first paint.
  const unsubscribe = subscribeAccount((a) => {
    if (a.status !== 'signed-in') return;
    const active = document.activeElement;
    if (!outlet.contains(active) || active === outlet.querySelector('h1')) renderAll();
  });

  on(outlet, 'submit', '[data-profile]', async (event, form) => {
    event.preventDefault();
    const button = form.querySelector('[type="submit"]');
    if (button.getAttribute('aria-disabled')) return;
    const name = form.elements.name.value.trim();
    if (!name) return showFormError(form, 'Your name can’t be empty.', ['name']);
    showFormError(form, '');
    setBusy(button, true, 'Saving…');
    try {
      await updateProfile({ name, region: form.elements.region.value, diet: form.elements.diet.value });
      toast('Saved.');
      if (welcome) navigate('/', {}, { replace: true });
    } catch (err) {
      if (!signal.aborted) showFormError(form, describeAuthError(err));
    } finally {
      if (button.isConnected) setBusy(button, false);
    }
  }, { signal });

  on(outlet, 'click', '[data-signout]', async () => {
    await signOut().catch(() => {}); // the device forgets the account either way
    toast('Signed out. Your dates are safe in your account.');
    navigate('/', {}, { replace: true });
  }, { signal });

  on(outlet, 'click', '[data-delete-account]', (event, trigger) => {
    const sheet = openSheet({
      title: 'Delete your account?',
      trigger,
      className: 'sheet--prompt',
      body: html`<p>This deletes your profile, your house rules and ${getSaved().length === 1 ? 'your saved date' : `all ${getSaved().length} saved dates`} from dateLime, and signs you out. It can't be undone.</p><p class="banner banner--danger" role="alert" data-delete-error hidden></p>`,
      footer: html`<div class="button-row"><button class="button button--danger" type="button" data-confirm-delete>Delete my account</button><button class="button button--secondary" type="button" data-sheet-close>Cancel</button></div>`,
    });
    const confirm = sheet.dialog.querySelector('[data-confirm-delete]');
    confirm.addEventListener('click', async () => {
      if (confirm.getAttribute('aria-disabled')) return;
      setBusy(confirm, true, 'Deleting…');
      try {
        await deleteAccount();
        sheet.close();
        toast('Your account is deleted.', { tone: 'info' });
        navigate('/', {}, { replace: true });
      } catch (err) {
        setBusy(confirm, false);
        const box = sheet.dialog.querySelector('[data-delete-error]');
        box.textContent = describeAuthError(err);
        box.hidden = false;
      }
    });
  }, { signal });

  return unsubscribe;
}
