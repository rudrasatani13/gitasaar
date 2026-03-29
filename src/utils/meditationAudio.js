// src/utils/meditationAudio.js - Free Audio Library for Meditation
import { Audio } from 'expo-av';

// Free meditation audio resources
export const AUDIO_LIBRARY = {
  // Background Ambient Sounds (Loops)
  ambient: {
    rain: {
      id: 'rain',
      name: 'Rain Sounds',
      url: 'https://freesound.org/data/previews/258/258420_1474204-lq.mp3', // Rain loop
      duration: 120,
      loop: true,
      category: 'Nature',
    },
    ocean: {
      id: 'ocean',
      name: 'Ocean Waves',
      url: 'https://freesound.org/data/previews/233/233156_1015240-lq.mp3', // Ocean waves
      duration: 120,
      loop: true,
      category: 'Nature',
    },
    forest: {
      id: 'forest',
      name: 'Forest Birds',
      url: 'https://freesound.org/data/previews/416/416529_5121236-lq.mp3', // Birds chirping
      duration: 120,
      loop: true,
      category: 'Nature',
    },
    om_chant: {
      id: 'om_chant',
      name: 'Om Chanting',
      url: 'https://freesound.org/data/previews/368/368682_6546945-lq.mp3', // Om chanting
      duration: 60,
      loop: true,
      category: 'Spiritual',
    },
    singing_bowl: {
      id: 'singing_bowl',
      name: 'Singing Bowl',
      url: 'https://freesound.org/data/previews/411/411089_5121236-lq.mp3', // Tibetan bowl
      duration: 30,
      loop: true,
      category: 'Instrumental',
    },
    flute: {
      id: 'flute',
      name: 'Meditation Flute',
      url: 'https://freesound.org/data/previews/456/456966_5674468-lq.mp3', // Flute meditation
      duration: 90,
      loop: true,
      category: 'Instrumental',
    },
  },

  // Sound Effects (Non-loop)
  effects: {
    bell_start: {
      id: 'bell_start',
      name: 'Start Bell',
      url: 'https://freesound.org/data/previews/411/411090_5121236-lq.mp3', // Meditation bell
      duration: 3,
      loop: false,
    },
    bell_end: {
      id: 'bell_end',
      name: 'End Bell',
      url: 'https://freesound.org/data/previews/411/411090_5121236-lq.mp3', // Same bell
      duration: 3,
      loop: false,
    },
    chime: {
      id: 'chime',
      name: 'Mindfulness Chime',
      url: 'https://freesound.org/data/previews/411/411091_5121236-lq.mp3', // Wind chime
      duration: 5,
      loop: false,
    },
  },

  // Voice Guidance (Text-to-Speech or Pre-recorded)
  // Note: For demo, using bell sounds. In production, use actual voice recordings
  voice: {
    breathe_in: {
      id: 'breathe_in',
      text: 'Breathe in deeply',
      duration: 3,
    },
    breathe_out: {
      id: 'breathe_out',
      text: 'Breathe out slowly',
      duration: 3,
    },
    relax: {
      id: 'relax',
      text: 'Relax your body completely',
      duration: 4,
    },
    focus: {
      id: 'focus',
      text: 'Focus on your breath',
      duration: 3,
    },
    awareness: {
      id: 'awareness',
      text: 'Be aware of the present moment',
      duration: 4,
    },
  },
};

// Audio Manager Class
export class MeditationAudioManager {
  constructor() {
    this.backgroundSound = null;
    this.effectSound = null;
    this.isPlaying = false;
    this.volume = 0.7;
    this.selectedAmbient = 'rain'; // Default
  }

  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.log('Audio initialization error:', error);
    }
  }

  async playBackground(ambientId = 'rain') {
    try {
      // Unload previous background sound
      if (this.backgroundSound) {
        await this.backgroundSound.unloadAsync();
      }

      const ambient = AUDIO_LIBRARY.ambient[ambientId];
      if (!ambient) return;

      const { sound } = await Audio.Sound.createAsync(
        { uri: ambient.url },
        { 
          shouldPlay: true, 
          isLooping: ambient.loop,
          volume: this.volume * 0.6, // Background softer
        }
      );

      this.backgroundSound = sound;
      this.isPlaying = true;
      this.selectedAmbient = ambientId;

      return sound;
    } catch (error) {
      console.log('Background audio error:', error);
      return null;
    }
  }

  async playEffect(effectId) {
    try {
      const effect = AUDIO_LIBRARY.effects[effectId];
      if (!effect) return;

      // Create new sound for effect (don't interfere with background)
      const { sound } = await Audio.Sound.createAsync(
        { uri: effect.url },
        { 
          shouldPlay: true, 
          volume: this.volume,
        }
      );

      this.effectSound = sound;

      // Auto unload after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });

      return sound;
    } catch (error) {
      console.log('Effect audio error:', error);
      return null;
    }
  }

  async pauseBackground() {
    if (this.backgroundSound) {
      await this.backgroundSound.pauseAsync();
      this.isPlaying = false;
    }
  }

  async resumeBackground() {
    if (this.backgroundSound) {
      await this.backgroundSound.playAsync();
      this.isPlaying = true;
    }
  }

  async stopAll() {
    try {
      if (this.backgroundSound) {
        await this.backgroundSound.stopAsync();
        await this.backgroundSound.unloadAsync();
        this.backgroundSound = null;
      }
      if (this.effectSound) {
        await this.effectSound.stopAsync();
        await this.effectSound.unloadAsync();
        this.effectSound = null;
      }
      this.isPlaying = false;
    } catch (error) {
      console.log('Stop audio error:', error);
    }
  }

  async setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume)); // Clamp 0-1
    if (this.backgroundSound) {
      await this.backgroundSound.setVolumeAsync(this.volume * 0.6);
    }
  }

  async changeAmbient(ambientId) {
    if (this.isPlaying) {
      await this.stopAll();
      await this.playBackground(ambientId);
    } else {
      this.selectedAmbient = ambientId;
    }
  }

  getAvailableAmbients() {
    return Object.values(AUDIO_LIBRARY.ambient);
  }

  getCurrentAmbient() {
    return this.selectedAmbient;
  }
}

// Singleton instance
let audioManager = null;

export const getAudioManager = () => {
  if (!audioManager) {
    audioManager = new MeditationAudioManager();
  }
  return audioManager;
};

// Helper for voice guidance using expo-speech
import * as Speech from 'expo-speech';

export const speakGuidance = async (text, language = 'en') => {
  try {
    await Speech.speak(text, {
      language: language === 'hi' ? 'hi-IN' : 'en-US',
      pitch: 0.9,
      rate: 0.7, // Slower for meditation
      voice: 'com.apple.ttsbundle.Samantha-compact', // iOS voice
    });
  } catch (error) {
    console.log('Speech error:', error);
  }
};

export const stopSpeaking = () => {
  Speech.stop();
};
