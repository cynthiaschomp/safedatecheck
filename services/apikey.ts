// BYOK — Bring Your Own Key
// Gemini API key is stored client-side only, never transmitted to any server.

const STORAGE_KEY = 'safedate_gemini_key';

export const getStoredApiKey = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setStoredApiKey = (key: string): void => {
  try {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } catch (e) {
    console.error('Failed to store API key', e);
  }
};

export const clearStoredApiKey = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

export const hasApiKey = (): boolean => {
  const key = getStoredApiKey();
  return !!key && key.length > 10;
};
