// src/theme/useTranslation.js
import { useProfile } from './ProfileContext';
import { t } from './translations';

export function useTranslation() {
  const { profile } = useProfile();
  const lang = profile.language || 'hinglish';

  // Returns translated string for a given key
  const tr = (key) => t(key, lang);

  return { tr, lang };
}