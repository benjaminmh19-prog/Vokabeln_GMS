import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Sparkles } from 'lucide-react';

interface LoginTransitionProps {
  playerName: string;
  onComplete: () => void;
}

export default function LoginTransition({ playerName, onComplete }: LoginTransitionProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  const [particles, setParticles] = useState<Array<{ id: number; left: number; top: number }>>([]);

  useEffect(() => {
    // Generate particles
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
    }));
    setParticles(newParticles);

    // Complete animation after 2 seconds
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(onComplete, 300);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] flex items-center justify-center z-50 transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute w-2 h-2 bg-[#2E3192] rounded-full transition-all duration-2000 ${
            isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            transform: isAnimating
              ? 'translateY(0) scale(1)'
              : `translateY(-${Math.random() * 200 + 100}px) scale(0)`,
          }}
        />
      ))}

      {/* Center Content */}
      <div className="text-center z-10">
        {/* Animated Icon */}
        <div
          className={`mb-8 flex justify-center transition-all duration-1000 ${
            isAnimating ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        >
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-[#FFD93D] to-[#FF9F1C] rounded-full flex items-center justify-center border-4 border-[#2E3192] shadow-2xl animate-pulse">
              <Sparkles className="w-16 h-16 text-[#2E3192]" />
            </div>
            {/* Rotating rings */}
            <div className="absolute inset-0 border-4 border-transparent border-t-[#2E3192] rounded-full animate-spin" />
            <div
              className="absolute inset-0 border-4 border-transparent border-b-[#FF9F1C] rounded-full"
              style={{
                animation: 'spin 3s linear reverse infinite',
              }}
            />
          </div>
        </div>

        {/* Welcome Text */}
        <div
          className={`transition-all duration-1000 ${
            isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <h2 className="arcade-title text-[#2E3192] text-5xl mb-4">WILLKOMMEN!</h2>
          <p className="text-2xl font-bold text-[#2E3192] mb-8">{playerName}</p>

          {/* Animated dots */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-[#2E3192] rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-[#2E3192] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-3 h-3 bg-[#2E3192] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>

        {/* Subtitle */}
        <div
          className={`mt-12 transition-all duration-1000 delay-500 ${
            isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <p className="text-lg text-[#2E3192] font-semibold">Dein Abenteuer beginnt...</p>
        </div>
      </div>

      {/* CSS for reverse spin animation */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
