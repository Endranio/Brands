'use client';

import { useState } from 'react';
import { submitOrder } from '@/actions/orders';

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
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Format phone number to clean it up a bit if needed (e.g. remove spaces, dashes)
    let formattedPhone = customerPhone.trim().replaceAll(/[\s-]/gu, '');

    // Auto convert 08xx to 628xx if it doesn't start with 62 or +62
    if (formattedPhone.startsWith('0')) {
      formattedPhone = `62${formattedPhone.slice(1)}`;
    } else if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.slice(1);
    }

    try {
      const result = await submitOrder({
        customerName: customerName.trim(),
        customerPhone: formattedPhone,
        customerAddress: customerAddress.trim(),
        notes: notes.trim() || undefined,
        productId: props.productId,
        variantId: props.variantId ?? undefined,
        quantity: props.quantity,
      });

      if (!result.success) {
        setError(result.error ?? 'Terjadi kesalahan saat memproses pesanan.');
      } else if (result.orderNumber && result.totalAmount !== undefined && result.whatsappUrl) {
        props.onSuccess({
          orderNumber: result.orderNumber,
          totalAmount: result.totalAmount,
          whatsappUrl: result.whatsappUrl,
          customerName: customerName.trim(),
          customerPhone: formattedPhone,
          customerAddress: customerAddress.trim(),
          notes: notes.trim() || undefined,
        });
      }
    } catch {
      setError('Terjadi kesalahan jaringan atau server. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-[20px] bg-canvas p-[24px] transition-all duration-300"
      style={{ border: '1px solid var(--color-hairline-soft)' }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-heading-md text-ink">Informasi Pengiriman</h3>
        {props.onCancel && (
          <button
            type="button"
            onClick={props.onCancel}
            className="text-caption-sm cursor-pointer text-mute hover:text-ink"
          >
            Batal
          </button>
        )}
      </div>

      {error && (
        <div
          className="bg-[#fef2f2] p-[12px] text-[14px] text-sale"
          style={{ borderLeft: '3px solid var(--color-sale)' }}
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-[6px]">
        <label htmlFor="customerName" className="text-caption-md font-medium text-ink">
          Nama Lengkap <span className="text-sale">*</span>
        </label>
        <input
          id="customerName"
          type="text"
          value={customerName}
          onChange={(e) => {
            setCustomerName(e.target.value);
          }}
          placeholder="Masukkan nama penerima"
          required
          disabled={loading}
          className="h-[48px] w-full bg-soft-cloud px-[16px] text-[15px] text-ink transition-all outline-none placeholder:text-stone focus:ring-2 focus:ring-ink"
        />
      </div>

      <div className="flex flex-col gap-[6px]">
        <label htmlFor="customerPhone" className="text-caption-md font-medium text-ink">
          Nomor WhatsApp <span className="text-sale">*</span>
        </label>
        <div className="relative flex items-center">
          <input
            id="customerPhone"
            type="tel"
            value={customerPhone}
            onChange={(e) => {
              setCustomerPhone(e.target.value);
            }}
            placeholder="Contoh: 081234567890"
            required
            disabled={loading}
            className="h-[48px] w-full bg-soft-cloud px-[16px] text-[15px] text-ink transition-all outline-none placeholder:text-stone focus:ring-2 focus:ring-ink"
          />
        </div>
        <p className="text-caption-sm text-mute">
          Nomor aktif untuk konfirmasi order via WhatsApp.
        </p>
      </div>

      <div className="flex flex-col gap-[6px]">
        <label htmlFor="customerAddress" className="text-caption-md font-medium text-ink">
          Alamat Lengkap Pengiriman <span className="text-sale">*</span>
        </label>
        <textarea
          id="customerAddress"
          rows={3}
          value={customerAddress}
          onChange={(e) => {
            setCustomerAddress(e.target.value);
          }}
          placeholder="Tuliskan alamat lengkap beserta kecamatan, kota/kabupaten, dan kode pos"
          required
          disabled={loading}
          className="w-full resize-none bg-soft-cloud p-[16px] text-[15px] text-ink transition-all outline-none placeholder:text-stone focus:ring-2 focus:ring-ink"
        />
      </div>

      <div className="flex flex-col gap-[6px]">
        <label htmlFor="notes" className="text-caption-md font-medium text-ink">
          Catatan Tambahan <span className="font-normal text-mute">(opsional)</span>
        </label>
        <textarea
          id="notes"
          rows={2}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
          }}
          placeholder="Contoh: Ukuran L warna Hitam cadangan jika kosong"
          disabled={loading}
          className="w-full resize-none bg-soft-cloud p-[16px] text-[15px] text-ink transition-all outline-none placeholder:text-stone focus:ring-2 focus:ring-ink"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="button-primary mt-[8px] flex w-full cursor-pointer items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Memproses Pesanan...
          </>
        ) : (
          'Simpan & Lanjutkan'
        )}
      </button>
    </form>
  );
}
