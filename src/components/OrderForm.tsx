/*
 * Refactored OrderForm component to use react-hook-form with Zod validation.
 * This replaces manual useState handling with a declarative form state.
 */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { submitOrder } from '@/actions/orders';
import { orderFormSchema } from '@/validations/schemas';
import type { OrderFormValues } from '@/validations/schemas';

type OrderFormProps = {
  productId: string;
  variantId: string | null;
  quantity: number;
  onSuccess: (data: {
    orderNumber: string;
    totalAmount: number;
    whatsappUrl: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    notes?: string;
  }) => void;
  onCancel?: () => void;
};

export function OrderForm(props: OrderFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    // @ts-expect-error Zod resolver type mismatch
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      notes: undefined,
      productId: props.productId,
      variantId: props.variantId ?? undefined,
      quantity: props.quantity,
    },
  });

  async function onSubmit(data: OrderFormValues) {
    try {
      const result = await submitOrder(data);
      if (!result.success) {
        toast.error(result.error ?? 'Terjadi kesalahan saat memproses pesanan.');
        return;
      }
      if (result.orderNumber && result.totalAmount !== undefined && result.whatsappUrl) {
        props.onSuccess({
          orderNumber: result.orderNumber,
          totalAmount: result.totalAmount,
          whatsappUrl: result.whatsappUrl,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerAddress: data.customerAddress,
          notes: data.notes,
        });
      }
    } catch (error) {
      console.error('Failed to submit order:', error);
      toast.error('Terjadi kesalahan jaringan atau server. Silakan coba lagi.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-[16px] backdrop-blur-sm">
      {/* Clickable backdrop overlay */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Tutup"
        className="absolute inset-0 h-full w-full cursor-default border-0 bg-transparent outline-none"
        onClick={props.onCancel}
      />

      <div className="animate-in fade-in zoom-in-95 relative max-h-[85vh] w-full max-w-[500px] overflow-y-auto rounded-xl border border-hairline-soft bg-canvas shadow-sm">
        <form
          noValidate
          // @ts-expect-error handleSubmit type mismatch
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-[20px] p-[28px]"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-heading-md font-semibold text-ink">Informasi Pengiriman</h3>
            {props.onCancel && (
              <button
                type="button"
                onClick={props.onCancel}
                aria-label="Tutup"
                className="cursor-pointer text-mute transition-colors hover:text-ink"
              >
                <svg
                  className="h-[20px] w-[20px]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-[6px]">
            <label htmlFor="customerName" className="text-caption-md font-medium text-ink">
              Nama Lengkap <span className="text-sale">*</span>
            </label>
            <input
              id="customerName"
              type="text"
              {...register('customerName')}
              placeholder="Masukkan nama penerima"
              disabled={isSubmitting}
              className={`h-[48px] w-full bg-soft-cloud px-[16px] text-[15px] text-ink transition-all outline-none placeholder:text-stone focus:ring-2 ${errors.customerName ? 'ring-2 ring-sale' : 'focus:ring-ink'}`}
            />
            {errors.customerName && (
              <p className="text-caption-sm text-sale">{errors.customerName.message}</p>
            )}
          </div>

          {/* Customer Phone */}
          <div className="flex flex-col gap-[6px]">
            <label htmlFor="customerPhone" className="text-caption-md font-medium text-ink">
              Nomor WhatsApp <span className="text-sale">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                id="customerPhone"
                type="tel"
                {...register('customerPhone')}
                placeholder="Contoh: 081234567890"
                disabled={isSubmitting}
                className={`h-[48px] w-full bg-soft-cloud px-[16px] text-[15px] text-ink transition-all outline-none placeholder:text-stone focus:ring-2 ${errors.customerPhone ? 'ring-2 ring-sale' : 'focus:ring-ink'}`}
              />
            </div>
            {errors.customerPhone ? (
              <p className="text-caption-sm text-sale">{errors.customerPhone.message}</p>
            ) : (
              <p className="text-caption-sm text-mute">
                Nomor aktif untuk konfirmasi order via WhatsApp.
              </p>
            )}
          </div>

          {/* Customer Address */}
          <div className="flex flex-col gap-[6px]">
            <label htmlFor="customerAddress" className="text-caption-md font-medium text-ink">
              Alamat Lengkap Pengiriman <span className="text-sale">*</span>
            </label>
            <textarea
              id="customerAddress"
              rows={3}
              {...register('customerAddress')}
              placeholder="Tuliskan alamat lengkap beserta kecamatan, kota/kabupaten, dan kode pos"
              disabled={isSubmitting}
              className={`w-full resize-none bg-soft-cloud p-[16px] text-[15px] text-ink transition-all outline-none placeholder:text-stone focus:ring-2 ${errors.customerAddress ? 'ring-2 ring-sale' : 'focus:ring-ink'}`}
            />
            {errors.customerAddress && (
              <p className="text-caption-sm text-sale">{errors.customerAddress.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-[6px]">
            <label htmlFor="notes" className="text-caption-md font-medium text-ink">
              Catatan Tambahan <span className="font-normal text-mute">(opsional)</span>
            </label>
            <textarea
              id="notes"
              rows={2}
              {...register('notes')}
              placeholder="Contoh: Ukuran L warna Hitam cadangan jika kosong"
              disabled={isSubmitting}
              className="w-full resize-none bg-soft-cloud p-[16px] text-[15px] text-ink transition-all outline-none placeholder:text-stone focus:ring-2 focus:ring-ink"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="button-primary mt-[8px] flex w-full cursor-pointer items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="h-5 w-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Memproses Pesanan...
              </>
            ) : (
              'Simpan & Lanjutkan'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
