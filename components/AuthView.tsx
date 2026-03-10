import React, { useState } from 'react';
import { login, register } from '../services/storage';
import { sendPasswordResetEmail } from '../services/email';
import { User } from '../types';
import { Shield, Lock, UserPlus, Info, HelpCircle, Mail, CheckCircle, ArrowLeft, Ticket } from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User) => void;
  initialInviteCode?: string;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'RESET';

const AuthView: React.FC<AuthViewProps> = ({ onLogin, initialInviteCode }) => {
  const [mode, setMode] = useState<AuthMode>(initialInviteCode ? 'REGISTER' : 'LOGIN');
  
  // Form Fields
  const [identifier, setIdentifier] = useState(''); // Email or Username
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState(initialInviteCode || ''); 
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setError('');
    setSuccessMsg('');
    setIdentifier('');
    setEmail('');
    setUsername('');
    setPassword('');
    // Keep invite code if it was passed initially, or clear it? 
    // Usually user might want to clear it if switching, but let's keep logic simple
    if (!initialInviteCode) setInviteCode('');
  };

  const handleModeSwitch = (newMode: AuthMode) => {
    resetForm();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    
    try {
      if (mode === 'LOGIN') {
        const user = login(identifier, password);
        if (user) {
          onLogin(user);
        } else {
          setError("Invalid credentials. Please check your username/email and password.");
        }
      } else if (mode === 'REGISTER') {
        const user = register(email, password, username, inviteCode);
        onLogin(user);
      } else if (mode === 'RESET') {
        // Password reset logic
        if (!identifier && !email) {
            setError("Please enter your email.");
            setLoading(false);
            return;
        }

        const emailToSend = identifier || email;
        const fakeResetToken = Math.random().toString(36).substring(7);
        
        // Attempt to send via service
        const sent = await sendPasswordResetEmail(emailToSend, fakeResetToken);
        
        if (sent) {
           setSuccessMsg(`If an account exists for ${emailToSend}, a password reset link has been sent.`);
        } else {
           // Fallback message if service is not configured/fails (frontend specific)
           setSuccessMsg(`Mock: Reset link for ${emailToSend} logged to console (Service not active).`);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-teal-600 p-8 text-center relative">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">SafeDate Check</h1>
          <p className="text-teal-100 mt-2">Identify risks. Date safely.</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
            {mode === 'LOGIN' && 'Welcome Back'}
            {mode === 'REGISTER' && 'Create Secure Account'}
            {mode === 'RESET' && 'Reset Password'}
          </h2>
          
          {mode === 'RESET' && successMsg ? (
            <div className="text-center space-y-4">
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 flex flex-col items-center">
                <CheckCircle className="w-8 h-8 mb-2" />
                <p className="font-medium">{successMsg}</p>
              </div>
              <button 
                onClick={() => handleModeSwitch('LOGIN')}
                className="text-teal-600 font-bold hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* LOGIN FIELDS */}
              {mode === 'LOGIN' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Email or Username</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none bg-white text-slate-900"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. cynthia or cynthia@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none bg-white text-slate-900"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* REGISTER FIELDS */}
              {mode === 'REGISTER' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Username</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none bg-white text-slate-900"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Pick a unique username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none bg-white text-slate-900"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none bg-white text-slate-900"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  
                  {/* Invite Code Field */}
                  <div>
                    <label className="text-sm font-semibold text-slate-600 mb-1 flex items-center gap-1">
                       <Ticket className="w-3 h-3 text-indigo-500" />
                       Invite Code (Optional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-indigo-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none font-mono text-sm tracking-widest placeholder-slate-400 text-slate-900 font-semibold"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="VIP-XXXX or TESTERS"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Have a promo code? Enter it to unlock free Premium access.
                    </p>
                  </div>

                  <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex gap-2">
                    <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-indigo-900 leading-snug">
                      <strong>Reciprocal Profile Policy:</strong> Creating an account creates a public profile about you. Opting out later cancels your account.
                    </p>
                  </div>
                </>
              )}

              {/* RESET FIELDS */}
              {mode === 'RESET' && (
                 <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Enter your Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none bg-white text-slate-900"
                        value={identifier} // Re-using identifier state for email in reset
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="name@example.com"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      We'll send a password reset link to this address if it matches our records.
                    </p>
                  </div>
              )}

              {error && (
                <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg text-center font-medium">
                  {error}
                </p>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : (
                  <>
                    {mode === 'LOGIN' && <><Lock className="w-4 h-4" /> Sign In</>}
                    {mode === 'REGISTER' && <><UserPlus className="w-4 h-4" /> Agree & Create Account</>}
                    {mode === 'RESET' && 'Send Reset Link'}
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center space-y-3">
            {mode === 'LOGIN' && (
              <>
                 <button 
                  onClick={() => handleModeSwitch('RESET')}
                  className="text-slate-500 hover:text-teal-600 text-sm flex items-center justify-center gap-1 mx-auto"
                >
                  <HelpCircle className="w-3 h-3" /> Need help logging in?
                </button>
                <div className="border-t border-slate-100 pt-3">
                  <button 
                    onClick={() => handleModeSwitch('REGISTER')}
                    className="text-teal-600 font-medium hover:underline text-sm"
                  >
                    Need an account? Sign up free
                  </button>
                </div>
              </>
            )}

            {mode === 'REGISTER' && (
              <button 
                onClick={() => handleModeSwitch('LOGIN')}
                className="text-teal-600 font-medium hover:underline text-sm"
              >
                Already have an account? Sign in
              </button>
            )}

            {mode === 'RESET' && !successMsg && (
              <button 
                onClick={() => handleModeSwitch('LOGIN')}
                className="text-slate-500 hover:text-teal-600 font-medium text-sm flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;