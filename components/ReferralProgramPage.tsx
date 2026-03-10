
import React from 'react';
import { Gift, DollarSign, Users, ShieldCheck, ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react';

interface ReferralProgramPageProps {
  onBack: () => void;
  onGetStarted: () => void;
  isLoggedIn: boolean;
}

const ReferralProgramPage: React.FC<ReferralProgramPageProps> = ({ onBack, onGetStarted, isLoggedIn }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 animate-fade-in-up">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center text-slate-500 hover:text-teal-600 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to App
          </button>
          <div className="font-bold text-lg text-slate-900">
            SafeDate <span className="text-teal-600">Partners</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-slate-900 text-white pt-16 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-900/50 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Gift className="w-4 h-4" />
            Refer & Earn Program
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Give Safety. <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Get Paid.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Help us build a safer dating community. Invite friends to SafeDate Check and earn 10% commission on every paid upgrade, while gifting them exclusive bonus features.
          </p>
          <button 
            onClick={onGetStarted}
            className="px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-900/20 transition-all flex items-center gap-2 mx-auto text-lg"
          >
            {isLoggedIn ? 'View My Referral Link' : 'Join Program Free'} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* The Deal Section */}
      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: For You */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <DollarSign className="w-32 h-32 text-indigo-600" />
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
              <DollarSign className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">For You (The Referrer)</h3>
            <p className="text-slate-600 mb-4 h-12">
              Earn ongoing commissions for helping grow the community.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="font-bold text-indigo-700">10% Commission</span> on upgrades
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Monthly payouts
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Track clicks and signups
              </li>
            </ul>
          </div>

          {/* Card 2: For Them */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Gift className="w-32 h-32 text-teal-600" />
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
              <Gift className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">For Your Friends</h3>
            <p className="text-slate-600 mb-4 h-12">
              They get a massive boost to start their safety journey.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="font-bold text-teal-700">25 Free Searches</span> (5x Normal Limit)
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Valid for the first month
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Bonus +25 searches if they upgrade
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="max-w-4xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-16">How it Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
           {/* Connecting Line (Desktop) */}
           <div className="hidden md:block absolute top-12 left-20 right-20 h-0.5 bg-slate-200 -z-10"></div>

           <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative">
             <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4 ring-4 ring-white">1</div>
             <h3 className="font-bold text-lg mb-2">Get Your Link</h3>
             <p className="text-sm text-slate-500">Sign up for a free account to generate your unique referral link automatically.</p>
           </div>

           <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative">
             <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4 ring-4 ring-white">2</div>
             <h3 className="font-bold text-lg mb-2">Share Safety</h3>
             <p className="text-sm text-slate-500">Send your link to friends, group chats, or social media. They get 25 free searches instantly.</p>
           </div>

           <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative">
             <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4 ring-4 ring-white">3</div>
             <h3 className="font-bold text-lg mb-2">Earn Rewards</h3>
             <p className="text-sm text-slate-500">Track your commissions in the dashboard. We pay out monthly for all active subscriptions.</p>
           </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="bg-indigo-50 py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <ShieldCheck className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to start earning?</h2>
          <p className="text-slate-600 mb-8">
            Join thousands of others helping women date safely while building a passive income stream.
          </p>
          <button 
             onClick={onGetStarted}
             className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-colors"
          >
            {isLoggedIn ? 'Go to My Dashboard' : 'Create Account & Get Link'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default ReferralProgramPage;
