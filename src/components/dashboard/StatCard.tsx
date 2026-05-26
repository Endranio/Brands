/**
 * StatCard component for displaying key metrics on the dashboard.
 * Adheres to the DESIGN.md spec: zero border-radius, hairline borders.
 * @param props - Component props.
 * @returns The StatCard component.
 */
export function StatCard(props: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div
      className={`flex flex-col gap-[8px] border border-hairline-soft bg-canvas p-[24px] ${props.accent ? 'border-t-[3px] border-t-brand' : ''} `}
    >
      <h3 className="text-caption-md tracking-wide text-mute uppercase">{props.label}</h3>
      <p className="font-display text-[48px] leading-none text-ink">{props.value}</p>
    </div>
  );
}
