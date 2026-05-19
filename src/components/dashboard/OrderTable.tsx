'use client';

import { useState } from 'react';
import { updateOrderStatus, getOrderById } from '@/actions/orders';

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  status: string;
  totalAmount: number;
  notes: string | null;
  createdAt: Date;
};

type Props = {
  orders: Order[];
  locale: string;
};

type OrderItem = {
  id: string;
  productNameSnapshot: string;
  variantSizeSnapshot: string | null;
  variantColorSnapshot: string | null;
  price: number;
  quantity: number;
  subtotal: number;
};

type DetailedOrder = Order & {
  items: OrderItem[];
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function StatusBadge(badgeProps: { status: string }) {
  const colorMap: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    confirmed: 'bg-blue-50 text-blue-800 border-blue-200',
    paid: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    shipped: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
  };

  const labelMap: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    paid: 'Paid',
    shipped: 'Shipped',
    cancelled: 'Cancelled',
  };

  return (
    <span
      className={`inline-block border px-[10px] py-[4px] text-[11px] font-semibold tracking-[0.5px] uppercase ${colorMap[badgeProps.status] ?? 'border-hairline-soft bg-soft-cloud text-stone'}`}
    >
      {labelMap[badgeProps.status] ?? badgeProps.status}
    </span>
  );
}

