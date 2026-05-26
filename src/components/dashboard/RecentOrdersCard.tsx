import { desc } from 'drizzle-orm';
import Link from 'next/link';
import { db } from '@/libs/DB';
import { ordersSchema } from '@/models/Schema';

export async function RecentOrdersCard(props: { locale: string }) {
  let recentOrders: (typeof ordersSchema.$inferSelect)[] = [];
  try {
    recentOrders = await db
      .select()
      .from(ordersSchema)
      .orderBy(desc(ordersSchema.createdAt))
      .limit(5);
  } catch {
    // Graceful fallback if tables aren't migrated
  }

  return (
    <div className="flex flex-col border border-hairline-soft bg-canvas">
      <div className="border-b border-hairline-soft p-[24px]">
        <h3 className="text-heading-md text-ink">Pesanan Terbaru</h3>
      </div>

      {recentOrders.length > 0 ? (
        <div className="flex flex-col">
          {recentOrders.map((order, index) => {
            const isLast = index === recentOrders.length - 1;

            // Map status to visual badge
            let badgeClass = 'bg-soft-cloud text-mute';
            let statusText = order.status;

            if (order.status === 'pending') {
              badgeClass = 'bg-soft-cloud text-mute';
              statusText = 'Pending';
            } else if (order.status === 'confirmed') {
              badgeClass = 'bg-ink text-canvas';
              statusText = 'Confirmed';
            } else if (order.status === 'paid') {
              badgeClass = 'bg-success text-canvas';
              statusText = 'Paid';
            } else if (order.status === 'shipped') {
              badgeClass = 'bg-brand text-canvas';
              statusText = 'Shipped';
            } else if (order.status === 'cancelled') {
              badgeClass = 'bg-sale text-canvas';
              statusText = 'Cancelled';
            }

            return (
              <div
                key={order.id}
                className={`flex items-center justify-between p-[16px] px-[24px] transition-colors hover:bg-soft-cloud ${
                  isLast ? '' : 'border-b border-hairline-soft'
                }`}
              >
                <div className="flex flex-col gap-[4px]">
                  <span className="text-body-strong text-ink">{order.orderNumber}</span>
                  <span className="text-caption-md text-mute">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-[16px]">
                  <span className="text-body-strong text-ink">
                    Rp {order.totalAmount.toLocaleString('id-ID')}
                  </span>
                  <span
                    className={`text-caption-sm inline-flex items-center px-[12px] py-[4px] ${badgeClass}`}
                  >
                    {statusText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-body-md p-[24px] text-center text-mute">Belum ada pesanan.</div>
      )}

      <div className="border-t border-hairline-soft bg-soft-cloud p-[16px] text-center transition-colors hover:bg-hairline-soft">
        <Link
          href={`/${props.locale}/dashboard/orders`}
          className="text-body-strong text-ink hover:underline"
        >
          Lihat Semua Pesanan →
        </Link>
      </div>
    </div>
  );
}
