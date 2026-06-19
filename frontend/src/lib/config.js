// API base URL — used for direct asset URLs (uploads/images)
// In dev: Vite proxy handles /api and /uploads via localhost:5000
// In prod: served from the same backend domain
export const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : '');

export function resolveAssetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}
