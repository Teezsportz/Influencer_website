export default function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chip transition-colors ${active ? "chip-active" : "hover:border-base-muted/50"}`}
    >
      {label}
    </button>
  );
}
