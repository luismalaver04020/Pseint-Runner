export function renderHeartsV2(n, maxLives) {
  // `lives` y `initial_lives` representan vidas completas, igual que en Supabase.
  const maxHearts = Math.max(0, Math.floor(Number(maxLives) || 0));
  const hearts = Math.max(0, Math.min(maxHearts, Math.floor(Number(n) || 0)));
  const empty = maxHearts - hearts;
  return '❤️'.repeat(hearts) + '🖤'.repeat(empty);
}
