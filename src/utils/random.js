// Tiny seeded PRNG (mulberry32). Good enough for picking words and shuffling
// items deterministically so the same seed reproduces the same worksheet.

export function createRng(seed) {
  let a = seed >>> 0;
  if (a === 0) a = 1;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

export function shuffle(arr, rng) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function randomSeed() {
  return (Math.random() * 0xffffffff) >>> 0;
}
