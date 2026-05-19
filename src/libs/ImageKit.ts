import ImageKit from '@imagekit/nodejs';
import { Env } from '@/libs/Env';

const imagekit = new ImageKit({
  privateKey: Env.IMAGEKIT_PRIVATE_KEY ?? '',
});

type UploadResult = {
  url: string;
  fileId: string;
};

/**
 * Upload a file buffer to ImageKit.
 *
 * @param fileBytes - The file ArrayBuffer to upload
 * @param fileName - The desired file name
 * @param folder - The folder path in ImageKit
 * @returns The upload result with URL and fileId
 */
export async function uploadToImageKit(
  fileBytes: ArrayBuffer,
  fileName: string,
  folder: string,
): Promise<UploadResult> {
  const file = new File([fileBytes], fileName);

  const response = await imagekit.files.upload({
    file,
    fileName,
    folder,
  });

  return {
    url: response.url ?? '',
    fileId: response.fileId ?? '',
  };
}

/**
 * Delete a file from ImageKit by its fileId.
 *
 * @param fileId - The ImageKit fileId to delete
 */
export async function deleteFromImageKit(fileId: string) {
  await imagekit.files.delete(fileId);
}
