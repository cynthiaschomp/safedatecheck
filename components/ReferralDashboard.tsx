
import React from 'react';
import { User } from '../types';
import { Gift, Copy, DollarSign, CheckCircle, Users } from 'lucide-react';

interface ReferralDashboardProps {
  user: User;
}

const ReferralDashboard: React.FC<ReferralDashboardProps> = ({ user }) => {
  const referralLink = `${window.location.origin}/?invite=${user.referralCode}`;
  
  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert("Referral link copied!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div className="bg-indigo-600 p-8 rounded-2xl text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
           <Gift className="w-8 h-8 text-indigo-200" />
           <h2 className="text-2xl md:text-3xl font-bold">Refer & Earn</h2>
        </div>
        <p className="text-indigo-100 text-lg max-w-2xl">
          Give your friends <strong>25 Free Searches</strong>. Earn <strong>10% cash commission</strong> when they subscribe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Card 1 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
           <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
              <DollarSign className="w-6 h-6 text-emerald-600" />
           </div>
           <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Earnings</p>
           <h3 className="text-3xl font-black text-slate-900">${(user.commissionBalance || 0).toFixed(2)}</h3>
           <p className="text-xs text-slate-400 mt-2">Paid out monthly via PayPal</p>
        </div>

        {/* Stats Card 2 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
           <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-indigo-600" />
           </div>
           <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Referrals</p>
           <h3 className="text-3xl font-black text-slate-900">0</h3>
           <p className="text-xs text-slate-400 mt-2">Active signups this month</p>
        </div>

        {/* Action Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
           <label className="text-xs font-bold text-slate-500 uppercase mb-2">Your Unique Link</label>
           <div className="flex gap-2">
              <input 
                readOnly 
                value={referralLink} 
                className="flex-grow bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 outline-none"
              />
              <button 
                onClick={copyLink}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                title="Copy Link"
              >
                <Copy className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Program Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-teal-500 flex-shrink-0" />
              <div>
                 <h4 className="font-bold text-slate-900">Double Search Limit</h4>
                 <p className="text-slate-600 text-sm mt-1">Your referred friends get 25 searches (5x the normal free limit) for their first month.</p>
              </div>
           </div>
           <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-teal-500 flex-shrink-0" />
              <div>
                 <h4 className="font-bold text-slate-900">Recurring Commissions</h4>
                 <p className="text-slate-600 text-sm mt-1">Earn 10% of their subscription fee every month they stay active.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboard;
