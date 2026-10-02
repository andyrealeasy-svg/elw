import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Lock, ArrowRight, Loader2, Play, Cloud, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { getBestLegacySave } from '../App';

interface Props {
  onLogin: (username: string, userId: string) => void;
}

export default function AuthScreen({ onLogin }: Props) {
  const [stage, setStage] = useState<'LOADING' | 'SPLASH' | 'LOGIN'>('LOADING');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionData, setSessionData] = useState<{username: string, id: string} | null>(null);
  const [localUserAvailable, setLocalUserAvailable] = useState<string | null>(null);
  const [detectedLegacyProgress, setDetectedLegacyProgress] = useState<{ count: number; source: string } | null>(null);

  useEffect(() => {
    // Check saved local user or save data
    const savedUser = localStorage.getItem('ed_user');
    const legacy = getBestLegacySave();
    if (legacy && legacy.score > 220) {
      const charCount = Object.keys(legacy.profile.roster || {}).length;
      setDetectedLegacyProgress({ count: charCount, source: legacy.source });
    }

    if (savedUser) {
      setUsername(savedUser);
      setLocalUserAvailable(savedUser);
    } else if (legacy && legacy.score > 220) {
      setLocalUserAvailable('Путешественник');
    }

    // Check session in the background
    const checkSession = async () => {
       try {
         const { data: { session } } = await supabase.auth.getSession();
         if (session && session.user) {
            const savedUsername = localStorage.getItem('ed_user') || 'Игрок';
            setSessionData({ username: savedUsername, id: session.user.id });
         }
       } catch (e) {
         console.warn('Supabase session check error:', e);
       }
    };
    checkSession();
    
    // Simulate loading
    const interval = setInterval(() => {
      setLoadingProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setStage('SPLASH');
          return 100;
        }
        return p + Math.floor(Math.random() * 10) + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleSwitchAccount = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    localStorage.removeItem('ed_user');
    setSessionData(null);
    setLocalUserAvailable(null);
    setUsername('');
    setPassword('');
    setAuthError(null);
    setStage('LOGIN');
  };

  const handleEnterGame = () => {
     if (sessionData) {
        onLogin(sessionData.username, sessionData.id);
     } else if (localUserAvailable) {
        onLogin(localUserAvailable, 'local_user');
     } else {
        handleSwitchAccount();
     }
  };

  const handleGuestLogin = () => {
    const nick = username.trim() || localUserAvailable || 'Игрок';
    localStorage.setItem('ed_user', nick);
    onLogin(nick, 'local_user');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!username.trim() || !password.trim()) return;

    setIsSubmitting(true);
    
    // Convert any Unicode/Cyrillic username to safe deterministic email string
    const safeEmailSlug = Array.from(username.toLowerCase())
      .map(ch => {
        const code = ch.charCodeAt(0);
        if ((code >= 48 && code <= 57) || (code >= 97 && code <= 122)) return ch;
        return `_${code.toString(16)}`;
      })
      .join('');
    const email = `usr_${safeEmailSlug || 'guest'}@aegis.game`;

    try {
      if (authMode === 'LOGIN') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Неверный логин или пароль. Если у вас ещё нет аккаунта, переключитесь на «Регистрация» выше.');
          }
          throw error;
        }

        if (data.user) {
          localStorage.setItem('ed_user', username);
          onLogin(username, data.user.id);
        }
      } else {
        // REGISTER MODE
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });

        if (error) {
          if (error.message.includes('already registered') || error.message.includes('already exists')) {
            throw new Error('Пользователь с таким логином уже зарегистрирован. Переключитесь на «Вход».');
          }
          throw error;
        }

        if (data.user) {
          localStorage.setItem('ed_user', username);
          onLogin(username, data.user.id);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setAuthError(err.message || 'Ошибка авторизации. Вы можете войти локально кнопкой ниже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050505] z-50 flex items-center justify-center overflow-hidden font-sans">
       {/* Animated Cosmic Background */}
       <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0a0a0a] to-[#050505] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
       </div>

       <AnimatePresence mode="wait">
         {stage === 'LOADING' && (
           <motion.div 
             key="loading"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="relative z-10 flex flex-col items-center justify-center w-full max-w-md p-6 h-full"
           >
              <div className="flex-1 flex items-center justify-center">
                 <img src="https://i.postimg.cc/x1S97SKX/file-0000000049e8820a8fec80dc6caf5b59.png" alt="Logo" className="w-64 sm:w-80 drop-shadow-[0_0_30px_rgba(139,92,246,0.3)] animate-pulse" />
              </div>
              
              <div className="w-full max-w-xs mb-16">
                 <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
                    <motion.div 
                      className="h-full bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                      style={{ width: `${loadingProgress}%` }}
                    />
                 </div>
                 <div className="text-center mt-4 text-[10px] font-mono text-indigo-300/50 tracking-widest uppercase">
                    Подготовка измерений... {Math.min(100, loadingProgress)}%
                 </div>
              </div>
           </motion.div>
         )}

         {stage === 'SPLASH' && (
           <motion.div 
             key="splash"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
             transition={{ duration: 0.8 }}
             className="relative z-10 flex flex-col items-center justify-center w-full p-6 h-full"
           >
              <motion.img 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 1 }}
                src="https://i.postimg.cc/x1S97SKX/file-0000000049e8820a8fec80dc6caf5b59.png" 
                alt="Logo" 
                className="w-72 sm:w-96 drop-shadow-[0_0_40px_rgba(99,102,241,0.4)] mb-12" 
              />
              
              <div className="flex flex-col items-center gap-3">
                {(sessionData?.username || localUserAvailable) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col items-center gap-1 mb-1"
                  >
                    <div className="text-xs font-mono text-indigo-300/80">
                      Аккаунт: <span className="text-white font-bold">{sessionData?.username || localUserAvailable}</span>
                    </div>
                    <div className="text-[10px] font-mono flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
                      {sessionData ? (
                        <>
                          <Cloud className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-300">Синхронизация с Supabase Cloud</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span className="text-amber-300">Локальный профиль</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {detectedLegacyProgress && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] text-indigo-200/70 font-mono bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl"
                  >
                    💾 Сохранение найдено: {detectedLegacyProgress.count} перс.
                  </motion.div>
                )}

                <motion.button
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.6, duration: 0.8 }}
                   onClick={handleEnterGame}
                   className="group relative px-12 py-4 bg-transparent overflow-hidden rounded-full cursor-pointer"
                >
                   <div className="absolute inset-0 bg-white/5 border border-indigo-500/30 rounded-full backdrop-blur-sm transition-all group-hover:bg-indigo-500/10 group-hover:border-indigo-400/50" />
                   <div className="relative flex items-center gap-3 text-indigo-100 font-black tracking-[0.2em] uppercase text-sm">
                      <Play className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" /> Вход в игру
                   </div>
                </motion.button>

                <motion.button
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.8 }}
                   onClick={handleSwitchAccount}
                   className="text-xs text-indigo-300/60 hover:text-indigo-200 transition-colors underline decoration-indigo-500/30 font-mono tracking-wider cursor-pointer"
                >
                   Сменить аккаунт / Ввести логин
                </motion.button>
              </div>
           </motion.div>
         )}

         {stage === 'LOGIN' && (
           <motion.div
             key="login"
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 1.05 }}
             className="relative z-10 w-full max-w-sm mx-4 p-7 bg-[#0a0a0a]/90 backdrop-blur-xl border border-indigo-500/20 rounded-3xl shadow-2xl shadow-indigo-900/20"
           >
              <div className="flex flex-col items-center mb-6">
                <img src="https://i.postimg.cc/x1S97SKX/file-0000000049e8820a8fec80dc6caf5b59.png" alt="Logo" className="w-40 drop-shadow-lg mb-4" />
                <div className="flex items-center gap-2 text-indigo-300 font-mono text-[11px] uppercase tracking-widest">
                  <Cloud className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Облако Supabase</span>
                </div>
              </div>

              {/* Tabs: Login / Register */}
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 mb-5 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => { setAuthMode('LOGIN'); setAuthError(null); }}
                  className={cn(
                    "flex-1 py-2 rounded-xl font-bold transition-all",
                    authMode === 'LOGIN' 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                      : "text-white/50 hover:text-white/80"
                  )}
                >
                  Вход
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('REGISTER'); setAuthError(null); }}
                  className={cn(
                    "flex-1 py-2 rounded-xl font-bold transition-all",
                    authMode === 'REGISTER' 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                      : "text-white/50 hover:text-white/80"
                  )}
                >
                  Регистрация
                </button>
              </div>

              {detectedLegacyProgress && (
                <div className="mb-4 text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 font-mono flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    Обнаружен локальный прогресс ({detectedLegacyProgress.count} перс.). Он сохранится в ваш аккаунт при входе!
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-1">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-300/60 ml-1">Логин (Никнейм)</label>
                   <div className="relative">
                     <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/40" />
                     <input 
                       type="text" 
                       value={username}
                       onChange={(e) => setUsername(e.target.value)}
                       placeholder="Введите логин..."
                       required
                       className="w-full bg-white/5 border border-indigo-500/20 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/10 transition-all font-mono"
                     />
                   </div>
                 </div>

                 <div className="space-y-1">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-300/60 ml-1">Пароль</label>
                   <div className="relative">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/40" />
                     <input 
                       type="password" 
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       placeholder="От 6 символов..."
                       required
                       minLength={6}
                       className="w-full bg-white/5 border border-indigo-500/20 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/10 transition-all font-mono"
                     />
                   </div>
                 </div>
                 
                 {authError && (
                    <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-3 font-mono leading-relaxed">
                      {authError}
                    </div>
                 )}

                 <button 
                   type="submit"
                   disabled={isSubmitting}
                   className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/50 disabled:text-white/40 text-white font-bold uppercase tracking-wider py-3.5 rounded-2xl text-xs transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] cursor-pointer"
                 >
                   {isSubmitting ? (
                     <><Loader2 className="w-4 h-4 animate-spin" /> Обработка...</>
                   ) : authMode === 'LOGIN' ? (
                     <>Войти в аккаунт <ArrowRight className="w-4 h-4" /></>
                   ) : (
                     <>Создать аккаунт в Облаке <ArrowRight className="w-4 h-4" /></>
                   )}
                 </button>

                 <div className="pt-2 border-t border-white/5">
                   <button 
                     type="button"
                     onClick={handleGuestLogin}
                     className="w-full bg-white/5 hover:bg-white/10 text-indigo-200/80 hover:text-indigo-100 font-medium py-2.5 rounded-2xl text-[11px] transition-all border border-white/10 active:scale-95 flex items-center justify-center gap-2 cursor-pointer font-mono"
                   >
                     🚀 Войти как Гость (Локально)
                   </button>
                 </div>
              </form>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}
