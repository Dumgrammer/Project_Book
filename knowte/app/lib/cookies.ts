/**
 * Simple cookie helpers (client-side only).
 */

export function setCookie(name: string, value: string, maxAgeSeconds?: number) {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
  if (maxAgeSeconds) {
    cookie += `; max-age=${maxAgeSeconds}`;
  }
  document.cookie = cookie;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${encodeURIComponent(name)}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function removeCookie(name: string) {
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0`;
}
