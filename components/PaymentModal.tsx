import React, { useState } from 'react';
import { ShieldCheck, CreditCard, Check } from 'lucide-react';
import { getAdminConfig } from '../services/storage';

interface PaymentModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ onClose, onUpgrade }) => {
  const [loading, setLoading] = useState(false);
  const config = getAdminConfig();

  const handlePay = () => {
    setLoading(true);
    // Simulate Stripe API delay
    setTimeout(() => {
      onUpgrade();
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="bg-indigo-600 p-6 text-center text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-indigo-200 hover:text-white"
          >
            ✕
          </button>
          <ShieldCheck className="w-12 h-12 mx-auto mb-3" />
          <h2 className="text-2xl font-bold">Upgrade to Premium</h2>
          <p className="text-indigo-100">Unlock 100 searches/month</p>
        </div>

        <div className="p-8">
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-1 rounded-full"><Check className="w-4 h-4 text-indigo-600" /></div>
              <span className="text-slate-700">100 Deep Background Checks</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-1 rounded-full"><Check className="w-4 h-4 text-indigo-600" /></div>
              <span className="text-slate-700">Priority Support</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-1 rounded-full"><Check className="w-4 h-4 text-indigo-600" /></div>
              <span className="text-slate-700">Detailed Court Records</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
             <div className="flex justify-between items-end mb-6">
                <span className="text-slate-500 font-medium">Monthly Total</span>
                <span className="text-3xl font-bold text-slate-900">$10.00</span>
             </div>

             {/* Mock Credit Card Field */}
             <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-3 mb-6">
                <CreditCard className="w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Card number" 
                  className="bg-transparent outline-none w-full text-sm text-slate-900" 
                  disabled
                  value="**** **** **** 4242 (Simulated)"
                />
             </div>
             
             {config.stripePublicKey ? (
               <p className="text-xs text-green-600 text-center mb-2">Stripe Connected (Mode: Test)</p>
             ) : (
               <p className="text-xs text-slate-400 text-center mb-2">Stripe Mode: Simulated</p>
             )}

             <button
                onClick={handlePay}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
             >
                {loading ? (
                  <>Processing...</>
                ) : (
                  <>Pay $10.00 & Upgrade</>
                )}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;