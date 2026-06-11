const RECENT_SEARCHES_KEY = "ndt-market-recent-searches";
const MAX_RECENT_SEARCHES = 8;

const normalizeKeyword = (keyword: string) => keyword.trim().replace(/\s+/g, " ");

export function getRecentSearches() {
  if (typeof window === "undefined") return [];

  try {
    const value = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(keyword: string) {
  if (typeof window === "undefined") return [];

  const normalizedKeyword = normalizeKeyword(keyword);
  if (!normalizedKeyword) return getRecentSearches();

  const nextSearches = [
    normalizedKeyword,
    ...getRecentSearches().filter((item) => item.toLowerCase() !== normalizedKeyword.toLowerCase()),
  ].slice(0, MAX_RECENT_SEARCHES);

  window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(nextSearches));
  return nextSearches;
}

export function clearRecentSearches() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(RECENT_SEARCHES_KEY);
}
