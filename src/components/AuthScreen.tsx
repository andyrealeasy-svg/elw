import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Lock, ArrowRight, Loader2, Play, Cloud, ShieldCheck, KeyRound, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { getBestLegacySave } from '../App';
import { parseTransferCode, usernameToUUID } from '../lib/transferCode';
import { PlayerProfile } from '../types';

interface Props {
  onLogin: (username: string, userId: string, initialProfile?: PlayerProfile) => void;
}

export default function AuthScreen({ onLogin }: Props) {
  const [stage, setStage] = useState<'LOADING' | 'SPLASH' | 'LOGIN'>('LOADING');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'TRANSFER'>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [transferCodeInput, setTransferCodeInput] = useState('');
  const [transferCodePreview, setTransferCodePreview] = useState<PlayerProfile | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionData, setSessionData] = useState<{ username: string; id: string } | null>(null);
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

    if (savedUser && savedUser.trim()) {
      const clean = savedUser.trim();
      setUsername(clean);
      setLocalUserAvailable(clean);
    } else if (legacy && legacy.score > 220) {
      setLocalUserAvailable('Путешественник');
    }

    // Check active Supabase session in the background
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

    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setStage('SPLASH');
          return 100;
        }
        return p + Math.floor(Math.random() * 12) + 6;
      });
    }, 70);

    return () => clearInterval(interval);
  }, []);

  // Live validate Transfer Code when pasted
  useEffect(() => {
    if (transferCodeInput.trim()) {
      const parsed = parseTransferCode(transferCodeInput.trim());
      setTransferCodePreview(parsed);
    } else {
      setTransferCodePreview(null);
    }
  }, [transferCodeInput]);

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
      const uid = usernameToUUID(localUserAvailable);
      onLogin(localUserAvailable, uid);
    } else {
      handleSwitchAccount();
    }
  };

  const handleGuestLogin = () => {
    const nick = username.trim() || localUserAvailable || 'Игрок';
    localStorage.setItem('ed_user', nick);
    const uid = usernameToUUID(nick);
    onLogin(nick, uid);
  };

  // Deterministic candidate email generator for login matching
  const getCandidateEmails = (input: string) => {
    const clean = input.trim();
    const list: string[] = [];

    // If input is an email, prioritize directly
    if (clean.includes('@')) {
      list.push(clean.toLowerCase());
    }

    // Deterministic slug (converts Unicode/Cyrillic safe chars)
    const safeSlug = Array.from(clean.toLowerCase())
      .map(ch => {
        const code = ch.charCodeAt(0);
        if ((code >= 48 && code <= 57) || (code >= 97 && code <= 122)) return ch;
        return `_${code.toString(16)}`;
      })
      .join('');

    list.push(`usr_${safeSlug || 'guest'}@aegis.game`);

    if (!clean.includes('@')) {
      list.push(`${clean.toLowerCase()}@aegis.game`);
    }

    return Array.from(new Set(list));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Mode: TRANSFER CODE
    if (authMode === 'TRANSFER') {
      if (!transferCodePreview) {
        setAuthError('Неверный код переноса. Убедитесь, что скопировали весь код, начинающийся с DD-');
        return;
      }
      const nick = username.trim() || 'Путешественник';
      localStorage.setItem('ed_user', nick);
      const uid = usernameToUUID(nick);
      onLogin(nick, uid, transferCodePreview);
      return;
    }

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setAuthError('Пожалуйста, введите логин.');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      setAuthError('Пароль должен содержать не менее 6 символов.');
      return;
    }

    setIsSubmitting(true);
    const candidateEmails = getCandidateEmails(cleanUsername);

    try {
      if (authMode === 'LOGIN') {
        let loggedInUser = null;
        let lastError: any = null;

        // Try candidate email formats in order
        for (const email of candidateEmails) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: cleanPassword
          });

          if (!error && data?.user) {
            loggedInUser = data.user;
            break;
          } else {
            lastError = error;
          }
        }

        if (!loggedInUser) {
          if (lastError?.message?.includes('Invalid login credentials')) {
            throw new Error('Неверный логин или пароль. Проверьте правильность ввода или переключитесь на «Регистрация» выше.');
          }
          throw lastError || new Error('Не удалось войти в аккаунт.');
        }

        localStorage.setItem('ed_user', cleanUsername);
        onLogin(cleanUsername, loggedInUser.id);
      } else {
        // REGISTER MODE
        const primaryEmail = candidateEmails[0];

        // Check if username already exists in profiles table
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, username')
          .ilike('username', cleanUsername)
          .maybeSingle();

        if (existingProfile) {
          throw new Error(`Пользователь с никнеймом «${cleanUsername}» уже существует в БД. Если это ваш аккаунт, переключитесь на «Вход».`);
        }

        const { data, error } = await supabase.auth.signUp({
          email: primaryEmail,
          password: cleanPassword
        });

        if (error) {
          if (error.message.includes('already registered') || error.message.includes('already exists')) {
            throw new Error('Пользователь с таким логином уже зарегистрирован. Переключитесь на «Вход».');
          }
          throw error;
        }

        if (data.user) {
          localStorage.setItem('ed_user', cleanUsername);
          onLogin(cleanUsername, data.user.id);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setAuthError(err.message || 'Ошибка авторизации. Попробуйте снова.');
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
             exit={{ opacity: 0, scale: 1.05 }}
             transition={{ duration: 0.4 }}
             className="relative z-10 flex flex-col items-center justify-center w-full p-6 h-full"
           >
              <motion.img 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.8 }}
                src="https://i.postimg.cc/x1S97SKX/file-0000000049e8820a8fec80dc6caf5b59.png" 
                alt="Logo" 
                className="w-72 sm:w-96 drop-shadow-[0_0_40px_rgba(99,102,241,0.4)] mb-8" 
              />
              
              <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                {(sessionData?.username || localUserAvailable) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center gap-1 mb-2"
                  >
                    <div className="text-xs font-mono text-indigo-300/80">
                      Игровой аккаунт: <span className="text-white font-bold">{sessionData?.username || localUserAvailable}</span>
                    </div>
                    <div className="text-[10px] font-mono flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                      <Cloud className="w-3 h-3 text-indigo-400" />
                      <span>Синхронизация с Supabase БД</span>
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
                   initial={{ opacity: 0, y: 15 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.3 }}
                   onClick={handleEnterGame}
                   className="w-full group relative py-3.5 bg-white/5 border border-indigo-500/30 hover:border-indigo-400/50 hover:bg-indigo-500/10 rounded-full cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                   <Play className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                   <span className="text-indigo-100 font-bold tracking-[0.15em] uppercase text-xs">
                     Вход в игру
                   </span>
                </motion.button>

                <motion.button
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.5 }}
                   onClick={handleSwitchAccount}
                   className="text-xs text-indigo-300/70 hover:text-indigo-200 transition-colors underline decoration-indigo-500/30 font-mono tracking-wider cursor-pointer mt-1"
                >
                   Сменить аккаунт / Ввести пароль
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
             className="relative z-10 w-full max-w-sm mx-4 p-6 bg-[#0a0a0a]/95 backdrop-blur-xl border border-indigo-500/20 rounded-3xl shadow-2xl shadow-indigo-900/30"
           >
              <div className="flex flex-col items-center mb-5">
                <img src="https://i.postimg.cc/x1S97SKX/file-0000000049e8820a8fec80dc6caf5b59.png" alt="Logo" className="w-36 drop-shadow-lg mb-3" />
                <div className="flex items-center gap-2 text-indigo-300 font-mono text-[10px] uppercase tracking-widest">
                  <Cloud className="w-3 h-3 text-indigo-400" />
                  <span>Облако Supabase • Вход в аккаунт</span>
                </div>
              </div>

              {/* Tabs: Login / Register / Transfer Code */}
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 mb-4 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => { setAuthMode('LOGIN'); setAuthError(null); }}
                  className={cn(
                    "flex-1 py-1.5 rounded-xl font-bold transition-all text-xs",
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
                    "flex-1 py-1.5 rounded-xl font-bold transition-all text-xs",
                    authMode === 'REGISTER' 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                      : "text-white/50 hover:text-white/80"
                  )}
                >
                  Регистрация
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('TRANSFER'); setAuthError(null); }}
                  className={cn(
                    "flex-1 py-1.5 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1",
                    authMode === 'TRANSFER' 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                      : "text-white/50 hover:text-white/80"
                  )}
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Код</span>
                </button>
              </div>

              {detectedLegacyProgress && (
                <div className="mb-4 text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 font-mono flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    Обнаружен локальный прогресс ({detectedLegacyProgress.count} перс.). Он сохранится в ваш аккаунт!
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                 {authMode !== 'TRANSFER' ? (
                   <>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-300/70 ml-1">
                         Логин (Никнейм)
                       </label>
                       <div className="relative">
                         <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/40" />
                         <input 
                           type="text" 
                           value={username}
                           onChange={(e) => setUsername(e.target.value)}
                           placeholder="Введите никнейм..."
                           required
                           autoCapitalize="none"
                           autoCorrect="off"
                           spellCheck={false}
                           className="w-full bg-white/5 border border-indigo-500/20 rounded-2xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/10 transition-all font-mono"
                         />
                       </div>
                     </div>

                     <div className="space-y-1">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-300/70 ml-1">
                         Пароль
                       </label>
                       <div className="relative">
                         <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/40" />
                         <input 
                           type="password" 
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           placeholder="От 6 символов..."
                           required
                           minLength={6}
                           autoCapitalize="none"
                           autoCorrect="off"
                           spellCheck={false}
                           className="w-full bg-white/5 border border-indigo-500/20 rounded-2xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/10 transition-all font-mono"
                         />
                       </div>
                     </div>
                   </>
                 ) : (
                   /* TRANSFER CODE TAB */
                   <div className="space-y-3">
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-300/70 ml-1 flex items-center gap-1">
                         <KeyRound className="w-3 h-3 text-indigo-400" />
                         <span>Код переноса с другого устройства</span>
                       </label>
                       <textarea 
                         value={transferCodeInput}
                         onChange={(e) => setTransferCodeInput(e.target.value)}
                         placeholder="Вставьте код (DD-...)"
                         rows={3}
                         required
                         autoCapitalize="none"
                         autoCorrect="off"
                         spellCheck={false}
                         className="w-full bg-white/5 border border-indigo-500/20 rounded-2xl p-2.5 text-[11px] text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/10 transition-all font-mono resize-none leading-relaxed"
                       />
                     </div>

                     {transferCodePreview && (
                       <div className="text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 font-mono">
                         <div className="font-bold flex items-center gap-1 mb-1">
                           <Check className="w-3.5 h-3.5 text-emerald-400" />
                           <span>Сохранение распознано!</span>
                         </div>
                         <div className="grid grid-cols-2 gap-1 text-white/70">
                           <div>Героев: <span className="text-white font-bold">{Object.keys(transferCodePreview.roster || {}).length}</span></div>
                           <div>Кристаллов: <span className="text-indigo-300 font-bold">{transferCodePreview.gems} 💎</span></div>
                           <div>Золота: <span className="text-amber-300 font-bold">{transferCodePreview.gold.toLocaleString()} 🪙</span></div>
                           <div>Бездна: <span className="text-white font-bold">{transferCodePreview.clearedAbyssFloor || 0} эт.</span></div>
                         </div>
                       </div>
                     )}

                     <div className="text-[10px] text-white/40 font-mono leading-tight">
                       💡 Вы можете получить этот код на старом устройстве в профиле (иконка в левом верхнем углу хаба → «Скопировать код»).
                     </div>
                   </div>
                 )}
                 
                 {authError && (
                    <div className="text-[11px] text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 font-mono leading-relaxed">
                      {authError}
                    </div>
                 )}

                 <button 
                   type="submit"
                   disabled={isSubmitting || (authMode === 'TRANSFER' && !transferCodePreview)}
                   className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/40 disabled:text-white/30 text-white font-bold uppercase tracking-wider py-3 rounded-2xl text-xs transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] cursor-pointer"
                 >
                   {isSubmitting ? (
                     <><Loader2 className="w-4 h-4 animate-spin" /> Обработка...</>
                   ) : authMode === 'LOGIN' ? (
                     <>Войти в аккаунт <ArrowRight className="w-4 h-4" /></>
                   ) : authMode === 'REGISTER' ? (
                     <>Создать аккаунт в Облаке <ArrowRight className="w-4 h-4" /></>
                   ) : (
                     <>Восстановить прогресс <ArrowRight className="w-4 h-4" /></>
                   )}
                 </button>

                 <div className="pt-2 border-t border-white/5 flex gap-2">
                   <button 
                     type="button"
                     onClick={handleGuestLogin}
                     className="flex-1 bg-white/5 hover:bg-white/10 text-indigo-200/80 hover:text-indigo-100 font-medium py-2 rounded-2xl text-[10px] transition-all border border-white/10 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer font-mono"
                   >
                     🚀 Войти как Гость
                   </button>
                   <button 
                     type="button"
                     onClick={() => setStage('SPLASH')}
                     className="px-3 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white font-medium py-2 rounded-2xl text-[10px] transition-all border border-white/10 active:scale-95 flex items-center justify-center cursor-pointer font-mono"
                   >
                     Назад
                   </button>
                 </div>
              </form>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}
