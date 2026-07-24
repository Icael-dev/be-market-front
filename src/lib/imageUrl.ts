export function getImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/storage/products/')) {
    return url.replace('/storage/products/', '/api/images/products/');
  }
  if (url.startsWith('/')) return url;
  return `/api/images/products/${url}`;
}
