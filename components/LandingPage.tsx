
import React from 'react';
import { ShieldCheck, Search, Users, BrainCircuit, Lock, Heart, CheckCircle, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="bg-white min-h-screen font-sans text-slate-900">
      
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-600/20">
            <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <span className="font-bold text-lg md:text-xl tracking-tight text-slate-900">
            SafeDate<span className="text-teal-600">Check</span>
          </span>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={onLogin}
            className="text-slate-600 font-medium hover:text-teal-600 transition-colors text-sm md:text-base hidden sm:block"
          >
            Sign In
          </button>
          <button 
            onClick={onGetStarted}
            className="px-4 py-2 md:px-5 md:py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all shadow-md hover:shadow-lg text-sm md:text-base"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 pb-20 md:pb-32 overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-indigo-50 -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider mb-6">
            <CheckCircle className="w-3 h-3" />
            Nationwide Public Records
          </div>
          <h1 className="text-4xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-4 md:mb-6 leading-tight md:leading-[1.1]">
            Date with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Confidence.</span><br className="hidden md:block" />
            Know the Truth.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
            The AI-powered background check tool built for modern dating. 
            Instantly screen court records, social feedback, and safety risks before you meet.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3 md:py-4 bg-teal-600 text-white text-base md:text-lg font-bold rounded-xl hover:bg-teal-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Run Free Check
            </button>
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3 md:py-4 bg-white text-slate-700 text-base md:text-lg font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5 text-indigo-500" />
              Join Community
            </button>
          </div>
          <p className="mt-6 text-xs md:text-sm text-slate-400">
            5 free searches/mo • No credit card required to start • Private & Secure
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Feature 1 */}
            <div className="space-y-3 md:space-y-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-2 md:mb-4">
                <BrainCircuit className="w-6 h-6 md:w-7 md:h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900">AI Risk Analysis</h3>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                We don't just dump data. Our AI analyzes court records and news articles to calculate a simplified <strong>Safety Score</strong>, flagging potential risks like violence or fraud instantly.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="space-y-3 md:space-y-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-2 md:mb-4">
                <Users className="w-6 h-6 md:w-7 md:h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900">Community Powered</h3>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                Access the "Whisper Network." See anonymous feedback and safety ratings submitted by verified community members who have dated the person before.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-3 md:space-y-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-rose-100 rounded-2xl flex items-center justify-center mb-2 md:mb-4">
                <Heart className="w-6 h-6 md:w-7 md:h-7 text-rose-600" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900">Evidence Screening</h3>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                Upload screenshots of chats or dating profiles. Our AI scans for psychological manipulation, gaslighting, and behavioral red flags.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 md:py-20 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
           <Lock className="w-10 h-10 md:w-12 md:h-12 text-teal-400 mx-auto mb-4 md:mb-6" />
           <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">Built on Reciprocal Trust</h2>
           <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8 md:mb-10">
             To ensure the safety of our ecosystem, SafeDate Check operates on a reciprocal model. 
             Creating an account builds a verified profile, ensuring that everyone in our community is accountable.
           </p>
           <button 
             onClick={onGetStarted}
             className="w-full sm:w-auto px-8 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg transition-colors inline-flex items-center justify-center gap-2"
           >
             Join the Safety Network <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} SafeDate Check. Not for FCRA use.
          </p>
          <div className="flex gap-4 md:gap-6 flex-wrap justify-center">
             <button onClick={onGetStarted} className="text-sm font-bold text-slate-600 hover:text-teal-600">Privacy Policy</button>
             <button onClick={onGetStarted} className="text-sm font-bold text-slate-600 hover:text-teal-600">Terms of Service</button>
             <button onClick={onGetStarted} className="text-sm font-bold text-slate-600 hover:text-teal-600">Opt Out</button>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
