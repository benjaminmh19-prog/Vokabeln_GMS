import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { isValidUsername, isValidPassword, getPasswordStrength } from '@/lib/authUtils';
import LoginTransition from '@/components/auth/LoginTransition';
import { usePlayer } from '@/contexts/PlayerContext';

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { setCurrentPlayer, allPlayers } = usePlayer();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionPlayerName, setTransitionPlayerName] = useState('');

  // tRPC mutations
  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await loginMutation.mutateAsync({
        username: username.toLowerCase(),
        password,
      });

      if (result && result.id) {
        // Create player profile from login result
        const playerProfile = {
          id: result.id,
          name: (result.name || result.username || 'Player') as string,
          createdDate: new Date().toISOString(),
          stats: {
            gamesPlayed: 0,
            totalScore: 0,
            bestScore: 0,
            bestLevel: 1 as any,
            maxCombo: 0,
            totalTimeSpent: 0,
            unitProgress: {},
            lastPlayedDate: new Date().toISOString(),
          },
          highScores: [],
          erroredWords: [],
        };
        
        // Update PlayerContext
        setCurrentPlayer(playerProfile);
        
        toast.success(`Willkommen, ${playerProfile.name}!`);
        setTransitionPlayerName(result.name || '');
        setShowTransition(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Anmelden');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!isValidUsername(username)) {
      toast.error('Benutzername: 3-20 Zeichen, nur Buchstaben, Zahlen und Unterstriche');
      return;
    }

    if (!isValidPassword(password)) {
      toast.error('Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwörter stimmen nicht überein');
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerMutation.mutateAsync({
        username: username.toLowerCase(),
        password,
        name: username,
      });

      if (result && result.id) {
        // Create player profile from registration result
        const playerProfile = {
          id: result.id,
          name: (result.name || result.username || 'Player') as string,
          createdDate: new Date().toISOString(),
          stats: {
            gamesPlayed: 0,
            totalScore: 0,
            bestScore: 0,
            bestLevel: 1 as any,
            maxCombo: 0,
            totalTimeSpent: 0,
            unitProgress: {},
            lastPlayedDate: new Date().toISOString(),
          },
          highScores: [],
          erroredWords: [],
        };
        
        // Update PlayerContext
        setCurrentPlayer(playerProfile);
        
        toast.success(`Willkommen, ${playerProfile.name}! Viel Spaß beim Spielen!`);
        setTransitionPlayerName(result.name || '');
        setShowTransition(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Registrieren');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = password ? getPasswordStrength(password) : null;
  const strengthColor = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-green-500',
  };

  if (showTransition) {
    return <LoginTransition playerName={transitionPlayerName} onComplete={() => navigate('/collections')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] p-4 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-md border-4 border-[#2E3192] shadow-lg">
        <div className="p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            {isLogin ? (
              <>
                <LogIn className="w-8 h-8 text-[#2E3192]" />
                <h1 className="arcade-title text-[#2E3192] text-3xl">ANMELDEN</h1>
              </>
            ) : (
              <>
                <UserPlus className="w-8 h-8 text-[#2E3192]" />
                <h1 className="arcade-title text-[#2E3192] text-3xl">REGISTRIEREN</h1>
              </>
            )}
          </div>

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#2E3192] mb-2">
                Benutzername
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Benutzername eingeben"
                className="border-2 border-[#2E3192] rounded-lg py-2 px-4"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2E3192] mb-2">
                Passwort
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Passwort eingeben"
                  className="border-2 border-[#2E3192] rounded-lg py-2 px-4"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3192]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {!isLogin && password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 flex-1 rounded ${strengthColor[passwordStrength || 'weak']}`}></div>
                    <span className="text-xs font-bold text-[#2E3192]">
                      {passwordStrength === 'weak' && 'Schwach'}
                      {passwordStrength === 'medium' && 'Mittel'}
                      {passwordStrength === 'strong' && 'Stark'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-[#2E3192] mb-2">
                  Passwort wiederholen
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Passwort wiederholen"
                    className="border-2 border-[#2E3192] rounded-lg py-2 px-4"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3192]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] hover:from-[#FF8C00] hover:to-[#FFC700] text-[#2E3192] font-bold border-2 border-[#2E3192] rounded-lg py-3 transform hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Bitte warten...' : isLogin ? 'ANMELDEN' : 'REGISTRIEREN'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setUsername('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-[#2E3192] font-bold hover:underline"
            >
              {isLogin ? 'Noch kein Konto? Registrieren' : 'Bereits registriert? Anmelden'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Button
              onClick={() => navigate('/')}
              className="bg-gray-400 hover:bg-gray-500 text-white font-bold border-2 border-[#2E3192] rounded-lg px-6 py-2 transform hover:scale-105 active:scale-95 transition-all"
            >
              ZURÜCK
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
