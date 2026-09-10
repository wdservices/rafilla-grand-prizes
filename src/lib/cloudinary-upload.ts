export type CloudinaryEnv = {
  cloudName: string | undefined;
  uploadPreset: string | undefined;
  unsigned: boolean;
  hasConfig: boolean;
};

export function getCloudinaryEnv(): CloudinaryEnv {
  const cloudName =
    (typeof import.meta !== "undefined" &&
      (import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME as string | undefined)) ||
    (typeof process !== "undefined"
      ? (process.env?.VITE_CLOUDINARY_CLOUD_NAME as string | undefined)
      : undefined);
  const uploadPreset =
    (typeof import.meta !== "undefined" &&
      (import.meta.env?.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined)) ||
    (typeof process !== "undefined"
      ? (process.env?.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined)
      : undefined);

  return {
    cloudName,
    uploadPreset,
    unsigned: !!uploadPreset?.startsWith("ml_"),
    hasConfig: !!cloudName && !!uploadPreset,
  };
}

export type CloudinaryUploadResult = {
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: "image" | "video" | "raw";
  width?: number;
  height?: number;
  bytes?: number;
  created_at?: string;
  etag?: string;
};

export async function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<CloudinaryUploadResult> {
  const env = getCloudinaryEnv();
  if (!env.hasConfig || !env.cloudName || !env.uploadPreset) {
    const localUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    return {
      public_id: `local-${Date.now()}-${file.name.replace(/[^a-z0-9.-]+/gi, "_")}`,
      secure_url: localUrl,
      format: file.type.includes("png")
        ? "png"
        : file.type.includes("jpg") || file.type.includes("jpeg")
          ? "jpg"
          : (file.type.split("/")[1] ?? "png"),
      resource_type: "image",
      bytes: file.size,
    };
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", env.uploadPreset);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${env.cloudName}/auto/upload`);

    xhr.upload.addEventListener("progress", (evt) => {
      if (!evt.lengthComputable || !onProgress) return;
      onProgress(Math.round((evt.loaded / evt.total) * 100));
    });

    xhr.addEventListener("load", () => {
      try {
        const payload = JSON.parse(xhr.responseText) as CloudinaryUploadResult;
        if (!payload?.secure_url)
          throw new Error(payload?.error?.message || "Cloudinary upload failed");
        resolve(payload);
      } catch (err) {
        reject(err);
      }
    });
    xhr.addEventListener("error", () => reject(new Error("Cloudinary upload network error")));
    xhr.send(form);
  });
}

export function cloudinaryThumb(url: string, width = 520, height = 340): string {
  if (!url) return url;
  const marker = "res.cloudinary.com/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  const prefix = url.slice(0, idx + marker.length);
  const tail = url.slice(idx + marker.length);
  const nextSlash = tail.indexOf("/");
  if (nextSlash === -1) return url;
  const cloud = tail.slice(0, nextSlash);
  const rest = tail.slice(nextSlash + 1);
  const autoPart = `image/upload/c_fill,w_${width},h_${height},q_auto:good,f_auto`;
  return `${prefix}${cloud}/${autoPart}/${rest}`;
}
