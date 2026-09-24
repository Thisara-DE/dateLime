// Sharing that degrades gracefully: Web Share, then clipboard, then "select and copy".

/**
 * @returns {Promise<'shared'|'cancelled'|'copied'|'manual'>}
 */
export async function shareLink({ title, text, url }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled';
      // NotAllowedError etc.: fall through to the clipboard.
    }
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return 'copied';
  } catch {
    return 'manual';
  }
}

/** Offers a file through the share sheet when the platform supports it, else downloads it. */
export async function shareOrDownloadFile({ name, content, type, title }) {
  const file = typeof File === 'function' ? new File([content], name, { type }) : null;
  if (file && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return 'shared';
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled';
    }
  }
  downloadFile(name, content, type);
  return 'downloaded';
}

export function downloadFile(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.hidden = true;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** Absolute URL for an app route, e.g. appUrl('#/date?m=1&r=2'). */
export function appUrl(hash) {
  return `${location.origin}${location.pathname}${hash}`;
}
