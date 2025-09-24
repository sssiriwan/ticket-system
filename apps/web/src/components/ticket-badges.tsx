export function PriorityBadge({value}: {value: "LOW" | "MEDIUM" | "HIGH"}) {
  const color =
    value === "HIGH"
      ? "badge-error"
      : value === "MEDIUM"
        ? "badge-warning"
        : "badge-success";
  return <span className={`badge ${color} badge-sm`}>{value}</span>;
}

export function StatusBadge({
  value,
}: {
  value: "OPEN" | "IN_PROGRESS" | "RESOLVED";
}) {
  const color =
    value === "RESOLVED"
      ? "badge-success"
      : value === "IN_PROGRESS"
        ? "badge-info"
        : "badge-ghost";
  return <span className={`badge ${color} badge-sm`}>{value}</span>;
}
