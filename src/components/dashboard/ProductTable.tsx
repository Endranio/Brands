'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
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
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(id: string, name: string) {
    try {
      setIsDeleting(true);
      await deleteProduct(id);
      toast.success(`Produk "${name}" berhasil dihapus.`);
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete product:', error);
      setIsDeleting(false);
      toast.error('Gagal menghapus produk.');
    }
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
                    className="text-ink transition-colors hover:text-stone"
                    aria-label="Edit"
                    title="Edit"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmingId(product.id);
                    }}
                    className="text-sale transition-colors hover:opacity-80"
                    aria-label="Hapus"
                    title="Hapus"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {confirmingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-[16px] backdrop-blur-sm">
          <div
            className="flex w-full max-w-[400px] flex-col gap-[16px] bg-canvas p-[24px] shadow-xl"
            style={{ border: '1px solid var(--color-hairline-soft)' }}
          >
            <h3 className="text-heading-md text-ink">Hapus Produk?</h3>
            <p className="text-body-md text-mute">
              Apakah Anda yakin ingin menghapus produk ini? Produk yang sudah dihapus tidak dapat
              ditampilkan lagi (soft delete).
            </p>
            <div className="mt-[8px] flex justify-end gap-[12px]">
              <button
                type="button"
                onClick={() => {
                  setConfirmingId(null);
                }}
                disabled={isDeleting}
                className="button-secondary px-[16px] py-[8px]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  const p = tableProps.products.find((x) => x.id === confirmingId);
                  if (p) {
                    await handleDelete(p.id, p.name);
                    setConfirmingId(null);
                  }
                }}
                disabled={isDeleting}
                className="button-primary bg-sale px-[16px] py-[8px] hover:bg-[#991b1b] disabled:opacity-50"
              >
                {isDeleting ? 'Menghapus...' : 'Hapus Produk'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
