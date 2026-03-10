import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone, CheckCircle } from 'lucide-react';

const InstallPwaPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Check if already installed/standalone
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone === true;
    
    if (isInStandaloneMode) {
      setIsStandalone(true);
      return; // Don't show prompt if already installed
    }

    // 2. Detect Platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 3. Android: Listen for 'beforeinstallprompt'
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show the UI
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. iOS: Always show prompt if on mobile and not standalone (after a short delay)
    if (isIosDevice && !isInStandaloneMode) {
      const hasClosed = localStorage.getItem('safedate_install_prompt_closed');
      if (!hasClosed) {
        setTimeout(() => setIsVisible(true), 3000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('safedate_install_prompt_closed', 'true');
  };

  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (isStandalone || !isVisible) return null;

  return (
    <>
      {/* Main Floating Banner */}
      <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in-up">
        <div className="bg-white/95 backdrop-blur-md border border-teal-500 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-teal-600 p-2.5 rounded-xl shadow-lg shadow-teal-600/20">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Install App</h3>
              <p className="text-xs text-slate-500">Add to Home Screen for best experience</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isIOS ? (
              <button 
                onClick={() => setShowIOSInstructions(true)}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap shadow-md active:scale-95 transition-transform"
              >
                Install
              </button>
            ) : (
              <button 
                onClick={handleAndroidInstall}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap shadow-md active:scale-95 transition-transform"
              >
                Install
              </button>
            )}
            <button 
              onClick={handleDismiss}
              className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end md:items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowIOSInstructions(false)}
              className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                 <Download className="w-8 h-8 text-teal-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Install for iOS</h2>
              <p className="text-sm text-slate-500 mt-2">
                SafeDate Check does not require the App Store. Install it directly from Safari.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Share className="w-6 h-6 text-blue-500 flex-shrink-0" />
                <div className="text-sm text-slate-700">
                  <span className="font-bold block text-slate-900">Step 1</span>
                  Tap the <span className="font-bold">Share</span> button in the menu bar.
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <PlusSquare className="w-6 h-6 text-slate-600 flex-shrink-0" />
                <div className="text-sm text-slate-700">
                  <span className="font-bold block text-slate-900">Step 2</span>
                  Scroll down and select <span className="font-bold">"Add to Home Screen"</span>.
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowIOSInstructions(false)}
              className="w-full mt-6 bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPwaPrompt;
