import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function uploadPDFToCloudinary(
  pdfBytes: Uint8Array,
  fileName: string
): Promise<{ url: string; sizeKB: number }> {
  return new Promise((resolve, reject) => {
    const buffer = Buffer.from(pdfBytes);
    const sizeKB = Math.round(buffer.length / 1024);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "syntra-reports",
        public_id: fileName,
        format: "pdf",
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve({ url: result.secure_url, sizeKB });
      }
    );

    uploadStream.end(buffer);
  });
}