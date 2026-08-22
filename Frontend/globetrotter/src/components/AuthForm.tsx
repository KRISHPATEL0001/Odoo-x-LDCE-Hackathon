import React, { useState } from 'react';
import { UserProfile, AuthMode } from '../types.ts';
import { api } from '../services/api.ts';
import { AvatarUploader } from './AvatarUploader.tsx';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Compass,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Luggage,
} from 'lucide-react';

interface AuthFormProps {
  onSuccess: (profile: UserProfile) => void;
}

const TRAVEL_STYLES = [
  '🎒 Adventure & Trekking',
  '🏛️ Culture & Heritage',
  '🏖️ Coastal & Relaxing',
  '🍜 Foodie & City Walks',
  '✨ Luxury & Retreats',
];

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [travelStyle, setTravelStyle] = useState('🎒 Adventure & Trekking');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculatePasswordStrength(password);

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 1:
        return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
      case 2:
        return { label: 'Fair', color: 'bg-[#d4a373]', text: 'text-[#d4a373]' };
      case 3:
        return { label: 'Good', color: 'bg-[#7a8d76]', text: 'text-[#5d6d5a]' };
      case 4:
        return { label: 'Strong', color: 'bg-[#5d6d5a]', text: 'text-[#5d6d5a]' };
      default:
        return { label: 'Too short', color: 'bg-[#e0e0d5]', text: 'text-[#7f8c8d]' };
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (mode === 'signup') {
      if (!name.trim()) {
        newErrors.name = 'Please enter your full name';
      } else if (name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }
    }

    if (!email.trim()) {
      newErrors.email = 'Please enter your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please provide a valid email format';
    }

    if (!password) {
      newErrors.password = 'Please enter a password';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      let profile: UserProfile;
      if (mode === 'signup') {
        profile = await api.register({
          name: name.trim(),
          email: email.trim(),
          password,
          avatarUrl,
          travelStyle,
        });
      } else {
        profile = await api.login(email.trim(), password);
      }

      try {
        localStorage.setItem('globetrotter_user', JSON.stringify(profile));
      } catch (err) {
        console.warn('Unable to write to localStorage', err);
      }

      setIsSubmitting(false);
      onSuccess(profile);
    } catch (err: any) {
      setIsSubmitting(false);
      const errMsg = err?.message || 'Authentication failed. Please verify your credentials.';
      setErrors({ form: errMsg });
    }
  };

  const handleAutofillDemo = () => {
    setName('Julianna Thorne');
    setEmail('julianna@explore.com');
    setPassword('Wanderlust#2026');
    setAvatarUrl(
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
    );
    setTravelStyle('🎒 Adventure & Trekking');
    setErrors({});
  };

  return (
    <div
      id="auth-form-wrapper"
      className="w-full max-w-lg mx-auto bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl p-6 sm:p-9 shadow-xl shadow-stone-300/20"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#5d6d5a] text-[#fdfcf8] flex items-center justify-center shadow-md shadow-[#5d6d5a]/20">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-serif italic font-semibold text-[#2d3436] tracking-tight text-xl">
            GlobeTrotter
          </span>
        </div>

        {/* Demo fill helper */}
        <button
          id="btn-autofill-demo"
          type="button"
          onClick={handleAutofillDemo}
          className="text-xs text-[#5d6d5a] bg-[#f5f5f0] hover:bg-[#e9e9e0] border border-[#e0e0d5] font-medium px-3 py-1 rounded-full inline-flex items-center gap-1.5 transition-colors"
          title="Autofill sample traveler profile"
        >
          <Sparkles className="w-3 h-3 text-[#d4a373]" />
          <span>Demo Fill</span>
        </button>
      </div>

      {/* Mode Switcher Tabs */}
      <div
        id="auth-mode-tabs"
        className="grid grid-cols-2 p-1 bg-[#f5f5f0] rounded-2xl mb-6 border border-[#e0e0d5]"
      >
        <button
          id="tab-signup"
          type="button"
          onClick={() => {
            setMode('signup');
            setErrors({});
          }}
          className={`py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            mode === 'signup'
              ? 'bg-[#5d6d5a] text-[#fdfcf8] shadow-sm'
              : 'text-[#7f8c8d] hover:text-[#2d3436]'
          }`}
        >
          Create Profile
        </button>
        <button
          id="tab-login"
          type="button"
          onClick={() => {
            setMode('login');
            setErrors({});
          }}
          className={`py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            mode === 'login'
              ? 'bg-[#5d6d5a] text-[#fdfcf8] shadow-sm'
              : 'text-[#7f8c8d] hover:text-[#2d3436]'
          }`}
        >
          Sign In
        </button>
      </div>

      <header className="mb-6 text-center">
        <h2 className="text-3xl font-serif text-[#2d3436] mb-1.5">
          {mode === 'signup'
            ? 'Create Your Profile'
            : 'Welcome Back, Traveler'}
        </h2>
        <p className="text-[#7f8c8d] text-sm">
          {mode === 'signup'
            ? 'Tell us who is behind the map.'
            : 'Enter your credentials to access your itineraries.'}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div
            id="auth-error-banner"
            className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5 animate-shake"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Photo Upload Section (Mandatory for Signup / Onboarding) */}
        {mode === 'signup' && (
          <div className="pb-1 border-b border-[#e0e0d5]/60">
            <AvatarUploader
              avatarUrl={avatarUrl}
              onAvatarChange={setAvatarUrl}
            />
          </div>
        )}

        {/* User Name Input */}
        {mode === 'signup' && (
          <div className="relative pt-2">
            <label
              htmlFor="input-username"
              className="text-[10px] uppercase tracking-widest text-[#7f8c8d] absolute top-0 left-4 bg-[#fdfcf8] px-1 font-bold z-10"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7f8c8d]">
                <User className="w-4 h-4" />
              </div>
              <input
                id="input-username"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder="e.g. Julianna Thorne"
                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border bg-transparent text-[#2d3436] text-sm focus:outline-none transition-colors placeholder:text-[#c0c0b0] ${
                  errors.name
                    ? 'border-rose-400 bg-rose-50/20'
                    : 'border-[#e0e0d5] focus:border-[#5d6d5a]'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </p>
            )}
          </div>
        )}

        {/* Email Input */}
        <div className="relative pt-2">
          <label
            htmlFor="input-email"
            className="text-[10px] uppercase tracking-widest text-[#7f8c8d] absolute top-0 left-4 bg-[#fdfcf8] px-1 font-bold z-10"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7f8c8d]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="input-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              placeholder="julianna@explore.com"
              className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border bg-transparent text-[#2d3436] text-sm focus:outline-none transition-colors placeholder:text-[#c0c0b0] ${
                errors.email
                  ? 'border-rose-400 bg-rose-50/20'
                  : 'border-[#e0e0d5] focus:border-[#5d6d5a]'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div className="relative pt-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="input-password"
              className="text-[10px] uppercase tracking-widest text-[#7f8c8d] absolute top-0 left-4 bg-[#fdfcf8] px-1 font-bold z-10"
            >
              Password
            </label>
            {mode === 'login' && (
              <button
                type="button"
                className="text-[11px] text-[#d4a373] hover:text-[#c69260] font-semibold hover:underline absolute top-0 right-2 z-10 cursor-pointer"
                onClick={() => setResetMessage('Password reset link has been dispatched to your email.')}
              >
                Forgot password?
              </button>
            )}
          </div>
          {resetMessage && (
            <div className="mb-2 p-2 bg-[#f5f5f0] border border-[#d4a373]/50 text-[#5d6d5a] rounded-xl text-xs flex items-center justify-between">
              <span>{resetMessage}</span>
              <button
                type="button"
                onClick={() => setResetMessage(null)}
                className="text-xs text-[#7f8c8d] hover:text-[#2d3436] font-bold"
              >
                ✕
              </button>
            </div>
          )}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7f8c8d]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="input-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              placeholder="••••••••"
              className={`w-full pl-11 pr-11 py-3.5 rounded-2xl border bg-transparent text-[#2d3436] text-sm focus:outline-none transition-colors placeholder:text-[#c0c0b0] ${
                errors.password
                  ? 'border-rose-400 bg-rose-50/20'
                  : 'border-[#e0e0d5] focus:border-[#5d6d5a]'
              }`}
            />
            <button
              type="button"
              id="btn-toggle-password-visibility"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#7f8c8d] hover:text-[#2d3436]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.password}
            </p>
          )}

          {/* Password Strength Meter for Signup */}
          {mode === 'signup' && password && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#7f8c8d]">Password strength:</span>
                <span className={`font-semibold ${getStrengthLabel(strength).text}`}>
                  {getStrengthLabel(strength).label}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full rounded-full transition-all ${
                      strength >= step
                        ? getStrengthLabel(strength).color
                        : 'bg-[#e0e0d5]'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Travel Style Selector (Signup Only) */}
        {mode === 'signup' && (
          <div className="pt-2">
            <label className="block text-[10px] uppercase tracking-widest text-[#7f8c8d] font-bold mb-2 flex items-center gap-1">
              <Luggage className="w-3.5 h-3.5 text-[#d4a373]" />
              Travel Archetype
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TRAVEL_STYLES.map((style) => {
                const isSelected = travelStyle === style;
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setTravelStyle(style)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-[#5d6d5a] border-[#5d6d5a] text-[#fdfcf8] font-medium shadow-xs'
                        : 'bg-[#f5f5f0] border-[#e0e0d5] text-[#333533] hover:bg-[#e9e9e0]'
                    }`}
                  >
                    {style}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Remember me */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              id="checkbox-remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-[#5d6d5a] border-[#e0e0d5] focus:ring-[#5d6d5a] accent-[#5d6d5a]"
            />
            <span className="text-xs text-[#7f8c8d]">
              Remember this explorer device
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          id="btn-submit-auth"
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-3 py-4 px-5 bg-[#5d6d5a] text-[#fdfcf8] rounded-2xl font-semibold tracking-wide shadow-xl shadow-[#5d6d5a]/20 hover:bg-[#4a5748] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>
                {mode === 'signup'
                  ? 'Continue to Destinations'
                  : 'Sign In to GlobeTrotter'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Footer info */}
        <div className="pt-3 text-center">
          <p className="text-xs text-[#7f8c8d]">
            {mode === 'signup' ? (
              <>
                Already a traveler?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[#d4a373] font-bold cursor-pointer hover:underline"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                New to GlobeTrotter?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-[#d4a373] font-bold cursor-pointer hover:underline"
                >
                  Create Profile
                </button>
              </>
            )}
          </p>
        </div>
      </form>
    </div>
  );
};
