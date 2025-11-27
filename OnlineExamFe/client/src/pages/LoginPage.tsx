import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useAuth(); // Assuming useAuth has a login method, if not we simulate
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError(t('auth.loginFailed')); // Or specific message
      return;
    }

    try {
      setLoading(true);
      await login({ email, password });
      navigate('/exams');
    } catch (err) {
      setError(t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-slate-900/50 md:grid-cols-2">
        <div className="relative hidden bg-gradient-to-br from-sky-600 via-blue-700 to-slate-900 p-8 text-white md:flex md:flex-col">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.2),transparent_35%)]" />
          <div className="relative z-10 space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-white/80">Online Exam</p>
            <h2 className="text-3xl font-semibold leading-tight">Secure sign-in for students and staff</h2>
            <p className="text-sm text-white/90">
              Access your exams, track progress, and stay updated with the latest announcements in a focused workspace.
            </p>
            <div className="flex gap-2 flex-wrap pt-2">
              <span className="tag bg-white/10 border-white/20 text-white">Real-time sync</span>
              <span className="tag bg-white/10 border-white/20 text-white">Proctor ready</span>
              <span className="tag bg-white/10 border-white/20 text-white">Multi-language</span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <p className="text-sm text-slate-300">{t('auth.welcomeBack') || 'Welcome back'}</p>
            <h1 className="text-2xl font-semibold text-white">{t('auth.loginTitle')}</h1>
          </div>

          {error && (
            <div className="border border-rose-400/40 bg-rose-500/10 text-rose-100 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">{t('auth.email')}</label>
              <input
                type="email"
                className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none placeholder:text-slate-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">{t('auth.password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none placeholder:text-slate-400 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full btn btn-primary text-base hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? t('common.loading') : t('auth.loginButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
