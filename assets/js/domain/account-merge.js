// What "Add them to my account" does with the dates and house rules a guest saved on this
// device before signing in. Pure, so it's unit tested without Firebase.
import { upsertSaved, samePairing, isComplete } from './plan.js';

/**
 * @param {{rules?: object, saved?: object[]}} account  what the account already holds
 * @param {{rules?: object, saved?: object[]}} guest    what this device held signed out
 * @returns {{rules: object, saved: object[], added: number}}
 */
export function mergeGuestIntoAccount(account, guest) {
  let saved = account.saved ?? [];
  let added = 0;
  // Oldest first, so the guest's most recent date ends up on top (upsertSaved prepends).
  for (const plan of [...(guest.saved ?? [])].filter(isComplete).reverse()) {
    if (!saved.some((p) => p.id === plan.id || samePairing(p, plan))) added += 1;
    saved = upsertSaved(saved, plan);
  }
  // The account's own house rules win. The guest's streaming services and foods to avoid
  // fill in only where the account has none, since those lists take effort to pick.
  const rules = { ...account.rules };
  for (const list of ['services', 'avoid']) {
    if (!rules[list]?.length && guest.rules?.[list]?.length) rules[list] = guest.rules[list];
  }
  return { rules, saved, added };
}

/** True when a guest's device data holds something worth offering to the account. */
export const hasGuestDates = (guest) => (guest?.saved ?? []).some(isComplete);
