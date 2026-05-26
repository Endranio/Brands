import { currentUser } from '@clerk/nextjs/server';
import { count, eq } from 'drizzle-orm';
import { setRequestLocale } from 'next-intl/server';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { RecentOrdersCard } from '@/components/dashboard/RecentOrdersCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { db } from '@/libs/DB';
import { ordersSchema, productsSchema } from '@/models/Schema';

export default async function DashboardPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const user = await currentUser();

  // Basic stats for overview
  let totalProducts = 0;
  let totalOrders = 0;
  let pendingOrders = 0;

  try {
    const productsCount = await db
      .select({ value: count() })
      .from(productsSchema)
      .where(eq(productsSchema.status, 'active'));
    totalProducts = productsCount[0]?.value ?? 0;

    const ordersCount = await db.select({ value: count() }).from(ordersSchema);
    totalOrders = ordersCount[0]?.value ?? 0;

    const pendingCount = await db
      .select({ value: count() })
      .from(ordersSchema)
      .where(eq(ordersSchema.status, 'pending'));
    pendingOrders = pendingCount[0]?.value ?? 0;
  } catch {
    // Graceful fallback if tables aren't migrated
  }

  return (
    <div className="flex flex-col gap-[48px]">
      {/* 1. Header & Stats */}
      <div className="flex flex-col gap-[24px]">
        <div className="flex flex-col gap-[8px]">
          <h1 className="text-heading-xl text-ink">Selamat Datang, {user?.firstName ?? 'Admin'}</h1>
          <p className="text-body-md text-mute">
            Berikut adalah ringkasan performa toko Anda hari ini.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-[16px] md:grid-cols-3">
          <StatCard label="Total Produk Aktif" value={totalProducts} accent />
          <StatCard label="Total Pesanan" value={totalOrders} />
          <StatCard label="Pesanan Pending" value={pendingOrders} />
        </div>
      </div>

      {/* 2. Quick Actions */}
      <div className="flex flex-col gap-[16px]">
        <h2 className="text-heading-lg text-ink">Kelola Toko</h2>
        <div className="grid grid-cols-1 gap-[16px] md:grid-cols-3">
          <QuickActionCard
            title="Produk"
            description="Tambah atau edit katalog"
            href={`/${locale}/dashboard/products`}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            }
          />
          <QuickActionCard
            title="Pesanan"
            description="Pantau dan proses pesanan"
            href={`/${locale}/dashboard/orders`}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            }
          />
          <QuickActionCard
            title="Konten Landing"
            description="Ubah tampilan beranda"
            href={`/${locale}/dashboard/landing`}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            }
          />
        </div>
      </div>

      {/* 3. Recent Orders */}
      <div className="flex flex-col gap-[16px]">
        <RecentOrdersCard locale={locale} />
      </div>
    </div>
  );
}
