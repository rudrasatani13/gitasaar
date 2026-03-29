// src/theme/MantraContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MantraContext = createContext();

// Mantra Library with meanings
export const MANTRA_LIBRARY = [
  {
    id: 'gayatri',
    name: 'Gayatri Mantra',
    sanskrit: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्',
    transliteration: 'Om Bhur Bhuvah Svah, Tat Savitur Varenyam, Bhargo Devasya Dhimahi, Dhiyo Yo Nah Prachodayat',
    meaning: 'We meditate on the glory of the Creator who has created the Universe, who is worthy of worship, who is the embodiment of knowledge and light, who is the remover of all sin and ignorance. May he enlighten our intellect.',
    isPremium: false,
    category: 'Vedic',
    duration: 3,
    benefits: ['Mental clarity', 'Wisdom', 'Spiritual awakening'],
    bestTime: 'Morning',
    deity: 'Sun (Surya)',
  },
  {
    id: 'maha_mrityunjaya',
    name: 'Maha Mrityunjaya Mantra',
    sanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्',
    transliteration: 'Om Tryambakam Yajamahe Sugandhim Pushtivardhanam, Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat',
    meaning: 'We worship the three-eyed one (Lord Shiva) who is fragrant and nourishes all beings. May he liberate us from death for the sake of immortality, just as the ripe cucumber is severed from the bondage of the stem.',
    isPremium: true,
    category: 'Healing',
    duration: 4,
    benefits: ['Healing', 'Overcoming fear of death', 'Protection', 'Longevity'],
    bestTime: 'Anytime',
    deity: 'Shiva',
  },
  {
    id: 'om',
    name: 'Om / Aum',
    sanskrit: 'ॐ',
    transliteration: 'Om',
    meaning: 'Om is the primordial sound of the universe. It represents the past, present, and future, and transcends time itself. It is the sound of Brahman, the ultimate reality.',
    isPremium: false,
    category: 'Universal',
    duration: 1,
    benefits: ['Inner peace', 'Connection to universe', 'Meditation depth'],
    bestTime: 'Anytime',
    deity: 'Universal',
  },
  {
    id: 'ganesh',
    name: 'Ganesh Mantra',
    sanskrit: 'ॐ गं गणपतये नमः',
    transliteration: 'Om Gam Ganapataye Namaha',
    meaning: 'Salutations to Lord Ganesha, the remover of obstacles.',
    isPremium: false,
    category: 'Success',
    duration: 2,
    benefits: ['Remove obstacles', 'New beginnings', 'Success in endeavors'],
    bestTime: 'Before new tasks',
    deity: 'Ganesha',
  },
  {
    id: 'krishna_mantra',
    name: 'Krishna Mantra',
    sanskrit: 'ॐ नमो भगवते वासुदेवाय',
    transliteration: 'Om Namo Bhagavate Vasudevaya',
    meaning: 'I bow to Lord Krishna, the divine one, son of Vasudeva.',
    isPremium: true,
    category: 'Devotion',
    duration: 3,
    benefits: ['Divine love', 'Devotion', 'Inner joy', 'Krishna consciousness'],
    bestTime: 'Morning/Evening',
    deity: 'Krishna',
  },
  {
    id: 'hanuman_chalisa_excerpt',
    name: 'Hanuman Beej Mantra',
    sanskrit: 'ॐ हं हनुमते नमः',
    transliteration: 'Om Ham Hanumate Namaha',
    meaning: 'Salutations to Lord Hanuman, the epitome of strength and devotion.',
    isPremium: true,
    category: 'Strength',
    duration: 2,
    benefits: ['Courage', 'Strength', 'Overcome fear', 'Protection'],
    bestTime: 'Tuesday/Saturday',
    deity: 'Hanuman',
  },
  {
    id: 'lakshmi',
    name: 'Lakshmi Mantra',
    sanskrit: 'ॐ श्रीं महालक्ष्म्यै नमः',
    transliteration: 'Om Shreem Mahalakshmyai Namaha',
    meaning: 'Salutations to Goddess Lakshmi, the bestower of wealth and prosperity.',
    isPremium: true,
    category: 'Prosperity',
    duration: 2,
    benefits: ['Prosperity', 'Abundance', 'Material & spiritual wealth'],
    bestTime: 'Friday',
    deity: 'Lakshmi',
  },
  {
    id: 'saraswati',
    name: 'Saraswati Mantra',
    sanskrit: 'ॐ ऐं सरस्वत्यै नमः',
    transliteration: 'Om Aim Saraswatyai Namaha',
    meaning: 'Salutations to Goddess Saraswati, the goddess of knowledge and arts.',
    isPremium: true,
    category: 'Knowledge',
    duration: 2,
    benefits: ['Knowledge', 'Learning', 'Creativity', 'Music & arts'],
    bestTime: 'Morning',
    deity: 'Saraswati',
  },
  {
    id: 'shanti_mantra',
    name: 'Shanti Mantra',
    sanskrit: 'ॐ सर्वेषां स्वस्तिर्भवतु । सर्वेषां शान्तिर्भवतु । सर्वेषां पूर्णं भवतु । सर्वेषां मङ्गलं भवतु । ॐ शान्तिः शान्तिः शान्तिः ॥',
    transliteration: 'Om Sarvesham Svastir Bhavatu, Sarvesham Shantir Bhavatu, Sarvesham Poornam Bhavatu, Sarvesham Mangalam Bhavatu, Om Shanti Shanti Shanti',
    meaning: 'May there be well-being in all, May there be peace in all, May there be fullness in all, May there be prosperity in all. Om Peace, Peace, Peace.',
    isPremium: false,
    category: 'Peace',
    duration: 3,
    benefits: ['Universal peace', 'Compassion', 'Well-being for all'],
    bestTime: 'Anytime',
    deity: 'Universal',
  },
  {
    id: 'surya',
    name: 'Surya Beej Mantra',
    sanskrit: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः',
    transliteration: 'Om Hram Hreem Hroum Sah Suryaya Namaha',
    meaning: 'Salutations to the Sun God, the sustainer of life.',
    isPremium: true,
    category: 'Energy',
    duration: 3,
    benefits: ['Vitality', 'Energy', 'Confidence', 'Health'],
    bestTime: 'Sunrise',
    deity: 'Surya (Sun)',
  },
];

