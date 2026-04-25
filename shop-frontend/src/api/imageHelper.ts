const API_PRODUCTS = "https://bepmam-backend.onrender.com/api/products";
const API_ORIGIN = (() => {
  try { return new URL(API_PRODUCTS).origin; } catch { return ''; }
})();

export function resolveImageUrl(hinh_anh?: string) {
  if (!hinh_anh) return '/placeholder.png';
  const trimmed = (hinh_anh || '').trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  // If it's a path like /uploads/..., or just a filename, prefix with backend origin
  if (trimmed.startsWith('/')) return `${API_ORIGIN}${trimmed}`;
  return `${API_ORIGIN}/${trimmed}`;
}

export default resolveImageUrl;
