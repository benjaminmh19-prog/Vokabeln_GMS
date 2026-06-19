import { useCallback } from 'react';

/**
 * Custom hook for Text-to-Speech (TTS) pronunciation
 * 
 * Uses the Web Speech API (SpeechSynthesis) to pronounce words.
 * This is built into all modern browsers - no external library needed!
 * 
 * How it works:
 * 1. Browser has a SpeechSynthesis API that converts text to speech
 * 2. We create a SpeechSynthesisUtterance (the text to speak)
 * 3. Set language, rate, pitch, volume
 * 4. Browser's speech engine pronounces it
 * 
 * Browser Support: Chrome, Firefox, Safari, Edge (all modern versions)
 * No internet required - uses device's built-in speech engine
 */

export const useTextToSpeech = () => {
  const speak = useCallback((text: string, language: string = 'en-US') => {
    // Check if browser supports Speech Synthesis API
    const speechSynthesis = window.speechSynthesis;
    if (!speechSynthesis) {
      console.warn('Speech Synthesis not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    // Create a speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure speech parameters
    (utterance as any).lang = language; // 'en-US' for English, 'de-DE' for German
    utterance.rate = 0.9; // Speed: 0.1 (slow) to 2 (fast), default 1
    utterance.pitch = 1; // Pitch: 0 (low) to 2 (high), default 1
    utterance.volume = 1; // Volume: 0 (silent) to 1 (loud)

    // Optional: Add event listeners for debugging
    utterance.onstart = () => console.log('Speech started:', text);
    utterance.onend = () => console.log('Speech ended');
    utterance.onerror = (event) => console.error('Speech error:', event.error);

    // Start speaking
    speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    const speechSynthesis = window.speechSynthesis;
    if (speechSynthesis) {
      speechSynthesis.cancel();
    }
  }, []);

  return { speak, stop };
};
