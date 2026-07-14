const DICEBEAR_BASE_URL = "https://api.dicebear.com/9.x/fun-emoji/svg";

export function createAvatarUrl() {
  const seed = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  return `${DICEBEAR_BASE_URL}?seed=${encodeURIComponent(seed)}`;
}
