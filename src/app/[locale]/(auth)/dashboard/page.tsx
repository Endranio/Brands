import { setRequestLocale } from 'next-intl/server';

export default async function DashboardPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="py-5">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p>Welcome to the ANPM Admin Dashboard.</p>
    </div>
  );
}
