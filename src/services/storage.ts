import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';

export type UploadCategory = 'posts' | 'avatars' | 'homework' | 'misc';

export const uploadUserFile = async (
  userId: string,
  category: UploadCategory,
  fileName: string,
  data: Uint8Array | ArrayBuffer,
): Promise<string> => {
  const path = `user_uploads/${userId}/${category}/${fileName}`; // matches provided rules
  const storageRef = ref(storage, path);
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  await uploadBytes(storageRef, bytes, { contentType: guessContentType(fileName) });
  return getDownloadURL(storageRef);
};

export const uploadUserFileBase64 = async (
  userId: string,
  category: UploadCategory,
  fileName: string,
  base64Data: string,
): Promise<string> => {
  const path = `user_uploads/${userId}/${category}/${fileName}`;
  const storageRef = ref(storage, path);
  await uploadString(storageRef, base64Data, 'base64', { contentType: guessContentType(fileName) });
  return getDownloadURL(storageRef);
};

const guessContentType = (fileName: string): string | undefined => {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.mp4')) return 'video/mp4';
  return undefined;
};



