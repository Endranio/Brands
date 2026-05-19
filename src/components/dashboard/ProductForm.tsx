'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

type Props = {
  mode: 'create' | 'edit';
  locale: string;
  initialData?: {
    id?: string;
    name?: string;
    slug?: string;
    description?: string | null;
    price?: number;
    status?: string;
    mainImageUrl?: string | null;
  };
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string; id?: string }>;
  onSuccess?: () => void;
  onCancel?: () => void;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replaceAll(/[^\w\s-]/gu, '')
    .replaceAll(/[\s_]+/gu, '-')
    .replaceAll(/^-+|-+$/gu, '');
}

export function ProductForm(props: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slug, setSlug] = useState(props.initialData?.slug ?? '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    props.initialData?.mainImageUrl ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (props.mode === 'create') {
      setSlug(slugify(e.target.value));
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.set('slug', slug);

    const result = await props.onSubmit(formData);

    if (result.success) {
      if (props.onSuccess) {
        props.onSuccess();
      } else {
        router.push(`/${props.locale}/dashboard/products`);
      }
      router.refresh();
    } else {
      setError(result.error ?? 'Terjadi kesalahan.');
    }

    setLoading(false);
  }

  const inputClass =
    'h-[48px] w-full bg-soft-cloud px-[16px] text-[15px] text-ink outline-none placeholder:text-stone focus:ring-2 focus:ring-ink';

  let submitText = 'Simpan Produk';
  if (loading) {
    submitText = 'Menyimpan...';
  } else if (props.mode !== 'create') {
    submitText = 'Update Produk';
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[24px]">
      {error && <div className="bg-[#fef2f2] p-[16px] text-[15px] text-[#991b1b]">{error}</div>}

      {/* Product Image */}
      <div className="flex flex-col gap-[8px]">
        <label htmlFor="productImage" className="text-caption-md text-ink">
          Gambar Produk
        </label>
        {previewUrl && (
          <div className="relative h-[200px] w-[200px] overflow-hidden bg-soft-cloud">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Product preview" className="size-full object-cover" />
          </div>
        )}
        <div className="flex gap-[12px]">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-ink px-[20px] py-[10px] text-[14px] text-canvas"
          >
            {previewUrl ? 'Ganti Gambar' : 'Upload Gambar'}
          </button>
        </div>
        <input
          id="productImage"
          ref={fileInputRef}
          name="productImage"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="flex flex-col gap-[8px]">
        <label htmlFor="name" className="text-caption-md text-ink">
          Nama Produk
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={props.initialData?.name}
          required
          onChange={handleNameChange}
          className={inputClass}
          placeholder="Contoh: Kaos Polos Hitam"
        />
      </div>

      <div className="flex flex-col gap-[8px]">
        <label htmlFor="slug" className="text-caption-md text-ink">
          Slug (URL)
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
          }}
          required
          className={inputClass}
          placeholder="kaos-polos-hitam"
        />
        <p className="text-[13px] text-mute">Auto-generated dari nama, bisa diedit manual.</p>
      </div>

      <div className="flex flex-col gap-[8px]">
        <label htmlFor="description" className="text-caption-md text-ink">
          Deskripsi
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={props.initialData?.description ?? ''}
          rows={4}
          className="w-full bg-soft-cloud p-[16px] text-[15px] text-ink outline-none placeholder:text-stone focus:ring-2 focus:ring-ink"
          placeholder="Deskripsi produk..."
        />
      </div>

      <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="price" className="text-caption-md text-ink">
            Harga (Rp)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            defaultValue={props.initialData?.price ?? 0}
            required
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="status" className="text-caption-md text-ink">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={props.initialData?.status ?? 'draft'}
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="flex gap-[12px]">
        <button
          type="submit"
          disabled={loading}
          className="button-primary px-[32px] disabled:opacity-50"
        >
          {submitText}
        </button>
        <button
          type="button"
          onClick={() => {
            if (props.onCancel) {
              props.onCancel();
            } else {
              router.back();
            }
          }}
          className="px-[24px] py-[12px] text-[15px] text-mute"
          style={{ border: '1px solid var(--color-hairline-soft)' }}
        >
          Batal
        </button>
      </div>
    </form>
  );
}
