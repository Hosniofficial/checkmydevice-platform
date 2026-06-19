// Backend base URL
// - Development: empty string (Vite proxy handles /uploads → localhost:5000)
// - Production:  VITE_API_URL env var set in Vercel dashboard
export const API_BASE = import.meta.env.VITE_API_URL || '';

export function resolveAssetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}
