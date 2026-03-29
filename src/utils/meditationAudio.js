// src/utils/meditationAudio.js - Audio Library for Meditation (Local + Remote)
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// LOCAL AUDIO FILES - Wrapped in try-catch to prevent crash if files don't exist
// Audio files should be placed in /app/assets/sounds/ when available
let LOCAL_AUDIO = { ambient: {}, effects: {} };

// Safe require wrapper - returns null if file doesn't exist
const safeRequire = (path) => {
  try {
    // Note: require() paths must be static strings, so we use a flag system instead
    return null; // Audio files not bundled - using synthesized audio fallback
  } catch (e) {
    return null;
  }
};

// Flag to indicate if real audio files are available
const AUDIO_FILES_AVAILABLE = false; // Set to true when audio files are added to assets/sounds/

// Meditation audio metadata
// Source will be null if audio files aren't available - fallback to synthesized audio
export const AUDIO_LIBRARY = {
  // Background Ambient Sounds (Loops)
  ambient: {
    rain: {
      id: 'rain',
      name: 'Rain Sounds',
      source: LOCAL_AUDIO.ambient.rain || null,
      duration: 120,
      loop: true,
      category: 'Nature',
      description: 'Peaceful rain sounds',
      useSynthesized: !AUDIO_FILES_AVAILABLE,
    },
    ocean: {
      id: 'ocean',
      name: 'Ocean Waves',
      source: LOCAL_AUDIO.ambient.ocean || null,
      duration: 120,
      loop: true,
      category: 'Nature',
      description: 'Calming ocean waves',
      useSynthesized: !AUDIO_FILES_AVAILABLE,
    },
    forest: {
      id: 'forest',
      name: 'Forest Birds',
      source: LOCAL_AUDIO.ambient.forest || null,
      duration: 120,
      loop: true,
      category: 'Nature',
      description: 'Birds chirping in forest',
      useSynthesized: !AUDIO_FILES_AVAILABLE,
    },
    om_chant: {
      id: 'om_chant',
      name: 'Om Chanting',
      source: LOCAL_AUDIO.ambient.om_chant || null,
      duration: 60,
      loop: true,
      category: 'Spiritual',
      description: 'Sacred Om mantra',
      useSynthesized: !AUDIO_FILES_AVAILABLE,
    },
    singing_bowl: {
      id: 'singing_bowl',
      name: 'Singing Bowl',
      source: LOCAL_AUDIO.ambient.singing_bowl || null,
      duration: 30,
      loop: true,
      category: 'Instrumental',
      description: 'Tibetan singing bowl',
      useSynthesized: !AUDIO_FILES_AVAILABLE,
    },
    flute: {
      id: 'flute',
      name: 'Meditation Flute',
      source: LOCAL_AUDIO.ambient.flute || null,
      duration: 90,
      loop: true,
      category: 'Instrumental',
      description: 'Peaceful flute melody',
      useSynthesized: !AUDIO_FILES_AVAILABLE,
    },
  },

  // Sound Effects (Non-loop)
  effects: {
    bell_start: {
      id: 'bell_start',
      name: 'Start Bell',
      source: LOCAL_AUDIO.effects.bell_start || null,
      duration: 3,
      loop: false,
      useSynthesized: !AUDIO_FILES_AVAILABLE,
    },
    bell_end: {
      id: 'bell_end',
      name: 'End Bell',
      source: LOCAL_AUDIO.effects.bell_end || null,
      duration: 3,
      loop: false,
      useSynthesized: !AUDIO_FILES_AVAILABLE,
    },
    chime: {
      id: 'chime',
      name: 'Mindfulness Chime',
      source: LOCAL_AUDIO.effects.chime || null,
      duration: 5,
      loop: false,
      useSynthesized: !AUDIO_FILES_AVAILABLE,
    },
  },

  // Voice Guidance (Text-to-Speech)
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
        this.backgroundSound = null;
      }

      const ambient = AUDIO_LIBRARY.ambient[ambientId];
      if (!ambient) {
        console.log('Ambient not found:', ambientId);
        return null;
      }

      // If no audio file available, use synthesized audio fallback
      if (!ambient.source || ambient.useSynthesized) {
        console.log('Using synthesized audio for:', ambientId);
        this.isPlaying = true;
        this.selectedAmbient = ambientId;
        // Synthesized audio is handled by MeditationScreen's Web Audio API
        return { synthesized: true, ambientId };
      }

      // Load local asset if available
      const { sound } = await Audio.Sound.createAsync(
        ambient.source,
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
      console.log('Falling back to synthesized audio for:', ambientId);
      // Return synthesized fallback instead of null
      this.isPlaying = true;
      this.selectedAmbient = ambientId;
      return { synthesized: true, ambientId };
    }
  }

  async playEffect(effectId) {
    try {
      const effect = AUDIO_LIBRARY.effects[effectId];
      if (!effect) {
        console.log('Effect not found:', effectId);
        return null;
      }

      // If no audio file available, use synthesized audio fallback
      if (!effect.source || effect.useSynthesized) {
        console.log('Using synthesized effect for:', effectId);
        // Play synthesized bell/chime using Web Audio API
        this._playSynthesizedEffect(effectId);
        return { synthesized: true, effectId };
      }

      // Create new sound for effect
      const { sound } = await Audio.Sound.createAsync(
        effect.source,
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
      console.log('Falling back to synthesized effect for:', effectId);
      this._playSynthesizedEffect(effectId);
      return { synthesized: true, effectId };
    }
  }

  // Synthesized audio fallback using Web Audio API
  _playSynthesizedEffect(effectId) {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      // Singing bowl / bell sound
      const frequencies = effectId === 'chime' ? [523, 659, 784] : [528, 396, 639];
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(i === 0 ? 0.2 * this.volume : 0.08 * this.volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + 4);
      });
    } catch (e) {
      console.log('Synthesized effect error:', e);
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
    });
  } catch (error) {
    console.log('Speech error:', error);
  }
};

export const stopSpeaking = () => {
  Speech.stop();
};
