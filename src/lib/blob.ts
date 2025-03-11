import { put, list, del } from "@vercel/blob";

export const uploadFile = async (file: File) => {
  const blob = await put(file.name, file, {
    access: "public", // Make the file publicly accessible
  });
  return blob;
};

export const listFiles = async () => {
  const { blobs } = await list();
  return blobs;
};

export const deleteFile = async (url: string) => {
  await del(url);
};