'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type * as z from 'zod';
import { addVariant, deleteVariant, updateVariant } from '@/actions/products';
import { variantSchema } from '@/validations/schemas';

type VariantFormValues = z.infer<typeof variantSchema>;

type Variant = {
  id: string;
  productId: string;
  size: string;
  color: string | null;
  stock: number;
  price: number | null;
  isActive: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  productId: string;
  initialVariants: Variant[];
};

export function VariantManager(props: Props) {
  const router = useRouter();

  const [loadingState, setLoadingState] = useState(false);
  const [isPending, startTransition] = useTransition();
  const loading = loadingState || isPending;
  const [error, setError] = useState('');

  // Form for adding new variant
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VariantFormValues>({
    // @ts-expect-error Zod resolver type mismatch
    resolver: zodResolver(variantSchema),
    defaultValues: {
      productId: props.productId,
      size: '',
      color: '',
      stock: 0,
    },
  });

  // State for editing existing variant
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [editSize, setEditSize] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editStock, setEditStock] = useState('0');
  const [editPrice, setEditPrice] = useState('');

  function onAddSubmit(data: VariantFormValues) {
    setError('');

    startTransition(async () => {
      const result = await addVariant(data);

      if (result.success) {
        reset(); // clear form
        router.refresh();
      } else {
        setError(result.error ?? 'Gagal menambah varian');
      }
    });
  }

  function startEdit(variant: Variant) {
    setEditingId(variant.id);
    setEditSize(variant.size);
    setEditColor(variant.color ?? '');
    setEditStock(variant.stock.toString());
    setEditPrice(variant.price?.toString() ?? '');
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function handleUpdate(id: string) {
    setLoadingState(true);
    setError('');

    startTransition(async () => {
      const result = await updateVariant(id, {
        productId: props.productId,
        size: editSize.trim(),
        color: editColor.trim() || undefined,
        stock: Number.parseInt(editStock, 10),
        price: editPrice ? Number.parseInt(editPrice, 10) : undefined,
      });

      if (result.success) {
        setEditingId(null);
        router.refresh();
      } else {
        setError(result.error ?? 'Gagal menyimpan varian');
      }
      setLoadingState(false);
    });
  }

  function handleDelete(id: string) {
    setLoadingState(true);
    setError('');

    startTransition(async () => {
      const result = await deleteVariant(id);

      if (result.success) {
        toast.success('Varian berhasil dihapus');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Gagal menghapus varian');
      }
      setLoadingState(false);
    });
  }

  const inputClass =
    'h-[40px] w-full bg-soft-cloud px-[12px] text-[14px] text-ink outline-none placeholder:text-stone focus:ring-2 focus:ring-ink';

  return (
    <div className="flex flex-col gap-[24px]">
      {error && <div className="bg-[#fef2f2] p-[16px] text-[15px] text-[#991b1b]">{error}</div>}

      {/* Table of Variants */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-soft-cloud text-mute">
            <tr>
              <th className="px-[16px] py-[12px] font-medium">Ukuran</th>
              <th className="px-[16px] py-[12px] font-medium">Warna</th>
              <th className="px-[16px] py-[12px] font-medium">Stok</th>
              <th className="px-[16px] py-[12px] font-medium">Harga</th>
              <th className="px-[16px] py-[12px] font-medium">Status</th>
              <th className="px-[16px] py-[12px] text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {props.initialVariants.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-[16px] py-[24px] text-center text-mute">
                  Belum ada varian. Silakan tambahkan di bawah.
                </td>
              </tr>
            ) : (
              props.initialVariants.map((variant) => (
                <tr key={variant.id} className="border-b border-hairline-soft">
                  {editingId === variant.id ? (
                    // EDIT MODE
                    <>
                      <td className="px-[16px] py-[12px]">
                        <input
                          type="text"
                          value={editSize}
                          onChange={(e) => {
                            setEditSize(e.target.value);
                          }}
                          className={inputClass}
                          disabled={loading}
                          placeholder="Contoh: XL"
                        />
                      </td>
                      <td className="px-[16px] py-[12px]">
                        <input
                          type="text"
                          value={editColor}
                          onChange={(e) => {
                            setEditColor(e.target.value);
                          }}
                          className={inputClass}
                          disabled={loading}
                          placeholder="Contoh: Hitam"
                        />
                      </td>
                      <td className="px-[16px] py-[12px]">
                        <input
                          type="number"
                          min="0"
                          value={editStock}
                          onChange={(e) => {
                            setEditStock(e.target.value);
                          }}
                          className={inputClass}
                          disabled={loading}
                        />
                      </td>
                      <td className="px-[16px] py-[12px]">
                        <input
                          type="number"
                          min="0"
                          value={editPrice}
                          onChange={(e) => {
                            setEditPrice(e.target.value);
                          }}
                          className={inputClass}
                          disabled={loading}
                          placeholder="Harga produk"
                        />
                      </td>
                      <td className="px-[16px] py-[12px] text-charcoal">
                        {variant.isActive ? 'Aktif' : 'Terhapus'}
                      </td>
                      <td className="px-[16px] py-[12px] text-right">
                        <div className="flex justify-end gap-[8px]">
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdate(variant.id);
                            }}
                            disabled={loading}
                            className="font-medium text-ink hover:underline disabled:opacity-50"
                          >
                            Simpan
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={loading}
                            className="text-mute hover:underline disabled:opacity-50"
                          >
                            Batal
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // VIEW MODE
                    <>
                      <td className="px-[16px] py-[16px] text-ink">{variant.size}</td>
                      <td className="px-[16px] py-[16px] text-charcoal">{variant.color ?? '-'}</td>
                      <td className="px-[16px] py-[16px] text-ink">{variant.stock}</td>
                      <td className="px-[16px] py-[16px] text-ink">
                        {variant.price !== null && variant.price !== undefined ? (
                          new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(variant.price)
                        ) : (
                          <span className="text-[12px] text-mute">Ikut Produk</span>
                        )}
                      </td>
                      <td className="px-[16px] py-[16px]">
                        {variant.isActive ? (
                          <span className="inline-flex items-center rounded-full bg-[#ecfdf5] px-[8px] py-[2px] text-[12px] font-medium text-[#065f46]">
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-[#fef2f2] px-[8px] py-[2px] text-[12px] font-medium text-[#991b1b]">
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="px-[16px] py-[16px] text-right">
                        <div className="flex justify-end gap-[12px]">
                          <button
                            type="button"
                            onClick={() => {
                              startEdit(variant);
                            }}
                            disabled={loading || !variant.isActive}
                            className="text-ink hover:underline disabled:opacity-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmingId(variant.id);
                            }}
                            disabled={loading || !variant.isActive}
                            className="text-sale hover:underline disabled:opacity-50"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Variant Form */}
      <form
        noValidate
        // @ts-expect-error handleSubmit type mismatch
        onSubmit={handleSubmit(onAddSubmit)}
        className="flex flex-col gap-[16px] bg-soft-cloud p-[24px]"
      >
        <h4 className="text-body-strong text-ink">Tambah Varian Baru</h4>
        <div className="grid grid-cols-1 gap-[16px] md:grid-cols-5 md:items-end">
          <div className="flex flex-col gap-[6px]">
            <label htmlFor="size" className="text-caption-md text-ink">
              Ukuran <span className="text-sale">*</span>
            </label>
            <input
              id="size"
              type="text"
              {...register('size')}
              className={`${inputClass} ${errors.size ? 'ring-2 ring-sale' : ''}`}
              placeholder="Contoh: L, XL, All Size"
              disabled={isSubmitting}
            />
            {errors.size && <p className="text-caption-sm text-sale">{errors.size.message}</p>}
          </div>
          <div className="flex flex-col gap-[6px]">
            <label htmlFor="color" className="text-caption-md text-ink">
              Warna
            </label>
            <input
              id="color"
              type="text"
              {...register('color')}
              className={inputClass}
              placeholder="Contoh: Hitam"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex flex-col gap-[6px]">
            <label htmlFor="stock" className="text-caption-md text-ink">
              Stok <span className="text-sale">*</span>
            </label>
            <input
              id="stock"
              type="number"
              min="0"
              {...register('stock', { valueAsNumber: true })}
              className={`${inputClass} ${errors.stock ? 'ring-2 ring-sale' : ''}`}
              disabled={isSubmitting}
            />
            {errors.stock && <p className="text-caption-sm text-sale">{errors.stock.message}</p>}
          </div>
          <div className="flex flex-col gap-[6px]">
            <label htmlFor="price" className="text-caption-md text-ink">
              Harga
            </label>
            <input
              id="price"
              type="number"
              min="0"
              {...register('price')}
              className={`${inputClass} ${errors.price ? 'ring-2 ring-sale' : ''}`}
              placeholder="Default produk"
              disabled={isSubmitting}
            />
            {errors.price && <p className="text-caption-sm text-sale">{errors.price.message}</p>}
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="button-primary h-[40px] w-full px-[16px] disabled:opacity-50"
            >
              Tambah
            </button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {confirmingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-[16px] backdrop-blur-sm">
          <div
            className="flex w-full max-w-[400px] flex-col gap-[16px] bg-canvas p-[24px] shadow-xl"
            style={{ border: '1px solid var(--color-hairline-soft)' }}
          >
            <h3 className="text-heading-md text-ink">Hapus Varian?</h3>
            <p className="text-body-md text-mute">
              Apakah Anda yakin ingin menghapus varian ini? Varian yang dihapus tidak dapat dibeli
              lagi.
            </p>
            <div className="mt-[8px] flex justify-end gap-[12px]">
              <button
                type="button"
                onClick={() => {
                  setConfirmingId(null);
                }}
                disabled={loading}
                className="button-secondary px-[16px] py-[8px]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDelete(confirmingId);
                  setConfirmingId(null);
                }}
                disabled={loading}
                className="button-primary bg-sale px-[16px] py-[8px] hover:bg-[#991b1b] disabled:opacity-50"
              >
                {loading ? 'Menghapus...' : 'Hapus Varian'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
