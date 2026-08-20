/**
 * Safely format image URLs to bypass ISP blocks, CORS restrictions,
 * and hotlink protections (especially for Reddit i.redd.it / preview.redd.it).
 * Routes through internal /api/proxy-image endpoint.
 */
export function getSafeImageUrl(url: string): string {
  if (!url) return "";

  // If already a local data URL or blob or internal path, return as-is
  if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("/api/proxy-image")) {
    return url;
  }

  // For Reddit or external images that might be blocked by local ISPs or hotlink protection
  if (
    url.includes("i.redd.it") ||
    url.includes("preview.redd.it") ||
    url.includes("reddit.com") ||
    url.includes("imgur.com")
  ) {
    const cleanUrl = url.replace(/&amp;/g, "&");
    return `/api/proxy-image?url=${encodeURIComponent(cleanUrl)}`;
  }

  return url;
}
