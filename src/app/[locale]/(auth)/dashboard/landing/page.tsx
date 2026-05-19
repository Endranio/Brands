import { setRequestLocale } from 'next-intl/server';
import { getLandingContent } from '@/actions/landingContent';
import { LandingContentForm } from '@/components/dashboard/LandingContentForm';

export default async function LandingContentPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const content = await getLandingContent();

  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-[32px]">
      <div className="flex flex-col gap-[8px]">
        <h1 className="text-heading-xl text-ink">Kelola Konten Landing</h1>
        <p className="text-body-md text-mute">
          Update teks dan gambar utama yang muncul di halaman beranda.
        </p>
      </div>

      <LandingContentForm
        initialData={{
          heroTitle: content?.heroTitle ?? undefined,
          heroSubtitle: content?.heroSubtitle ?? undefined,
          heroImageUrl: content?.heroImageUrl ?? undefined,
          ctaText: content?.ctaText ?? undefined,
          ctaLink: content?.ctaLink ?? undefined,
          announcementText: content?.announcementText ?? undefined,
          instagramUrl: content?.instagramUrl ?? undefined,
        }}
      />
    </div>
  );
}
