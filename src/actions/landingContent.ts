'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/libs/DB';
import { deleteFromImageKit, uploadToImageKit } from '@/libs/ImageKit';
import { landingContentsSchema } from '@/models/Schema';

/**
 * Safely extract a string value from FormData.
 *
 * @param formData - The FormData object
 * @param key - The key to extract
 * @returns The string value or empty string
 */
function getStr(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function getLandingContent() {
  const content = await db
    .select()
    .from(landingContentsSchema)
    .where(eq(landingContentsSchema.isActive, true))
    .limit(1);

  if (content.length > 0) {
    return content[0];
  }

  return null;
}

export async function updateLandingContent(formData: FormData) {
  const heroTitle = getStr(formData, 'heroTitle');
  const heroSubtitle = getStr(formData, 'heroSubtitle');
  const ctaText = getStr(formData, 'ctaText');
  const ctaLink = getStr(formData, 'ctaLink');
  const announcementText = getStr(formData, 'announcementText');
  const instagramUrl = getStr(formData, 'instagramUrl');
  const heroImageFile = formData.get('heroImage');

  if (!heroTitle || !ctaText || !ctaLink) {
    return { success: false, error: 'Hero title, CTA text, dan CTA link harus diisi.' };
  }

  let heroImageUrl: string | undefined;
  let heroImageKey: string | undefined;

  // Handle hero image upload
  if (heroImageFile instanceof File && heroImageFile.size > 0) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(heroImageFile.type)) {
      return { success: false, error: 'Format gambar harus JPG, PNG, atau WebP.' };
    }

    const buffer = await heroImageFile.arrayBuffer();
    const result = await uploadToImageKit(buffer, heroImageFile.name, '/landing');
    heroImageUrl = result.url;
    heroImageKey = result.fileId;
  }

  const currentContent = await db
    .select()
    .from(landingContentsSchema)
    .where(eq(landingContentsSchema.isActive, true))
    .limit(1);

  const updateData: Record<string, unknown> = {
    heroTitle,
    heroSubtitle,
    ctaText,
    ctaLink,
    announcementText,
    instagramUrl,
  };

  // Only update image fields if a new image was uploaded
  if (heroImageUrl) {
    updateData.heroImageUrl = heroImageUrl;
    updateData.heroImageKey = heroImageKey;

    // Delete old image from ImageKit if exists
    const [existing] = currentContent;
    if (existing?.heroImageKey) {
      try {
        await deleteFromImageKit(existing.heroImageKey);
      } catch {
        // Ignore deletion errors for old images
      }
    }
  }

  await (currentContent.length > 0 && currentContent[0]
    ? db
        .update(landingContentsSchema)
        .set(updateData)
        .where(eq(landingContentsSchema.id, currentContent[0].id))
    : db.insert(landingContentsSchema).values({
        heroTitle,
        heroSubtitle,
        heroImageUrl: heroImageUrl ?? null,
        heroImageKey: heroImageKey ?? null,
        ctaText,
        ctaLink,
        announcementText,
        instagramUrl,
        isActive: true,
      }));

  revalidatePath('/dashboard/landing');
  revalidatePath('/');

  return { success: true };
}
