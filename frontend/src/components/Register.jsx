import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { registerUser } from '../api.js';

export default function Register({ onToggleLogin, onBackHome, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation / Loading states
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [apiSuccess, setApiSuccess] = useState(null);

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setApiSuccess(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const data = await registerUser(name, email, password);
      setApiSuccess(data.message || 'Account created successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess(data);
      }, 1000);
    } catch (err) {
      setApiError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost/api/auth/google';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] w-full px-4 py-8 animate-float-in">
      <div className="w-full max-w-md bg-[#111318]/80 border border-[#1e2130] rounded-2xl p-8 glass shadow-2xl relative">
        
        {/* Back button */}
        {onBackHome && (
          <button
            onClick={onBackHome}
            className="absolute top-6 left-6 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </button>
        )}

        {/* Header */}
        <div className="text-center mt-6 mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-slate-400 text-sm">Join Kodr today and start building instantly</p>
        </div>

        {/* Success Alert */}
        {apiSuccess && (
          <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-sm text-green-400">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{apiSuccess}</span>
          </div>
        )}

        {/* Error Alert */}
        {apiError && (
          <div className="flex items-start gap-3 mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                placeholder="John Doe"
                className={`w-full bg-[#0a0b0f] border ${
                  errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-[#1e2130] focus:border-indigo-500'
                } rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none transition-all`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                placeholder="you@example.com"
                className={`w-full bg-[#0a0b0f] border ${
                  errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-[#1e2130] focus:border-indigo-500'
                } rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none transition-all`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                placeholder="••••••••"
                className={`w-full bg-[#0a0b0f] border ${
                  errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-[#1e2130] focus:border-indigo-500'
                } rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-slate-600 focus:outline-none transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 text-white rounded-xl py-3 px-4 text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:cursor-not-allowed disabled:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Register
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-[#1e2130]"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Or continue with
          </span>
          <div className="flex-grow border-t border-[#1e2130]"></div>
        </div>

        {/* Google OAuth button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2.5 bg-[#0a0b0f] hover:bg-[#1a1d27] border border-[#1e2130] text-slate-300 hover:text-white rounded-xl py-3 px-4 text-sm font-medium transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Toggle link */}
        <div className="text-center mt-8">
          <p className="text-slate-400 text-sm">
            Already have an account?{' '}
            <button
              onClick={onToggleLogin}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 hover:no-underline transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
