export default function Bar({ pct, color = "#00C48C" }: { pct: number; color?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-panel2">
      <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: color }} />
    </div>
  );
}
