export function AnnouncementBar(props: { text?: string | null }) {
  if (!props.text) {
    return null;
  }

  return (
    <div className="relative flex h-[40px] w-full items-center justify-center overflow-hidden bg-gradient-to-r from-primary to-[#2020e5] px-[16px] shadow-sm">
      <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
      <span className="text-caption-sm relative z-10 animate-fade-in tracking-[0.08em] text-on-primary uppercase">
        {props.text}
      </span>
    </div>
  );
}
