/**
 * Cloudinary upload service
 * Replaces local disk storage for report documents
 */
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// ─── Configure ────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

// Log config status on startup
const cfgOk = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;
console.log(cfgOk ? '✅ Cloudinary configured' : '⚠️ Cloudinary NOT configured — check env vars');

// ─── Multer storage using Cloudinary ─────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder:          'checkmydevice/reports',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' }, // max 1200x1200
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
    public_id: `report_${Date.now()}_${Math.random().toString(36).slice(2)}`,
  }),
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// ─── Delete file from Cloudinary ─────────────────────────────────
export async function deleteCloudinaryFile(fileUrl) {
  try {
    // Extract public_id from URL
    const match = fileUrl.match(/\/checkmydevice\/reports\/([^.]+)/);
    if (!match) return;
    const publicId = `checkmydevice/reports/${match[1]}`;
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn('[Cloudinary] Delete failed:', err.message);
  }
}

export { cloudinary };
