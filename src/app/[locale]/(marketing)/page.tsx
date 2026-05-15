import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

type IndexPageProps = {
  params: Promise<{ locale: string }>;
};

export function generateMetadata(): Metadata {
  return {
    title: 'ANPM — Clothing Brand',
    description: 'Temukan koleksi terbaru ANPM. Belanja langsung dari website resmi kami.',
  };
}

export default async function IndexPage(props: IndexPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-bold">ANPM — Coming Soon</h1>
    </main>
  );
}
