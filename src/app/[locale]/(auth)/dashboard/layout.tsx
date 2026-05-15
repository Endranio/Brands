import { SignOutButton } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/libs/I18nNavigation';

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
  const t = await getTranslations({
    locale,
    namespace: 'DashboardLayout',
  });

  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between border-b p-4">
        <ul className="flex gap-4">
          <li>
            <Link href="/dashboard/" className="text-gray-700 hover:text-gray-900">
              {t('dashboard_link')}
            </Link>
          </li>
        </ul>
        <ul className="flex gap-4">
          <li>
            <SignOutButton>
              <button className="text-gray-700 hover:text-gray-900" type="button">
                {t('sign_out')}
              </button>
            </SignOutButton>
          </li>
        </ul>
      </nav>
      <main className="p-4">{props.children}</main>
    </div>
  );
}
