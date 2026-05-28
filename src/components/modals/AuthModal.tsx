import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Eye, EyeOff, Loader2, Mail, Lock, User, LogIn, ShieldCheck, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useTheme } from '../../lib/ThemeContext';

const isGmail = (email: string) =>
  /^[a-zA-Z0-9._%+\-]+@gmail\.com$/.test(email.trim().toLowerCase());

const gmailErrorMsg = '⚠️ Harus menggunakan Gmail asli (@gmail.com). Email palsu atau selain Gmail tidak diterima!';

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Sangat Lemah', color: 'bg-red-500' };
  if (score === 2) return { score, label: 'Lemah', color: 'bg-orange-500' };
  if (score === 3) return { score, label: 'Cukup', color: 'bg-yellow-500' };
  if (score === 4) return { score, label: 'Kuat', color: 'bg-emerald-500' };
  return { score, label: 'Sangat Kuat', color: 'bg-emerald-400' };
}

interface AuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'reset-password';
}

type AuthMode = 'login' | 'register' | 'forgot' | 'forgot-success' | 'reset-password' | 'reset-success';

export function AuthModal({ onClose, onSuccess, initialMode = 'login' }: AuthModalProps) {
  const { theme } = useTheme();
  const p = theme.primary;
  const s = theme.secondary;
  const glow = theme.glow;
  const glowL = theme.glowLight;

  const [mode, setMode] = useState<AuthMode>(initialMode === 'reset-password' ? 'forgot' : initialMode);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'newpass'>(
    initialMode === 'reset-password' ? 'newpass' : 'email'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewPasswordConfirm, setShowNewPasswordConfirm] = useState(false);

  const newPwStrength = getPasswordStrength(newPassword);
  const pwStrength = getPasswordStrength(password);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // ── Dynamic styles ──
  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${p}25`,
    color: 'white',
  };
  const inputClass = 'w-full px-4 py-3 rounded-2xl text-white placeholder-white/30 focus:outline-none transition-all text-sm';
  const labelClass = 'block text-white/60 text-sm mb-1.5 font-medium';

  const onFocusInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = `1px solid ${p}70`;
    e.target.style.background = 'rgba(255,255,255,0.08)';
    e.target.style.boxShadow = `0 0 0 3px ${p}18`;
  };
  const onBlurInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = `1px solid ${p}25`;
    e.target.style.background = 'rgba(255,255,255,0.05)';
    e.target.style.boxShadow = 'none';
  };

  const primaryBtnStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${p}, ${s})`,
    boxShadow: `0 0 24px ${glow}45`,
    color: 'white',
  };

  const googleBtnStyle: React.CSSProperties = {
    background: `${p}10`,
    border: `1px solid ${p}30`,
    color: 'white',
  };

  const googleBtnHoverStyle: React.CSSProperties = {
    background: `${p}1a`,
    border: `1px solid ${p}50`,
  };

  const resendBtnStyle: React.CSSProperties = {
    background: `${p}0d`,
    border: `1px solid ${p}25`,
    color: `${p}99`,
  };

  // ── Handlers ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Email dan password wajib diisi!');
    if (!isGmail(email)) return toast.error(gmailErrorMsg);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (error.message.includes('Invalid login credentials')) toast.error('Email atau password salah!');
      else if (error.message.includes('Email not confirmed')) toast.error('Email belum dikonfirmasi. Cek inbox Gmail kamu!');
      else toast.error(error.message);
    } else {
      toast.success('Berhasil login! Selamat datang 👋');
      onSuccess?.();
      onClose();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) return toast.error('Semua field wajib diisi!');
    if (!isGmail(email)) return toast.error(gmailErrorMsg);
    if (password !== confirmPassword) return toast.error('Password tidak cocok!');
    if (password.length < 8) return toast.error('Password minimal 8 karakter!');
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    setLoading(false);
    if (error) {
      if (error.message.includes('already registered')) toast.error('Email sudah terdaftar. Silakan login!');
      else toast.error(error.message);
    } else {
      setRegisterSuccess(true);
    }
  };

  const handleForgotStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return toast.error('Masukkan Gmail kamu!');
    if (!isGmail(forgotEmail)) return toast.error(gmailErrorMsg);
    if (resendCooldown > 0) return toast.error(`Tunggu ${resendCooldown} detik sebelum kirim ulang!`);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, { redirectTo: `${window.location.origin}` });
    setLoading(false);
    if (error) toast.error(error.message);
    else { setForgotStep('otp'); setResendCooldown(60); toast.success(`✅ Link reset dikirim ke ${forgotEmail}!`); }
  };

  const handleForgotStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !newPasswordConfirm) return toast.error('Semua field wajib diisi!');
    if (newPassword !== newPasswordConfirm) return toast.error('Password tidak cocok!');
    if (newPassword.length < 8) return toast.error('Password minimal 8 karakter!');
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes('session')) { toast.error('Sesi habis. Silakan request reset password lagi.'); switchMode('forgot'); }
      else toast.error(error.message);
    } else {
      toast.success('✅ Password berhasil diubah! Silakan login.');
      await supabase.auth.signOut();
      setForgotStep('email'); setForgotEmail(''); setOtpCode(''); setNewPassword(''); setNewPasswordConfirm('');
      switchMode('login');
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin, queryParams: { access_type: 'offline', prompt: 'consent' } },
    });
    setGoogleLoading(false);
    if (error) toast.error('Gagal login dengan Google: ' + error.message);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode); setEmail(''); setPassword(''); setConfirmPassword(''); setFullName('');
    setRegisterSuccess(false); setForgotStep('email'); setForgotEmail(''); setOtpCode('');
    setNewPassword(''); setNewPasswordConfirm('');
  };

  const hasUnsavedData = () => {
    if (registerSuccess) return false;
    return email.trim() !== '' || password !== '' || confirmPassword !== '' || fullName.trim() !== '';
  };

  const handleCloseAttempt = () => {
    if (hasUnsavedData()) setShowCloseConfirm(true);
    else onClose();
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center px-4"
        onClick={(e) => e.target === e.currentTarget && handleCloseAttempt()}>

        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative w-full max-w-md rounded-3xl overflow-hidden"
          style={{
            background: `linear-gradient(160deg, color-mix(in srgb, ${p} 10%, #020408) 0%, color-mix(in srgb, ${p} 5%, #030609) 40%, color-mix(in srgb, ${s} 4%, #020306) 100%)`,
            border: `1px solid ${p}25`,
            boxShadow: `0 0 80px ${glow}25, 0 40px 80px rgba(0,0,0,0.8)`
          }}>

          {/* Decorative glows */}
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] pointer-events-none" style={{ background: `${p}18` }} />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-[80px] pointer-events-none" style={{ background: `${s}12` }} />

          {/* ── KONFIRMASI CLOSE ── */}
          <AnimatePresence>
            {showCloseConfirm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-[100] bg-black/85 backdrop-blur-sm rounded-3xl flex items-center justify-center p-6">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                  className="rounded-2xl p-6 w-full max-w-sm text-center"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, ${p} 8%, #001a24), color-mix(in srgb, ${p} 4%, #000d14))`,
                    border: `1px solid ${p}30`,
                    boxShadow: `0 0 40px ${glow}20`,
                  }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: `${p}20`, border: `1px solid ${p}35` }}>
                    <AlertTriangle className="w-6 h-6" style={{ color: p }} />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">Tutup form?</h3>
                  <p className="text-white/50 text-sm mb-6">Data yang sudah kamu isi akan hilang. Yakin mau keluar?</p>
                  <div className="flex gap-3">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCloseConfirm(false)}
                      className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-all">
                      Lanjut Isi
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => { setShowCloseConfirm(false); onClose(); }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{ background: `${p}25`, border: `1px solid ${p}40`, color: p }}>
                      Ya, Tutup
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Close button */}
          <button onClick={handleCloseAttempt}
            className="absolute top-4 right-4 z-50 p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-all">
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10 p-8 overflow-y-auto max-h-[90vh]">
            {/* ── HEADER ── */}
            <div className="mb-8">
              <AnimatePresence mode="wait">
                <motion.div key={mode} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}>
                  {mode === 'login' && (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-5 h-5" style={{ color: p }} />
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: p }}>Secure Login</span>
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-1">Welcome back</h2>
                      <p className="text-white/40 text-sm">Masuk dengan Gmail & password akun kamu.</p>
                    </>
                  )}
                  {mode === 'register' && (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-5 h-5" style={{ color: p }} />
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: p }}>Daftar Akun</span>
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-1">Buat Akun</h2>
                      <p className="text-white/40 text-sm">Gunakan Gmail aktif kamu untuk mendaftar.</p>
                    </>
                  )}
                  {mode === 'forgot' && (
                    <>
                      <h2 className="text-3xl font-bold text-white mb-1">
                        {forgotStep === 'email' && 'Lupa Password?'}
                        {forgotStep === 'otp' && 'Cek Gmail Kamu!'}
                        {forgotStep === 'newpass' && 'Buat Password Baru'}
                      </h2>
                      <p className="text-white/40 text-sm">
                        {forgotStep === 'email' && 'Masukkan Gmail yang terdaftar.'}
                        {forgotStep === 'otp' && 'Link reset sudah dikirim ke Gmail kamu.'}
                        {forgotStep === 'newpass' && 'Buat password baru untuk akunmu.'}
                      </p>
                    </>
                  )}
                  {mode === 'forgot-success' && (
                    <>
                      <h2 className="text-3xl font-bold text-white mb-1">Email Terkirim!</h2>
                      <p className="text-white/40 text-sm">Cek inbox Gmail kamu untuk reset password.</p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── FORMS ── */}
            <AnimatePresence mode="wait">

              {/* LOGIN */}
              {mode === 'login' && (
                <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className={labelClass}>Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input type="email" placeholder="nama@gmail.com" value={email} onChange={e => setEmail(e.target.value)}
                        className={inputClass + ' pl-10 pr-10'} style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} autoComplete="email" />
                      {email && <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {isGmail(email) ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                      </span>}
                    </div>
                    {email && !isGmail(email) && <p className="text-red-400 text-xs mt-1">Harus menggunakan Gmail (@gmail.com)</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                        className={inputClass + ' pl-10 pr-10'} style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} autoComplete="current-password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="button" onClick={() => switchMode('forgot')}
                      className="text-sm font-semibold transition-colors"
                      style={{ color: `${p}bb` }}
                      onMouseEnter={e => (e.currentTarget.style.color = p)}
                      onMouseLeave={e => (e.currentTarget.style.color = `${p}bb`)}>
                      Forgot password
                    </button>
                  </div>
                  <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className="w-full py-3.5 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    style={primaryBtnStyle}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                    Login
                  </motion.button>
                  <div className="relative flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-white/10" /><span className="text-white/30 text-xs">atau</span><div className="flex-1 h-px bg-white/10" />
                  </div>
                  <motion.button type="button" onClick={handleGoogleLogin} disabled={googleLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className="w-full py-3.5 rounded-2xl font-medium transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    style={googleBtnStyle}
                    onMouseEnter={e => { Object.assign((e.currentTarget as HTMLButtonElement).style, googleBtnHoverStyle); }}
                    onMouseLeave={e => { Object.assign((e.currentTarget as HTMLButtonElement).style, googleBtnStyle); }}>
                    {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                    Sign in with Google
                  </motion.button>
                  <p className="text-center text-white/40 text-sm pt-1">
                    Don't have an account?{' '}
                    <button type="button" onClick={() => switchMode('register')} className="font-bold transition-colors" style={{ color: p }}>Sign up for free</button>
                  </p>
                </motion.form>
              )}

              {/* REGISTER */}
              {mode === 'register' && (
                <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  {registerSuccess ? (
                    <div className="flex flex-col items-center text-center gap-4 py-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg mb-1">Cek Gmail Kamu!</h3>
                        <p className="text-white/50 text-sm">Link konfirmasi sudah dikirim ke</p>
                        <p className="font-semibold text-sm mt-1" style={{ color: p }}>{email}</p>
                        <p className="text-white/40 text-xs mt-3">Klik link di email tersebut untuk mengaktifkan akun, lalu login.</p>
                      </div>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => switchMode('login')}
                        className="w-full py-3 rounded-2xl text-white font-semibold mt-2" style={primaryBtnStyle}>
                        Ke Halaman Login
                      </motion.button>
                    </div>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <label className={labelClass}>Nama Lengkap</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input type="text" placeholder="Nama lengkap kamu" value={fullName} onChange={e => setFullName(e.target.value)}
                            className={inputClass + ' pl-10'} style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} autoComplete="name" />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Gmail</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input type="email" placeholder="nama@gmail.com" value={email} onChange={e => setEmail(e.target.value)}
                            className={inputClass + ' pl-10 pr-10'} style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} autoComplete="email" />
                          {email && <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                            {isGmail(email) ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                          </span>}
                        </div>
                        {email && !isGmail(email) && <p className="text-red-400 text-xs mt-1">Harus menggunakan Gmail (@gmail.com)</p>}
                      </div>
                      <div>
                        <label className={labelClass}>Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input type={showPassword ? 'text' : 'password'} placeholder="Minimal 8 karakter" value={password} onChange={e => setPassword(e.target.value)}
                            className={inputClass + ' pl-10 pr-10'} style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} autoComplete="new-password" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {password && (
                          <div className="mt-2 space-y-1">
                            <div className="flex gap-1">
                              {[1,2,3,4,5].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= pwStrength.score ? pwStrength.color : 'bg-white/10'}`} />)}
                            </div>
                            <p className={`text-xs ${pwStrength.score >= 3 ? 'text-emerald-400' : 'text-orange-400'}`}>Kekuatan: {pwStrength.label}</p>
                            <p className="text-white/30 text-xs">Gunakan huruf besar, angka & simbol untuk password kuat</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className={labelClass}>Konfirmasi Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Ulangi password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                            className={inputClass + ' pl-10 pr-10'} style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} autoComplete="new-password" />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {confirmPassword && password !== confirmPassword && <p className="text-red-400 text-xs mt-1">Password tidak cocok</p>}
                        {confirmPassword && password === confirmPassword && <p className="text-emerald-400 text-xs mt-1">✓ Password cocok</p>}
                      </div>
                      <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                        className="w-full py-3.5 rounded-2xl text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50" style={primaryBtnStyle}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                        Daftar & Verifikasi Email
                      </motion.button>
                      <div className="relative flex items-center gap-3 my-1">
                        <div className="flex-1 h-px bg-white/10" /><span className="text-white/30 text-xs">atau</span><div className="flex-1 h-px bg-white/10" />
                      </div>
                      <motion.button type="button" onClick={handleGoogleLogin} disabled={googleLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                        className="w-full py-3.5 rounded-2xl font-medium transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        style={googleBtnStyle}
                        onMouseEnter={e => { Object.assign((e.currentTarget as HTMLButtonElement).style, googleBtnHoverStyle); }}
                        onMouseLeave={e => { Object.assign((e.currentTarget as HTMLButtonElement).style, googleBtnStyle); }}>
                        {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                        Sign up with Google
                      </motion.button>
                      <p className="text-center text-white/40 text-sm pt-1">
                        Sudah punya akun?{' '}
                        <button type="button" onClick={() => switchMode('login')} className="font-bold transition-colors" style={{ color: p }}>Login di sini</button>
                      </p>
                    </form>
                  )}
                </motion.div>
              )}

              {/* FORGOT PASSWORD */}
              {mode === 'forgot' && (
                <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  <AnimatePresence mode="wait">
                    {/* Step 1 — Email */}
                    {forgotStep === 'email' && (
                      <motion.form key="forgot-step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleForgotStep1} className="space-y-4">
                        <div>
                          <label className={labelClass}>Gmail</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input type="email" placeholder="nama@gmail.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                              className={inputClass + ' pl-10 pr-10'} style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} autoComplete="email" />
                            {forgotEmail && <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                              {isGmail(forgotEmail) ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                            </span>}
                          </div>
                          {forgotEmail && !isGmail(forgotEmail) && <p className="text-red-400 text-xs mt-1">Harus menggunakan Gmail (@gmail.com)</p>}
                        </div>
                        <motion.button type="submit" disabled={loading || resendCooldown > 0} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                          className="w-full py-3.5 rounded-2xl text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50" style={primaryBtnStyle}>
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                          {resendCooldown > 0 ? `Tunggu ${resendCooldown} detik...` : 'Kirim Link Reset Password'}
                        </motion.button>
                        <p className="text-center text-white/40 text-sm pt-1">
                          Ingat password?{' '}
                          <button type="button" onClick={() => switchMode('login')} className="font-bold transition-colors" style={{ color: p }}>Kembali login</button>
                        </p>
                      </motion.form>
                    )}

                    {/* Step 2 — Cek Email */}
                    {forgotStep === 'otp' && (
                      <motion.div key="forgot-check-email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 text-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: `${p}18`, border: `1px solid ${p}35` }}>
                          <Mail className="w-8 h-8" style={{ color: p }} />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg mb-1">Cek Gmail Kamu!</h3>
                          <p className="text-white/50 text-sm">Link reset password dikirim ke</p>
                          <p className="font-semibold text-sm mt-1" style={{ color: p }}>{forgotEmail}</p>
                          <p className="text-white/40 text-xs mt-3">Klik tombol di email → langsung ke form ubah password.</p>
                          <p className="text-white/30 text-xs mt-1">Link berlaku 1 jam.</p>
                        </div>
                        <motion.button type="button" disabled={resendCooldown > 0} onClick={handleForgotStep1} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                          className="w-full py-3 rounded-2xl text-sm font-medium transition-all disabled:opacity-40"
                          style={resendBtnStyle}>
                          {resendCooldown > 0 ? `Kirim ulang dalam ${resendCooldown}s` : 'Kirim ulang link'}
                        </motion.button>
                        <button type="button" onClick={() => switchMode('login')} className="w-full text-center text-white/40 text-sm hover:text-white/60 transition-colors">
                          ← Kembali login
                        </button>
                      </motion.div>
                    )}

                    {/* Step 3 — Password Baru */}
                    {forgotStep === 'newpass' && (
                      <motion.form key="forgot-step-newpass" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleForgotStep3} className="space-y-4">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: `${p}12`, border: `1px solid ${p}25` }}>
                          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: p }} />
                          <span className="text-xs truncate" style={{ color: `${p}cc` }}>{forgotEmail}</span>
                        </div>
                        <div>
                          <label className={labelClass}>Password Baru</label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input type={showNewPassword ? 'text' : 'password'} placeholder="Minimal 8 karakter" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                              className={inputClass + ' pl-10 pr-10'} style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} autoComplete="new-password" />
                            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {newPassword && (
                            <div className="mt-2 space-y-1">
                              <div className="flex gap-1">
                                {[1,2,3,4,5].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= newPwStrength.score ? newPwStrength.color : 'bg-white/10'}`} />)}
                              </div>
                              <p className={`text-xs ${newPwStrength.score >= 3 ? 'text-emerald-400' : 'text-orange-400'}`}>Kekuatan: {newPwStrength.label}</p>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className={labelClass}>Konfirmasi Password Baru</label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input type={showNewPasswordConfirm ? 'text' : 'password'} placeholder="Ulangi password baru" value={newPasswordConfirm} onChange={e => setNewPasswordConfirm(e.target.value)}
                              className={inputClass + ' pl-10 pr-10'} style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} autoComplete="new-password" />
                            <button type="button" onClick={() => setShowNewPasswordConfirm(!showNewPasswordConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                              {showNewPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {newPasswordConfirm && newPassword !== newPasswordConfirm && <p className="text-red-400 text-xs mt-1">Password tidak cocok</p>}
                          {newPasswordConfirm && newPassword === newPasswordConfirm && <p className="text-emerald-400 text-xs mt-1">✓ Password cocok</p>}
                        </div>
                        <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                          className="w-full py-3.5 rounded-2xl text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50" style={primaryBtnStyle}>
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                          Simpan Password Baru
                        </motion.button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* FORGOT SUCCESS */}
              {mode === 'forgot-success' && (
                <motion.div key="forgot-success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center gap-4 py-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: `${p}18`, border: `1px solid ${p}35` }}>
                    <Mail className="w-8 h-8" style={{ color: p }} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">Link Reset Terkirim!</h3>
                    <p className="text-white/50 text-sm">Kami mengirim link reset password ke</p>
                    <p className="font-semibold text-sm mt-1" style={{ color: p }}>{email}</p>
                    <p className="text-white/40 text-xs mt-3">Klik link di Gmail kamu → buat password baru → login.</p>
                    <p className="text-white/30 text-xs mt-1">Link berlaku selama 1 jam.</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => switchMode('login')}
                    className="w-full py-3 rounded-2xl text-white font-semibold mt-2" style={primaryBtnStyle}>
                    Kembali ke Login
                  </motion.button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4" />
      <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853" />
      <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05" />
      <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335" />
    </svg>
  );
}
