import { DataSource, ValueWithSource } from "@/lib/types";
import { formatCompactNumber, formatNaira, formatPercent } from "@/lib/format";

const SOURCE_LABEL: Record<DataSource, string> = {
  public: "Publicly observable",
  creator_authorised: "Creator-authorised",
  estimated: "Estimated",
  unavailable: "Data unavailable",
};

const SOURCE_COLOR: Record<DataSource, string> = {
  public: "text-brand-soft",
  creator_authorised: "text-brand-blue",
  estimated: "text-brand-amber",
  unavailable: "text-base-muted",
};

export default function DataValue({
  label,
  data,
  isPercent = false,
  isCurrency = false,
  suffix = "",
}: {
  label: string;
  data: ValueWithSource<number>;
  isPercent?: boolean;
  isCurrency?: boolean;
  suffix?: string;
}) {
  const source: DataSource = data.value === null ? "unavailable" : data.source;
  const display =
    data.value === null
      ? "Data unavailable"
      : isPercent
      ? formatPercent(data.value)
      : isCurrency
      ? formatNaira(data.value)
      : `${formatCompactNumber(data.value)}${suffix}`;

  return (
    <div className="rounded-xl border border-base-border bg-base-panel2 p-3">
      <div className="text-xs text-base-muted">{label}</div>
      <div className="mt-1 text-lg font-semibold">{display}</div>
      <div className={`mt-0.5 text-[10px] font-medium uppercase tracking-wide ${SOURCE_COLOR[source]}`}>{SOURCE_LABEL[source]}</div>
    </div>
  );
}
