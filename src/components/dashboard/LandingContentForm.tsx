'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type * as z from 'zod';
import { updateLandingContent } from '@/actions/landingContent';
import { landingContentSchema } from '@/validations/schemas';

type LandingContentValues = z.infer<typeof landingContentSchema>;

type Props = {
  initialData: {
    heroTitle?: string;
    heroSubtitle?: string;
    heroImageUrl?: string;
    ctaText?: string;
    ctaLink?: string;
    announcementText?: string;
    instagramUrl?: string;
  };
};

export function LandingContentForm(props: Props) {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    props.initialData.heroImageUrl ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LandingContentValues>({
    resolver: zodResolver(landingContentSchema),
    defaultValues: {
      heroTitle: props.initialData.heroTitle ?? '',
      heroSubtitle: props.initialData.heroSubtitle ?? '',
      ctaText: props.initialData.ctaText ?? '',
      ctaLink: props.initialData.ctaLink ?? '',
      announcementText: props.initialData.announcementText ?? '',
      instagramUrl: props.initialData.instagramUrl ?? '',
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }

  async function onSubmit(data: LandingContentValues) {
    setMessage(null);

    const formData = new FormData();
    formData.set('heroTitle', data.heroTitle);
    formData.set('heroSubtitle', data.heroSubtitle ?? '');
    formData.set('ctaText', data.ctaText);
    formData.set('ctaLink', data.ctaLink);
    formData.set('announcementText', data.announcementText ?? '');
    formData.set('instagramUrl', data.instagramUrl ?? '');

    // Append file if selected
    if (fileInputRef.current?.files?.[0]) {
      formData.set('heroImage', fileInputRef.current.files[0]);
    } else if (previewUrl === null) {
      // Indicates image was removed
      formData.set('removeHeroImage', 'true');
    }

    const result = await updateLandingContent(formData);

    if (result.success) {
      setMessage({ type: 'success', text: 'Konten berhasil disimpan.' });
    } else {
      setMessage({
        type: 'error',
        text: result.error ?? 'Gagal menyimpan konten.',
      });
    }
  }

  function inputClass(fieldName?: keyof LandingContentValues) {
    const hasError = fieldName && errors[fieldName];
    return `h-[48px] w-full bg-soft-cloud px-[16px] text-[15px] text-ink outline-none placeholder:text-stone focus:ring-2 ${hasError ? 'ring-2 ring-sale' : 'focus:ring-ink'}`;
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-[24px] bg-canvas p-[32px]"
      style={{ border: '1px solid var(--color-hairline-soft)' }}
    >
      {message && (
        <div
          className={`p-[16px] text-[15px] ${
            message.type === 'success'
              ? 'bg-[#f0fdf4] text-[#166534]'
              : 'bg-[#fef2f2] text-[#991b1b]'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Hero Image Upload */}
      <div className="flex flex-col gap-[8px]">
        <label htmlFor="heroImage" className="text-caption-md text-ink">
          Hero Image
        </label>
        {previewUrl && (
          <div className="relative h-[200px] w-full overflow-hidden bg-soft-cloud">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Hero preview" className="size-full object-cover" />
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
          {previewUrl && (
            <button
              type="button"
              onClick={() => {
                setPreviewUrl(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="px-[20px] py-[10px] text-[14px] text-mute"
              style={{ border: '1px solid var(--color-hairline-soft)' }}
            >
              Hapus
            </button>
          )}
        </div>
        <input
          id="heroImage"
          ref={fileInputRef}
          name="heroImage"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        <p className="text-[13px] text-mute">Format: JPG, PNG, atau WebP.</p>
      </div>

      <div className="flex flex-col gap-[8px]">
        <label htmlFor="heroTitle" className="text-caption-md text-ink">
          Hero Title <span className="text-sale">*</span>
        </label>
        <input
          id="heroTitle"
          {...register('heroTitle')}
          type="text"
          className={inputClass('heroTitle')}
          disabled={isSubmitting}
        />
        {errors.heroTitle && (
          <p className="text-caption-sm text-sale">{errors.heroTitle.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-[8px]">
        <label htmlFor="heroSubtitle" className="text-caption-md text-ink">
          Hero Subtitle
        </label>
        <input
          id="heroSubtitle"
          {...register('heroSubtitle')}
          type="text"
          className={inputClass()}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="ctaText" className="text-caption-md text-ink">
            CTA Text <span className="text-sale">*</span>
          </label>
          <input
            id="ctaText"
            {...register('ctaText')}
            type="text"
            className={inputClass('ctaText')}
            disabled={isSubmitting}
          />
          {errors.ctaText && <p className="text-caption-sm text-sale">{errors.ctaText.message}</p>}
        </div>
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="ctaLink" className="text-caption-md text-ink">
            CTA Link <span className="text-sale">*</span>
          </label>
          <input
            id="ctaLink"
            {...register('ctaLink')}
            type="text"
            className={inputClass('ctaLink')}
            disabled={isSubmitting}
          />
          {errors.ctaLink && <p className="text-caption-sm text-sale">{errors.ctaLink.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-[8px]">
        <label htmlFor="announcementText" className="text-caption-md text-ink">
          Announcement Text (Top Bar)
        </label>
        <input
          id="announcementText"
          {...register('announcementText')}
          type="text"
          className={inputClass()}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-col gap-[8px]">
        <label htmlFor="instagramUrl" className="text-caption-md text-ink">
          Instagram URL
        </label>
        <input
          id="instagramUrl"
          {...register('instagramUrl')}
          type="text"
          className={inputClass()}
          disabled={isSubmitting}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="button-primary mt-[16px] self-start px-[32px] disabled:opacity-50"
      >
        {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </form>
  );
}
