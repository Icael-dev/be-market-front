export function getImageUrl(url: string, folder = 'products'): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith(`/storage/${folder}/`)) {
    return url.replace(`/storage/${folder}/`, `/api/images/${folder}/`);
  }
  if (url.startsWith('/')) return url;
  return `/api/images/${folder}/${url}`;
}
