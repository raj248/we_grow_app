export function detectYouTubeLinkType(url: string): 'video' | 'shorts' | 'channel' | 'unknown' {
  if (!url) return 'unknown';

  const normalized = url.toLowerCase();

  if (/\/shorts\//.test(normalized)) return 'shorts';
  if (/watch\?v=|youtu\.be\/|\/embed\//.test(normalized)) return 'video';
  if (/\/(channel\/|user\/|c\/|@)/.test(normalized)) return 'channel';

  return 'unknown';
}
