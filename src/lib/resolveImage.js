/**
 * Resolves a backend-relative image path to a full URL.
 * e.g. "/uploads/seed/futsal.jpg" → "http://localhost:5001/uploads/seed/futsal.jpg"
 *
 * If the path is already a full URL (http/https/data:), it's returned as-is.
 * Falls back to the given fallback if the path is falsy.
 */
export function resolveImage(path, fallback = "/logo192.png") {
  if (!path) return fallback;
  if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) return path;
  const origin = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5001";
  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
}
