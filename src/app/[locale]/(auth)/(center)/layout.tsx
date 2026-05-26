import { setRequestLocale } from 'next-intl/server';

export default async function CenteredLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-soft-cloud p-4">
      <div className="mb-8">
        <h1 className="text-heading-xl font-bold tracking-tight text-ink uppercase">AMPM ADMIN</h1>
      </div>
      {props.children}
    </div>
  );
}
