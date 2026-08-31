// Deterministic seeded PRNG (mulberry32) so the sample dataset is stable
// across server restarts and builds.

export function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Rng {
  private rand: () => number;

  constructor(seed: number) {
    this.rand = mulberry32(seed);
  }

  next(): number {
    return this.rand();
  }

  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  float(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  bool(pTrue: number): boolean {
    return this.next() < pTrue;
  }

  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  pickMany<T>(arr: readonly T[], count: number): T[] {
    const pool = [...arr];
    const out: T[] = [];
    for (let i = 0; i < count && pool.length > 0; i++) {
      const idx = Math.floor(this.next() * pool.length);
      out.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return out;
  }

  weighted<T>(items: { item: T; weight: number }[]): T {
    const total = items.reduce((s, i) => s + i.weight, 0);
    let r = this.next() * total;
    for (const i of items) {
      r -= i.weight;
      if (r <= 0) return i.item;
    }
    return items[items.length - 1].item;
  }
}
