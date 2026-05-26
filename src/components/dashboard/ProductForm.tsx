'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type * as z from 'zod';
import { productSchema } from '@/validations/schemas';

type ProductFormValues = z.infer<typeof productSchema>;

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
    images?: { id: string; imageUrl: string }[];
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

// eslint-disable-next-line complexity
export function ProductForm(props: Props) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [existingImages, setExistingImages] = useState<{ id: string; imageUrl: string }[]>(
    props.initialData?.images ?? [],
  );
  const [newFiles, setNewFiles] = useState<{ file: File; previewUrl: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    // @ts-expect-error Zod resolver type mismatch
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: props.initialData?.name ?? '',
      slug: props.initialData?.slug ?? '',
      description: props.initialData?.description ?? '',
      price: props.initialData?.price ?? 0,
      // @ts-expect-error Type mismatch
      status: props.initialData?.status ?? 'draft',
    },
  });

  const watchName = watch('name');

  useEffect(() => {
    if (props.mode === 'create' && watchName) {
      setValue('slug', slugify(watchName), { shouldValidate: true, shouldDirty: true });
    }
  }, [watchName, props.mode, setValue]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])];
    if (files.length > 0) {
      const newItems = files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setNewFiles((prev) => [...prev, ...newItems]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function removeExistingImage(index: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => {
      const url = prev[index]?.previewUrl;
      if (url) {
        URL.revokeObjectURL(url);
      }
      return prev.filter((_, i) => i !== index);
    });
  }

  async function onSubmit(data: ProductFormValues) {
    setError('');

    const formData = new FormData();
    formData.set('name', data.name);
    formData.set('slug', data.slug);
    formData.set('description', data.description ?? '');
    formData.set('price', data.price.toString());
    formData.set('status', data.status);

    const keptImageIds = existingImages.map((img) => img.id);
    formData.set('keptImageIds', JSON.stringify(keptImageIds));

    for (const nf of newFiles) {
      formData.append('productImages', nf.file);
    }

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
  }

  function inputClass(fieldName?: keyof ProductFormValues) {
    const hasError = fieldName && errors[fieldName];
    return `h-[48px] w-full bg-soft-cloud px-[16px] text-[15px] text-ink outline-none placeholder:text-stone focus:ring-2 ${hasError ? 'ring-2 ring-sale' : 'focus:ring-ink'}`;
  }

  let submitText = 'Simpan Produk';
  if (isSubmitting) {
    submitText = 'Menyimpan...';
  } else if (props.mode !== 'create') {
    submitText = 'Update Produk';
  }

  return (
    <form
      noValidate
      // @ts-expect-error handleSubmit type mismatch
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-[24px]"
    >
      {error && <div className="bg-[#fef2f2] p-[16px] text-[15px] text-[#991b1b]">{error}</div>}

      {/* Product Image */}
      <div className="flex flex-col gap-[8px]">
        <label htmlFor="productImage" className="text-caption-md text-ink">
          Gambar Produk
        </label>
        <div className="flex flex-wrap gap-[12px]">
          {existingImages.map((img, i) => (
            <div
              key={img.id}
              className="group relative h-[120px] w-[120px] overflow-hidden bg-soft-cloud"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.imageUrl}
                alt={`Existing ${i + 1}`}
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  removeExistingImage(i);
                }}
                className="absolute top-1 right-1 flex size-[24px] items-center justify-center rounded-full bg-sale text-canvas opacity-0 transition-opacity group-hover:opacity-100"
              >
                &times;
              </button>
            </div>
          ))}
          {newFiles.map((nf, i) => (
            <div
              key={`new-${i}`}
              className="group relative h-[120px] w-[120px] overflow-hidden bg-soft-cloud"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={nf.previewUrl} alt={`New ${i + 1}`} className="size-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  removeNewFile(i);
                }}
                className="absolute top-1 right-1 flex size-[24px] items-center justify-center rounded-full bg-sale text-canvas opacity-0 transition-opacity group-hover:opacity-100"
              >
                &times;
              </button>
            </div>
          ))}
          {existingImages.length === 0 && newFiles.length === 0 && (
            <div className="flex h-[120px] w-[120px] items-center justify-center bg-soft-cloud text-[12px] text-mute">
              Belum ada gambar
            </div>
          )}
        </div>
        <div className="flex gap-[12px]">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-ink px-[20px] py-[10px] text-[14px] text-canvas"
          >
            Tambah Gambar
          </button>
        </div>
        <input
          id="productImage"
          ref={fileInputRef}
          name="productImages"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="flex flex-col gap-[8px]">
        <label htmlFor="name" className="text-caption-md text-ink">
          Nama Produk <span className="text-sale">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className={inputClass('name')}
          disabled={isSubmitting}
          placeholder="Contoh: Kaos Polos Hitam"
        />
        {errors.name && <p className="text-caption-sm text-sale">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-[8px]">
        <label htmlFor="slug" className="text-caption-md text-ink">
          Slug (URL) <span className="text-sale">*</span>
        </label>
        <input
          id="slug"
          type="text"
          {...register('slug')}
          className={inputClass('slug')}
          disabled={isSubmitting}
          placeholder="kaos-polos-hitam"
        />
        {errors.slug ? (
          <p className="text-caption-sm text-sale">{errors.slug.message}</p>
        ) : (
          <p className="text-[13px] text-mute">Auto-generated dari nama, bisa diedit manual.</p>
        )}
      </div>

      <div className="flex flex-col gap-[8px]">
        <label htmlFor="description" className="text-caption-md text-ink">
          Deskripsi
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={4}
          className="w-full bg-soft-cloud p-[16px] text-[15px] text-ink outline-none placeholder:text-stone focus:ring-2 focus:ring-ink"
          disabled={isSubmitting}
          placeholder="Deskripsi produk..."
        />
      </div>

      <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="price" className="text-caption-md text-ink">
            Harga (Rp) <span className="text-sale">*</span>
          </label>
          <input
            id="price"
            type="number"
            min="0"
            {...register('price')}
            className={inputClass('price')}
            disabled={isSubmitting}
          />
          {errors.price && <p className="text-caption-sm text-sale">{errors.price.message}</p>}
        </div>
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="status" className="text-caption-md text-ink">
            Status
          </label>
          <select
            id="status"
            {...register('status')}
            className={inputClass()}
            disabled={isSubmitting}
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
          disabled={isSubmitting}
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
