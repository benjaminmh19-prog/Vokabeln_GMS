import { useAudioSettings } from '@/contexts/AudioSettingsContext';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export default function AudioSettingsPanel() {
  const { settings, toggleSoundEffects, toggleTextToSpeech, setVolume } = useAudioSettings();

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl border-3 border-[#3D4B9E] shadow-lg">
      <h2 className="arcade-title text-[#3D4B9E] text-2xl">AUDIO-EINSTELLUNGEN</h2>

      {/* Sound Effects Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 text-lg font-bold text-[#3D4B9E]">
            {settings.soundEffectsEnabled ? (
              <Volume2 className="w-6 h-6 text-[#7FD9A8]" />
            ) : (
              <VolumeX className="w-6 h-6 text-[#F07070]" />
            )}
            Sound-Effekte
          </label>
          <Button
            onClick={toggleSoundEffects}
            className={`px-6 py-2 font-bold rounded-lg border-2 transition-all ${
              settings.soundEffectsEnabled
                ? 'bg-[#7FD9A8] border-[#3D4B9E] text-[#3D4B9E] hover:bg-[#6BCB77]'
                : 'bg-[#F0E5D8] border-[#3D4B9E] text-[#3D4B9E] hover:bg-[#E0D5C8]'
            }`}
          >
            {settings.soundEffectsEnabled ? 'AN' : 'AUS'}
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          {settings.soundEffectsEnabled
            ? 'Sound-Effekte sind aktiviert'
            : 'Sound-Effekte sind deaktiviert'}
        </p>
      </div>

      {/* Text-to-Speech Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 text-lg font-bold text-[#3D4B9E]">
            {settings.textToSpeechEnabled ? (
              <Mic className="w-6 h-6 text-[#FFB366]" />
            ) : (
              <MicOff className="w-6 h-6 text-[#F07070]" />
            )}
            Sprachausgabe
          </label>
          <Button
            onClick={toggleTextToSpeech}
            className={`px-6 py-2 font-bold rounded-lg border-2 transition-all ${
              settings.textToSpeechEnabled
                ? 'bg-[#FFB366] border-[#3D4B9E] text-[#3D4B9E] hover:bg-[#FFA050]'
                : 'bg-[#F0E5D8] border-[#3D4B9E] text-[#3D4B9E] hover:bg-[#E0D5C8]'
            }`}
          >
            {settings.textToSpeechEnabled ? 'AN' : 'AUS'}
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          {settings.textToSpeechEnabled
            ? 'Englische Wörter werden laut vorgelesen'
            : 'Sprachausgabe ist deaktiviert'}
        </p>
      </div>

      {/* Volume Slider */}
      <div className="space-y-3">
        <label className="block text-lg font-bold text-[#3D4B9E]">Lautstärke</label>
        <div className="flex items-center gap-4">
          <Slider
            value={[settings.volume]}
            onValueChange={(value) => setVolume(value[0])}
            min={0}
            max={1}
            step={0.1}
            className="flex-1"
          />
          <span className="text-sm font-bold text-[#3D4B9E] w-12 text-right">
            {Math.round(settings.volume * 100)}%
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 bg-[#FFFBF0] border-2 border-[#3D4B9E] rounded-lg">
        <p className="text-sm text-[#3D4B9E]">
          💡 <strong>Tipp:</strong> Sound-Effekte spielen bei richtigen/falschen Antworten ab.
          Sprachausgabe liest englische Wörter vor.
        </p>
      </div>
    </div>
  );
}
