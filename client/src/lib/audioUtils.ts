// Audio utility for sound effects and text-to-speech
// Optimized with reusable AudioContext and iOS/Safari compatibility

export interface AudioSettings {
  soundEffectsEnabled: boolean;
  textToSpeechEnabled: boolean;
  volume: number; // 0-1
}

const DEFAULT_SETTINGS: AudioSettings = {
  soundEffectsEnabled: true,
  textToSpeechEnabled: true,
  volume: 0.7,
};

// Singleton AudioContext to avoid quota issues
let audioContextInstance: AudioContext | null = null;
let audioContextInitialized = false;

// Get or create AudioContext (lazy initialization)
function getAudioContext(): AudioContext | null {
  if (!isWebAudioAvailable()) {
    return null;
  }

  try {
    if (!audioContextInstance) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextInstance = new AudioContextClass();
    }

    // Resume context if suspended (required for iOS/Safari)
    if (audioContextInstance.state === 'suspended') {
      audioContextInstance.resume().catch((error) => {
        console.warn('Could not resume AudioContext:', error);
      });
    }

    return audioContextInstance;
  } catch (error) {
    console.warn('Could not create AudioContext:', error);
    return null;
  }
}

// Initialize audio context on first user interaction (required for iOS)
export function initializeAudioContext(): void {
  if (audioContextInitialized) return;

  const context = getAudioContext();
  if (context && context.state === 'suspended') {
    // Create a dummy oscillator to wake up the context
    const osc = context.createOscillator();
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, context.currentTime);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(context.currentTime);
    osc.stop(context.currentTime + 0.001);
  }

  audioContextInitialized = true;
}

// Get audio settings from localStorage
export function getAudioSettings(): AudioSettings {
  const stored = localStorage.getItem('audioSettings');
  if (stored) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
}

// Save audio settings to localStorage
export function saveAudioSettings(settings: AudioSettings): void {
  localStorage.setItem('audioSettings', JSON.stringify(settings));
}

// Play a sound effect (optimized with reusable AudioContext)
export function playSoundEffect(type: 'correct' | 'incorrect' | 'levelComplete' | 'click'): void {
  const settings = getAudioSettings();
  if (!settings.soundEffectsEnabled) return;

  const audioContext = getAudioContext();
  if (!audioContext) {
    console.warn('AudioContext not available');
    return;
  }

  try {
    const now = audioContext.currentTime;
    const volume = settings.volume;

    switch (type) {
      case 'correct': {
        // Ascending beep for correct answer
        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc2.frequency.setValueAtTime(659.25, now); // E5

        gain.gain.setValueAtTime(volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioContext.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.2);
        osc2.stop(now + 0.2);
        break;
      }

      case 'incorrect': {
        // Descending beep for incorrect answer
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);

        gain.gain.setValueAtTime(volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }

      case 'levelComplete': {
        // Success fanfare
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
        const oscs = frequencies.map(() => audioContext.createOscillator());
        const gain = audioContext.createGain();

        oscs.forEach((osc, i) => {
          osc.frequency.setValueAtTime(frequencies[i], now);
          osc.connect(gain);
        });

        gain.gain.setValueAtTime(volume * 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        gain.connect(audioContext.destination);

        oscs.forEach((osc) => {
          osc.start(now);
          osc.stop(now + 0.5);
        });
        break;
      }

      case 'click': {
        // Soft click sound
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(volume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
    }
  } catch (error) {
    console.warn('Could not play sound effect:', error);
  }
}

// Text-to-Speech for English words (iOS/Safari compatible)
export function speakEnglishWord(word: string): void {
  const settings = getAudioSettings();
  if (!settings.textToSpeechEnabled) return;

  // Check if speech synthesis is available
  if (!isSpeechSynthesisAvailable()) {
    console.warn('Speech synthesis not available');
    return;
  }

  try {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = settings.volume;

    // iOS/Safari requires user gesture for speech
    // This function should only be called from user event handlers
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.warn('Could not speak word:', error);
  }
}

// Stop any ongoing speech
export function stopSpeech(): void {
  try {
    if (isSpeechSynthesisAvailable()) {
      window.speechSynthesis.cancel();
    }
  } catch (error) {
    console.warn('Could not stop speech:', error);
  }
}

// Check if speech synthesis is available
export function isSpeechSynthesisAvailable(): boolean {
  return 'speechSynthesis' in window;
}

// Check if Web Audio API is available
export function isWebAudioAvailable(): boolean {
  return 'AudioContext' in window || 'webkitAudioContext' in window;
}

// Get available voices for speech synthesis
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisAvailable()) {
    return [];
  }

  try {
    return window.speechSynthesis.getVoices();
  } catch (error) {
    console.warn('Could not get voices:', error);
    return [];
  }
}

// Preload voices (useful for iOS)
export function preloadVoices(): Promise<void> {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisAvailable()) {
      resolve();
      return;
    }

    // Some browsers fire voiceschanged event
    window.speechSynthesis.onvoiceschanged = () => {
      resolve();
    };

    // Timeout fallback
    setTimeout(() => {
      resolve();
    }, 1000);
  });
}

// Cleanup function to close AudioContext if needed
export function closeAudioContext(): void {
  if (audioContextInstance && audioContextInstance.state !== 'closed') {
    audioContextInstance.close().catch((error) => {
      console.warn('Could not close AudioContext:', error);
    });
    audioContextInstance = null;
    audioContextInitialized = false;
  }
}
