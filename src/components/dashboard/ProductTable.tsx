'use client';

import Link from 'next/link';
import { deleteProduct } from '@/actions/products';

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  status: string;
  createdAt: Date;
};

type Props = {
  products: Product[];
  locale: string;
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
  }).format(date);
}

function StatusBadge(badgeProps: { status: string }) {
  const colorMap: Record<string, string> = {
    active: 'bg-[#f0fdf4] text-[#166534]',
    draft: 'bg-soft-cloud text-stone',
    archived: 'bg-[#fef2f2] text-[#991b1b]',
  };

  const labelMap: Record<string, string> = {
    active: 'Active',
    draft: 'Draft',
    archived: 'Archived',
  };

  return (
    <span
      className={`inline-block px-[10px] py-[4px] text-[12px] font-medium tracking-[0.5px] uppercase ${colorMap[badgeProps.status] ?? 'bg-soft-cloud text-stone'}`}
    >
      {labelMap[badgeProps.status] ?? badgeProps.status}
    </span>
  );
}

export function ProductTable(tableProps: Props) {
  async function handleDelete(id: string, name: string) {
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(`Hapus produk "${name}"? Aksi ini tidak bisa dibatalkan.`);
    if (!confirmed) {
      return;
    }
    await deleteProduct(id);
    window.location.reload();
  }

  if (tableProps.products.length === 0) {
    return (
      <div
        className="flex min-h-[200px] flex-col items-center justify-center gap-[8px] bg-canvas p-[32px] text-center"
        style={{ border: '1px solid var(--color-hairline-soft)' }}
      >
        <p className="text-body-md text-mute">Belum ada produk.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" style={{ border: '1px solid var(--color-hairline-soft)' }}>
      <table className="w-full">
        <thead>
          <tr className="bg-soft-cloud text-left">
            <th className="text-caption-md px-[16px] py-[12px] text-ink">Nama</th>
            <th className="text-caption-md px-[16px] py-[12px] text-ink">Harga</th>
            <th className="text-caption-md px-[16px] py-[12px] text-ink">Status</th>
            <th className="text-caption-md px-[16px] py-[12px] text-ink">Tanggal</th>
            <th className="text-caption-md px-[16px] py-[12px] text-right text-ink">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {tableProps.products.map((product) => (
            <tr
              key={product.id}
              className="bg-canvas"
              style={{ borderTop: '1px solid var(--color-hairline-soft)' }}
            >
              <td className="px-[16px] py-[14px]">
                <Link
                  href={`/${tableProps.locale}/dashboard/products/${product.id}/edit`}
                  className="text-[15px] text-ink underline-offset-2 hover:underline"
                >
                  {product.name}
                </Link>
              </td>
              <td className="px-[16px] py-[14px] text-[15px] whitespace-nowrap text-ink">
                {formatPrice(product.price)}
              </td>
              <td className="px-[16px] py-[14px]">
                <StatusBadge status={product.status} />
              </td>
              <td className="px-[16px] py-[14px] text-[14px] text-mute">
                {formatDate(product.createdAt)}
              </td>
              <td className="px-[16px] py-[14px] text-right">
                <div className="flex justify-end gap-[8px]">
                  <Link
                    href={`/${tableProps.locale}/dashboard/products/${product.id}/edit`}
                    className="text-[14px] text-ink underline-offset-2 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      await handleDelete(product.id, product.name);
                    }}
                    className="text-[14px] text-sale"
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
