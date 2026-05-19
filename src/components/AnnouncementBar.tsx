export function AnnouncementBar(props: { text?: string | null }) {
  if (!props.text) {
    return null;
  }

  return (
    <div className="flex h-[36px] w-full items-center justify-center bg-ink px-[16px]">
      <span className="text-caption-sm tracking-[0.08em] text-on-primary uppercase">
        {props.text}
      </span>
    </div>
  );
}
