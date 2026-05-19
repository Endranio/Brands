'use client';

import { useRef, useState } from 'react';
import { updateLandingContent } from '@/actions/landingContent';

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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    props.initialData.heroImageUrl ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateLandingContent(formData);

    if (result.success) {
      setMessage({ type: 'success', text: 'Konten berhasil disimpan.' });
    } else {
      setMessage({
        type: 'error',
        text: result.error ?? 'Gagal menyimpan konten.',
      });
    }

    setLoading(false);
  }

  const inputClass =
    'h-[48px] w-full bg-soft-cloud px-[16px] text-[15px] text-ink outline-none placeholder:text-stone focus:ring-2 focus:ring-ink';

  return (
    <form
      onSubmit={handleSubmit}
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
          Hero Title
        </label>
        <input
          id="heroTitle"
          name="heroTitle"
          type="text"
          defaultValue={props.initialData.heroTitle}
          required
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-[8px]">
        <label htmlFor="heroSubtitle" className="text-caption-md text-ink">
          Hero Subtitle
        </label>
        <input
          id="heroSubtitle"
          name="heroSubtitle"
          type="text"
          defaultValue={props.initialData.heroSubtitle}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="ctaText" className="text-caption-md text-ink">
            CTA Text
          </label>
          <input
            id="ctaText"
            name="ctaText"
            type="text"
            defaultValue={props.initialData.ctaText}
            required
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="ctaLink" className="text-caption-md text-ink">
            CTA Link
          </label>
          <input
            id="ctaLink"
            name="ctaLink"
            type="text"
            defaultValue={props.initialData.ctaLink}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-[8px]">
        <label htmlFor="announcementText" className="text-caption-md text-ink">
          Announcement Text (Top Bar)
        </label>
        <input
          id="announcementText"
          name="announcementText"
          type="text"
          defaultValue={props.initialData.announcementText}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-[8px]">
        <label htmlFor="instagramUrl" className="text-caption-md text-ink">
          Instagram URL
        </label>
        <input
          id="instagramUrl"
          name="instagramUrl"
          type="text"
          defaultValue={props.initialData.instagramUrl}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="button-primary mt-[16px] self-start px-[32px] disabled:opacity-50"
      >
        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </form>
  );
}
