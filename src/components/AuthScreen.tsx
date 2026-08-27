import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Lock, ArrowRight, Loader2, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

interface Props {
  onLogin: (username: string, userId: string) => void;
}

export default function AuthScreen({ onLogin }: Props) {
  const [stage, setStage] = useState<'LOADING' | 'SPLASH' | 'LOGIN'>('LOADING');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionData, setSessionData] = useState<{username: string, id: string} | null>(null);

  useEffect(() => {
    // Check session in the background
    const checkSession = async () => {
       const { data: { session } } = await supabase.auth.getSession();
       if (session && session.user) {
          const savedUsername = localStorage.getItem('ed_user') || 'Игрок';
          setSessionData({ username: savedUsername, id: session.user.id });
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

  const handleEnterGame = () => {
     if (sessionData) {
        onLogin(sessionData.username, sessionData.id);
     } else {
        setStage('LOGIN');
     }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!username.trim() || !password.trim()) return;

    setIsSubmitting(true);
    
    const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@aegis.game`;

    try {
      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error && error.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password
        });
        
        if (signUpError) throw signUpError;
        data = signUpData;
        error = signUpError;
      } else if (error) {
        throw error;
      }

      if (data.user) {
        localStorage.setItem('ed_user', username);
        onLogin(username, data.user.id);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setAuthError(err.message || 'Ошибка авторизации. Проверьте данные.');
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
                className="w-72 sm:w-96 drop-shadow-[0_0_40px_rgba(99,102,241,0.4)] mb-16" 
              />
              
              <motion.button
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.6, duration: 0.8 }}
                 onClick={handleEnterGame}
                 className="group relative px-12 py-4 bg-transparent overflow-hidden rounded-full"
              >
                 <div className="absolute inset-0 bg-white/5 border border-indigo-500/30 rounded-full backdrop-blur-sm transition-all group-hover:bg-indigo-500/10 group-hover:border-indigo-400/50" />
                 <div className="relative flex items-center gap-3 text-indigo-100 font-black tracking-[0.2em] uppercase text-sm">
                    <Play className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" /> Вход в игру
                 </div>
              </motion.button>
           </motion.div>
         )}

         {stage === 'LOGIN' && (
           <motion.div
             key="login"
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 1.05 }}
             className="relative z-10 w-full max-w-sm mx-4 p-8 bg-[#0a0a0a]/80 backdrop-blur-xl border border-indigo-500/20 rounded-3xl shadow-2xl shadow-indigo-900/20"
           >
              <div className="flex flex-col items-center mb-8">
                <img src="https://i.postimg.cc/x1S97SKX/file-0000000049e8820a8fec80dc6caf5b59.png" alt="Logo" className="w-48 drop-shadow-lg mb-6" />
                <h2 className="text-xl font-bold uppercase tracking-widest text-white/90">Вход в систему</h2>
                <p className="text-[10px] text-indigo-200/50 font-mono mt-2 text-center uppercase tracking-wider">Авторизация или Регистрация<br/>(введите желаемые данные)</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-1">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-300/50 ml-1">Логин (Ник)</label>
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
                   <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-300/50 ml-1">Пароль</label>
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
                    <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-3 font-mono">
                      {authError}
                    </div>
                 )}

                 <button 
                   type="submit"
                   disabled={isSubmitting}
                   className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/50 disabled:text-white/40 text-white font-black uppercase tracking-widest py-3.5 rounded-2xl text-xs transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                 >
                   {isSubmitting ? (
                     <><Loader2 className="w-4 h-4 animate-spin" /> Обработка...</>
                   ) : (
                     <>Войти <ArrowRight className="w-4 h-4" /></>
                   )}
                 </button>
              </form>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}
