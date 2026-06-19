import { createContext, useContext, useState, useEffect } from 'react';
import { AudioSettings, getAudioSettings, saveAudioSettings } from '@/lib/audioUtils';

interface AudioSettingsContextType {
  settings: AudioSettings;
  updateSettings: (settings: Partial<AudioSettings>) => void;
  toggleSoundEffects: () => void;
  toggleTextToSpeech: () => void;
  setVolume: (volume: number) => void;
}

const AudioSettingsContext = createContext<AudioSettingsContextType | undefined>(undefined);

export function AudioSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AudioSettings>(() => getAudioSettings());

  // Save to localStorage whenever settings change
  useEffect(() => {
    saveAudioSettings(settings);
  }, [settings]);

  const updateSettings = (newSettings: Partial<AudioSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const toggleSoundEffects = () => {
    setSettings((prev) => ({
      ...prev,
      soundEffectsEnabled: !prev.soundEffectsEnabled,
    }));
  };

  const toggleTextToSpeech = () => {
    setSettings((prev) => ({
      ...prev,
      textToSpeechEnabled: !prev.textToSpeechEnabled,
    }));
  };

  const setVolume = (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setSettings((prev) => ({
      ...prev,
      volume: clampedVolume,
    }));
  };

  const value: AudioSettingsContextType = {
    settings,
    updateSettings,
    toggleSoundEffects,
    toggleTextToSpeech,
    setVolume,
  };

  return (
    <AudioSettingsContext.Provider value={value}>
      {children}
    </AudioSettingsContext.Provider>
  );
}

export function useAudioSettings() {
  const context = useContext(AudioSettingsContext);
  if (!context) {
    throw new Error('useAudioSettings must be used within AudioSettingsProvider');
  }
  return context;
}