export function MantraProvider({ children }) {
  const [chantingSessions, setChantingSessions] = useState([]);
  const [favoriteMantras, setFavoriteMantras] = useState([]);
  const [totalChants, setTotalChants] = useState(0);

  useEffect(() => {
    loadMantraData();
  }, []);

  const loadMantraData = async () => {
    try {
      const stored = await AsyncStorage.getItem('@mantra_data');
      if (stored) {
        const data = JSON.parse(stored);
        setChantingSessions(data.sessions || []);
        setFavoriteMantras(data.favorites || []);
        setTotalChants(data.totalChants || 0);
      }
    } catch (e) {
      console.log('Error loading mantra data:', e);
    }
  };

  const saveMantraData = async (sessions, favs, chants) => {
    try {
      await AsyncStorage.setItem('@mantra_data', JSON.stringify({
        sessions,
        favorites: favs,
        totalChants: chants,
      }));
    } catch (e) {
      console.log('Error saving mantra data:', e);
    }
  };

  const addChantingSession = async (mantraId, repetitions, duration) => {
    const newSession = {
      id: Date.now().toString(),
      mantraId,
      repetitions,
      duration,
      completedAt: new Date().toISOString(),
    };
    const updatedSessions = [newSession, ...chantingSessions];
    const updatedChants = totalChants + repetitions;
    setChantingSessions(updatedSessions);
    setTotalChants(updatedChants);
    await saveMantraData(updatedSessions, favoriteMantras, updatedChants);
    return newSession;
  };

  const toggleMantraFavorite = async (mantraId) => {
    const updated = favoriteMantras.includes(mantraId)
      ? favoriteMantras.filter(id => id !== mantraId)
      : [...favoriteMantras, mantraId];
    setFavoriteMantras(updated);
    await saveMantraData(chantingSessions, updated, totalChants);
  };

  const value = {
    chantingSessions,
    favoriteMantras,
    totalChants,
    addChantingSession,
    toggleMantraFavorite,
  };

  return <MantraContext.Provider value={value}>{children}</MantraContext.Provider>;
}

export function useMantras() {
  return useContext(MantraContext);
}
