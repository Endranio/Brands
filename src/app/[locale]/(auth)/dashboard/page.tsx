import { currentUser } from '@clerk/nextjs/server';
import { count, eq } from 'drizzle-orm';
import { setRequestLocale } from 'next-intl/server';
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
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-[32px]">
      <div className="flex flex-col gap-[8px]">
        <h1 className="text-heading-xl text-ink">Selamat Datang, {user?.firstName ?? 'Admin'}</h1>
        <p className="text-body-md text-mute">
          Berikut adalah ringkasan performa toko Anda hari ini.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-[16px] md:grid-cols-3">
        <div className="flex flex-col gap-[8px] border border-hairline-soft bg-canvas p-[24px]">
          <h3 className="text-caption-md tracking-wide text-mute uppercase">Total Produk Aktif</h3>
          <p className="text-display-campaign text-[48px] leading-none text-ink md:text-[48px]">
            {totalProducts}
          </p>
        </div>

        <div className="flex flex-col gap-[8px] border border-hairline-soft bg-canvas p-[24px]">
          <h3 className="text-caption-md tracking-wide text-mute uppercase">Total Pesanan</h3>
          <p className="text-display-campaign text-[48px] leading-none text-ink md:text-[48px]">
            {totalOrders}
          </p>
        </div>

        <div className="flex flex-col gap-[8px] border border-hairline-soft bg-canvas p-[24px]">
          <h3 className="text-caption-md tracking-wide text-mute uppercase">Pesanan Pending</h3>
          <p className="text-display-campaign text-[48px] leading-none text-ink md:text-[48px]">
            {pendingOrders}
          </p>
        </div>
      </div>
    </div>
  );
}
