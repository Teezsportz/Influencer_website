export default function ScoreBadge({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const color = score >= 80 ? "#0FE3A6" : score >= 60 ? "#F5A623" : "#F0466B";
  const dims = size === "lg" ? "h-16 w-16 text-xl" : size === "sm" ? "h-8 w-8 text-[11px]" : "h-11 w-11 text-sm";

  return (
    <div
      className={`flex ${dims} shrink-0 items-center justify-center rounded-full font-bold`}
      style={{
        color,
        background: `conic-gradient(${color} ${score * 3.6}deg, #1c222f ${score * 3.6}deg)`,
      }}
      title={`Fit Score: ${score}/100`}
    >
      <span
        className="flex items-center justify-center rounded-full bg-base-panel"
        style={{ width: "78%", height: "78%" }}
      >
        {score}
      </span>
    </div>
  );
}
