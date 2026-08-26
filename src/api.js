export async function fetchSecurities(board = 'TQBR') {
  const res = await fetch(`/api/securities?board=${board}`);
  if (!res.ok) throw new Error(`securities request failed: ${res.status}`);
  return res.json();
}

export async function fetchFeatured() {
  const res = await fetch('/api/featured');
  if (!res.ok) throw new Error(`featured request failed: ${res.status}`);
  return res.json();
}