export function OrderTable(tableProps: Props) {
  const [selectedOrder, setSelectedOrder] = useState<DetailedOrder | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleOpenDetail(id: string) {
    setErrorMsg('');
    try {
      const data = await getOrderById(id);
      if (data) {
        // Map date since Server Actions might serialize it as string or pass it back
        setSelectedOrder({
          ...data,
          createdAt: new Date(data.createdAt),
        } as DetailedOrder);
        setNewStatus(data.status);
      }
    } catch {
      setErrorMsg('Gagal mengambil detail pesanan.');
    }
  }

  async function handleStatusChange(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedOrder) {
      return;
    }
    setUpdatingStatus(true);
    setErrorMsg('');

    try {
      const res = await updateOrderStatus(selectedOrder.id, newStatus);
      if (res.success) {
        // Refresh detail in modal
        await handleOpenDetail(selectedOrder.id);
        // Alert success or reload window
        window.location.reload();
      } else {
        const error = 'error' in res ? String(res.error) : 'Gagal mengubah status.';
        setErrorMsg(error);
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan.');
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (tableProps.orders.length === 0) {
    return (
      <div
        className="flex min-h-[200px] flex-col items-center justify-center gap-[8px] bg-canvas p-[32px] text-center"
        style={{ border: '1px solid var(--color-hairline-soft)' }}
      >
        <p className="text-body-md text-mute">Belum ada pesanan masuk.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto" style={{ border: '1px solid var(--color-hairline-soft)' }}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-soft-cloud text-left">
              <th className="text-caption-md px-[16px] py-[12px] text-ink">No. Pesanan</th>
              <th className="text-caption-md px-[16px] py-[12px] text-ink">Customer</th>
              <th className="text-caption-md px-[16px] py-[12px] text-ink">Total</th>
              <th className="text-caption-md px-[16px] py-[12px] text-ink">Status</th>
              <th className="text-caption-md px-[16px] py-[12px] text-ink">Tanggal</th>
              <th className="text-caption-md px-[16px] py-[12px] text-right text-ink">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {tableProps.orders.map((order) => (
              <tr
                key={order.id}
                className="bg-canvas hover:bg-soft-cloud/30"
                style={{ borderTop: '1px solid var(--color-hairline-soft)' }}
              >
                <td className="px-[16px] py-[14px] text-[15px] font-semibold text-ink">
                  {order.orderNumber}
                </td>
                <td className="px-[16px] py-[14px]">
                  <div className="text-[15px] text-ink">{order.customerName}</div>
                  <div className="text-[13px] text-mute">+{order.customerPhone}</div>
                </td>
                <td className="px-[16px] py-[14px] text-[15px] font-medium text-ink">
                  {formatPrice(order.totalAmount)}
                </td>
                <td className="px-[16px] py-[14px]">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-[16px] py-[14px] text-[14px] text-mute">
                  {formatDate(new Date(order.createdAt))}
                </td>
                <td className="px-[16px] py-[14px] text-right">
                  <button
                    type="button"
                    onClick={async () => {
                      await handleOpenDetail(order.id);
                    }}
                    className="cursor-pointer text-[14px] font-medium text-ink underline underline-offset-2 hover:text-black"
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Detail Order */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-[16px] backdrop-blur-sm">
          <div
            className="relative max-h-[90vh] w-full max-w-[700px] overflow-y-auto bg-canvas p-[32px] shadow-xl"
            style={{ border: '1px solid var(--color-hairline-soft)' }}
          >
            {/* Header */}
            <div className="mb-[24px] flex items-start justify-between border-b border-hairline-soft pb-[16px]">
              <div>
                <h2 className="text-heading-xl text-ink">Detail Pesanan</h2>
                <p className="text-body-md mt-[4px] text-mute">
                  No. Pesanan: <strong className="text-ink">{selectedOrder.orderNumber}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(null);
                }}
                className="cursor-pointer text-[24px] leading-none text-stone hover:text-ink"
              >
                &times;
              </button>
            </div>

            {errorMsg && (
              <div className="mb-[20px] border-l-4 border-rose-500 bg-rose-50 p-[12px] text-[14px] text-rose-800">
                {errorMsg}
              </div>
            )}

            {/* Content grid */}
            <div className="flex flex-col gap-[24px]">
              {/* Customer Info */}
              <div>
                <h3 className="text-body-strong mb-[8px] text-ink">Informasi Customer</h3>
                <div className="text-caption-md grid grid-cols-1 gap-[12px] bg-soft-cloud p-[16px] md:grid-cols-2">
                  <div>
                    <span className="block text-[12px] text-mute">Nama</span>
                    <span className="font-semibold">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="block text-[12px] text-mute">No. WhatsApp</span>
                    <span className="font-semibold">+{selectedOrder.customerPhone}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="block text-[12px] text-mute">Alamat Pengiriman</span>
                    <span className="font-medium whitespace-pre-wrap">
                      {selectedOrder.customerAddress}
                    </span>
                  </div>
                  {selectedOrder.notes && (
                    <div className="md:col-span-2">
                      <span className="block text-[12px] text-mute">Catatan</span>
                      <span className="font-medium italic">"{selectedOrder.notes}"</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-body-strong mb-[8px] text-ink">Produk yang Dipesan</h3>
                <div className="overflow-hidden border border-hairline-soft">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-caption-sm border-b border-hairline-soft bg-soft-cloud text-left text-ink">
                        <th className="px-[12px] py-[8px]">Produk</th>
                        <th className="px-[12px] py-[8px] text-center">Qty</th>
                        <th className="px-[12px] py-[8px]">Harga</th>
                        <th className="px-[12px] py-[8px] text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item) => (
                        <tr
                          key={item.id}
                          className="text-caption-md border-b border-hairline-soft text-charcoal last:border-b-0"
                        >
                          <td className="px-[12px] py-[10px]">
                            <div className="font-semibold text-ink">{item.productNameSnapshot}</div>
                            {(item.variantSizeSnapshot ?? item.variantColorSnapshot) && (
                              <div className="flex gap-[8px] text-[12px] text-mute">
                                {item.variantSizeSnapshot && (
                                  <span>Size: {item.variantSizeSnapshot}</span>
                                )}
                                {item.variantColorSnapshot && (
                                  <span>Color: {item.variantColorSnapshot}</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-[12px] py-[10px] text-center font-medium">
                            {item.quantity}
                          </td>
                          <td className="px-[12px] py-[10px] whitespace-nowrap">
                            {formatPrice(item.price)}
                          </td>
                          <td className="px-[12px] py-[10px] text-right font-semibold whitespace-nowrap text-ink">
                            {formatPrice(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-[12px] flex items-center justify-between px-[12px]">
                  <span className="text-body-strong text-ink">Total Bayar</span>
                  <span className="text-heading-lg font-semibold text-ink">
                    {formatPrice(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Actions & Status Dropdown */}
              <div className="border-t border-hairline-soft pt-[20px]">
                <form
                  onSubmit={handleStatusChange}
                  className="flex flex-col items-end gap-[16px] md:flex-row"
                >
                  <div className="flex w-full flex-col gap-[6px]">
                    <label htmlFor="status" className="text-caption-md font-medium text-ink">
                      Ubah Status Pesanan
                    </label>
                    <select
                      id="status"
                      value={newStatus}
                      onChange={(e) => {
                        setNewStatus(e.target.value);
                      }}
                      disabled={updatingStatus}
                      className="h-[48px] w-full bg-soft-cloud px-[16px] text-[15px] text-ink outline-none focus:ring-2 focus:ring-ink"
                    >
                      <option value="pending">Pending (Belum Dikonfirmasi)</option>
                      <option value="confirmed">Confirmed (Stok Dikurangi)</option>
                      <option value="paid">Paid (Sudah Bayar)</option>
                      <option value="shipped">Shipped (Sudah Dikirim)</option>
                      <option value="cancelled">Cancelled (Batalkan & Kembalikan Stok)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={updatingStatus || newStatus === selectedOrder.status}
                    className="button-primary h-[48px] w-full cursor-pointer px-[24px] whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
                  >
                    {updatingStatus ? 'Menyimpan...' : 'Perbarui Status'}
                  </button>
                </form>
                <p className="mt-[8px] text-[12px] text-mute">
                  * Mengubah ke Confirmed/Paid/Shipped akan mengurangi stok produk sesuai dengan
                  kuantiti pesanan. Mengubah ke Cancelled akan mengembalikan stok.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
