const PALETTE = ["#00C48C", "#3D8BFF", "#F5A623", "#F0466B", "#8B6BFF", "#0FE3A6"];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export default function Avatar({ seed, name, size = 40 }: { seed: string; name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const color = PALETTE[hashString(seed) % PALETTE.length];

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-[#06110d]"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.38 }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
