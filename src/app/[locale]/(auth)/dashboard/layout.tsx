import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

type DashboardLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: DashboardLayoutProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'DashboardLayout',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function DashboardLayout(props: DashboardLayoutProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen bg-soft-cloud">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col pb-[60px] md:pb-0">
        <DashboardHeader />
        <main className="flex-1 p-[16px] md:p-[32px]">{props.children}</main>
      </div>
    </div>
  );
}
