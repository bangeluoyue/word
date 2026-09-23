export function getSafeReturnTo(value: string | null | undefined) {
  if (!value || value.length > 500 || !value.startsWith('/') || value.startsWith('//')) {
    return '/mine';
  }

  let target: URL;
  try {
    target = new URL(value, 'https://word-flow.local');
  } catch {
    return '/mine';
  }

  if (target.origin !== 'https://word-flow.local') return '/mine';

  const allowed =
    target.pathname === '/' ||
    target.pathname === '/mine' ||
    target.pathname === '/words' ||
    target.pathname.startsWith('/words/') ||
    target.pathname.startsWith('/learn/') ||
    target.pathname.startsWith('/word/') ||
    target.pathname.startsWith('/notebooks/');

  return allowed ? `${target.pathname}${target.search}` : '/mine';
}
