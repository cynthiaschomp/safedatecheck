
import React, { useState, useEffect } from 'react';
import SearchForm from './components/SearchForm';
import ReportView from './components/ReportView';
import DatabaseView from './components/DatabaseView';
import AuthView from './components/AuthView';
import PaymentModal from './components/PaymentModal';
import AdminDashboard from './components/AdminDashboard';
import SubmitProfileView from './components/SubmitProfileView';
import DataRemovalForm from './components/DataRemovalForm';
import LegalView from './components/LegalView';
import LandingPage from './components/LandingPage';
import SharedReportView from './components/SharedReportView'; 
import ReferralDashboard from './components/ReferralDashboard';
import ReferralProgramPage from './components/ReferralProgramPage';
import InstallPwaPrompt from './components/InstallPwaPrompt';
import ApiKeySettings from './components/ApiKeySettings'; 
import RefineChatModal from './components/RefineChatModal';
import { SearchParams, ReportData, AppState, SavedRecord, SocialFeedback, User, UserSubmission } from './types';
import { generateBackgroundReport } from './services/gemini';
import { hasApiKey } from './services/apikey';
import { getCurrentUser, logout, checkSearchLimit, incrementSearchCount, upgradeSubscription, saveSubmission, getSubmissions, getRecordById, saveRecord, getSavedRecords, syncDatabase } from './services/storage';
import { ShieldCheck, Database, LogOut, Crown, Lock, UserPlus, ShieldBan, Gift, Loader2, Key } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [currentParams, setCurrentParams] = useState<SearchParams | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [savedRecords, setSavedRecords] = useState<SavedRecord[]>([]);
  const [reviewsMap, setReviewsMap] = useState<Record<string, SocialFeedback[]>>({});
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [incomingInviteCode, setIncomingInviteCode] = useState<string>('');
  const [showApiKeySettings, setShowApiKeySettings] = useState(false);

  // Specific state for Shared View & Refinement
  const [sharedRecord, setSharedRecord] = useState<SavedRecord | null>(null);
  const [pendingSharedRecord, setPendingSharedRecord] = useState<SavedRecord | null>(null);

  // Initialize
  useEffect(() => {
    // Attempt to sync from Firebase on load
    syncDatabase().then(() => {
        // Refresh local state after sync
        setSavedRecords(getSavedRecords());
        setSubmissions(getSubmissions());
    });

    const params = new URLSearchParams(window.location.search);
    
    // 1. Check for Shared Report Link
    const shareId = params.get('shareId');
    if (shareId) {
      const record = getRecordById(shareId);
      if (record) {
        setSharedRecord(record);
        setAppState(AppState.SHARED_REPORT);
        return; // Stop other checks if sharing
      }
    }

    // 2. Check for invite param
    const inviteCode = params.get('invite');
    if (inviteCode) {
      setIncomingInviteCode(inviteCode);
      setAppState(AppState.AUTH);
    } else {
      // 3. Check Auth if no special params
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setAppState(AppState.IDLE);
      } else {
        setAppState(AppState.LANDING);
      }
    }

    // Load Data
    setSavedRecords(getSavedRecords());

    const savedReviews = localStorage.getItem('safedate_reviews');
    if (savedReviews) {
      try { setReviewsMap(JSON.parse(savedReviews)); } catch (e) { console.error(e); }
    }

    setSubmissions(getSubmissions());
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);

    // If there was a pending shared record waiting to be "refined"
    if (pendingSharedRecord) {
      // 1. Add to Saved Records via Service (Handles duplicates and FB sync)
      const newRecord = { ...pendingSharedRecord, userId: loggedInUser.id };
      saveRecord(newRecord).then(() => {
          setSavedRecords(getSavedRecords());
      });

      // 2. Pre-fill Search with the record params to REFINE
      setCurrentParams(pendingSharedRecord.params);
      setAppState(AppState.REFINING); // Use REFINING state, not SEARCHING
      
      // Clear pending
      setPendingSharedRecord(null);
    } else {
      setAppState(AppState.IDLE);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setAppState(AppState.LANDING);
    setReportData(null);
    setCurrentParams(null);
  };

  const handleSearch = async (params: SearchParams) => {
    if (!user) return;

    if (!hasApiKey()) {
      setShowApiKeySettings(true);
      return;
    }

    if (!checkSearchLimit(user)) {
      setShowUpgrade(true);
      return;
    }

    setAppState(AppState.SEARCHING); // SEARCHING now means "Loading/Processing"
    setCurrentParams(params);
    setErrorMsg('');

    try {
      const data = await generateBackgroundReport(params);
      incrementSearchCount(user);
      setUser({...user, searchesUsedThisMonth: user.searchesUsedThisMonth + 1});
      
      setReportData(data);
      setAppState(AppState.RESULTS);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred.");
      setAppState(AppState.ERROR);
    }
  };

  const handleRefineChatSubmit = (refinementText: string) => {
     if (!currentParams) return;
     
     // Append new context to existing params
     // We prepend a label so the AI knows this is a refinement instruction
     const previousContext = currentParams.additionalContext || "";
     const newContext = `${previousContext}\n\n[USER REFINEMENT INSTRUCTION]: ${refinementText}`;
     
     const updatedParams: SearchParams = {
       ...currentParams,
       additionalContext: newContext
     };

     // Trigger a new search with updated params
     // This automatically handles token deduction in handleSearch
     handleSearch(updatedParams);
  };

  const handleUpgrade = () => {
    if (user) {
      upgradeSubscription(user.id);
      setUser({...user, tier: 'PAID', maxSearches: 100});
      setShowUpgrade(false);
      alert("Upgrade Successful! You now have 100 searches.");
    }
  };

  // --- Logic for Submissions & Reviews ---

  const getPersonKey = (params: SearchParams) => {
    return `${params.firstName.toLowerCase().trim()}_${params.lastName.toLowerCase().trim()}_${params.location.toLowerCase().trim()}`;
  };

  const getReviewsForCurrentPerson = (): SocialFeedback[] => {
    if (!currentParams) return [];
    const key = getPersonKey(currentParams);
    return reviewsMap[key] || [];
  };

  const getSubmissionsForCurrentPerson = (): UserSubmission[] => {
    if (!currentParams) return [];
    const name = `${currentParams.firstName} ${currentParams.lastName}`;
    return submissions.filter(s => s.targetName.toLowerCase() === name.toLowerCase());
  };

  const handleAddReview = (reviewData: Omit<SocialFeedback, 'id' | 'timestamp' | 'isVerified'>) => {
    if (!currentParams || !user) return;

    const newReview: SocialFeedback = {
      ...reviewData,
      id: Date.now().toString(),
      timestamp: Date.now(),
      isVerified: false,
      authorId: user.id
    };

    const key = getPersonKey(currentParams);
    const existingReviews = reviewsMap[key] || [];
    const newMap = { ...reviewsMap, [key]: [newReview, ...existingReviews] };
    
    localStorage.setItem('safedate_reviews', JSON.stringify(newMap));
    setReviewsMap(newMap);
  };

  const handleSubmission = (sub: UserSubmission) => {
    saveSubmission(sub); // Async sync to FB
    setSubmissions([sub, ...submissions]);
  };

  // --- View Handlers ---

  const handleSaveReport = async () => {
    if (!reportData || !currentParams || !user) return;
    
    const newRecord: SavedRecord = { 
      id: Date.now().toString(), 
      params: currentParams, 
      report: reportData,
      userId: user.id 
    };

    // FIX: Use service to save to avoid overwriting LS with stale state
    await saveRecord(newRecord);
    // Refresh state from LS source of truth
    setSavedRecords(getSavedRecords());
  };

  const handleDeleteRecord = (id: string) => {
    const newRecords = savedRecords.filter(r => r.id !== id);
    localStorage.setItem('safedate_records', JSON.stringify(newRecords));
    setSavedRecords(newRecords);
    // Note: Deletion from Firebase not implemented for safety, only hidden locally
  };

  const handleSelectRecord = (record: SavedRecord) => {
    setCurrentParams(record.params);
    setReportData(record.report);
    setAppState(AppState.RESULTS);
  };

  const handleReset = () => {
    // If logged in go to IDLE, else Landing
    if (user) {
      setAppState(AppState.IDLE);
    } else {
      setAppState(AppState.LANDING);
    }
    setReportData(null);
    setCurrentParams(null);
  };

  // --- Claim Trial & Refine from Shared View ---
  const handleClaimTrial = (record?: SavedRecord) => {
    setIncomingInviteCode("REPORT_ACCESS");
    if (record) {
      setPendingSharedRecord(record);
    }
    setAppState(AppState.AUTH);
  };

  // --- RENDER ---

  // 0. Shared Report View (Public)
  if (appState === AppState.SHARED_REPORT && sharedRecord) {
     return (
       <SharedReportView 
         record={sharedRecord}
         onClaimTrial={handleClaimTrial}
       />
     );
  }

  // 1. Landing Page (Public)
  if (appState === AppState.LANDING) {
    return (
      <LandingPage 
        onGetStarted={() => setAppState(AppState.AUTH)}
        onLogin={() => setAppState(AppState.AUTH)} 
      />
    );
  }

  // 2. Auth View
  if (appState === AppState.AUTH) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AuthView 
          onLogin={handleLogin} 
          initialInviteCode={incomingInviteCode}
        />
        {/* Footer for Auth Page */}
        <div className="text-center py-6 text-slate-400 text-sm">
           <button onClick={() => setAppState(AppState.REFERRAL_INFO)} className="hover:text-teal-600 transition-colors">Affiliates & Referrals</button>
           <span className="mx-2">•</span>
           <button onClick={() => setAppState(AppState.LEGAL_TOS)} className="hover:text-teal-600 transition-colors">Terms</button>
           <span className="mx-2">•</span>
           <button onClick={() => setAppState(AppState.LEGAL_PRIVACY)} className="hover:text-teal-600 transition-colors">Privacy</button>
        </div>
      </div>
    );
  }

  // 3. Legal Views
  if (appState === AppState.LEGAL_TOS) return <LegalView mode="TOS" onBack={() => user ? setAppState(AppState.IDLE) : setAppState(AppState.LANDING)} />;
  if (appState === AppState.LEGAL_PRIVACY) return <LegalView mode="PRIVACY" onBack={() => user ? setAppState(AppState.IDLE) : setAppState(AppState.LANDING)} />;

  // 4. Referral Program Info (Marketing)
  if (appState === AppState.REFERRAL_INFO) {
    return (
      <ReferralProgramPage 
        onBack={() => user ? setAppState(AppState.IDLE) : setAppState(AppState.LANDING)}
        onGetStarted={() => user ? setAppState(AppState.REFERRAL_DASHBOARD) : setAppState(AppState.AUTH)}
        isLoggedIn={!!user}
      />
    );
  }

  // 5. Main App Layout (Protected)
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setAppState(AppState.IDLE)}
          >
            <div className="bg-teal-600 p-1.5 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 hidden sm:block">SafeDate Check</span>
          </div>

          <div className="flex items-center gap-4">
            {user?.role === 'ADMIN' && (
              <button 
                onClick={() => setAppState(AppState.ADMIN)}
                className="text-slate-600 hover:text-teal-600 font-medium text-sm flex items-center gap-1"
              >
                <Lock className="w-3 h-3" /> Admin
              </button>
            )}

            <button 
              onClick={() => setAppState(AppState.REFERRAL_DASHBOARD)}
              className="hidden md:flex items-center gap-1 text-slate-600 hover:text-teal-600 font-medium text-sm"
            >
              <Gift className="w-3 h-3" /> Refer & Earn
            </button>

            <button 
              onClick={() => setAppState(AppState.DATABASE)}
              className="text-slate-600 hover:text-teal-600 font-medium text-sm flex items-center gap-1"
            >
              <Database className="w-4 h-4" /> 
              <span className="hidden sm:inline">Saved</span>
            </button>

            <button 
              onClick={() => setShowUpgrade(true)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors
                ${user?.tier === 'PAID' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md'}`}
            >
              <Crown className="w-3 h-3" />
              {user?.tier === 'PAID' ? 'Premium' : 'Upgrade'}
            </button>
            
            <button
              onClick={() => setShowApiKeySettings(true)}
              className="text-slate-400 hover:text-teal-600"
              title="API Key Settings"
            >
              <Key className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {appState === AppState.IDLE && !hasApiKey() && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-900">API Key Required</p>
                <p className="text-xs text-amber-700">Add your Gemini API key to run searches.</p>
              </div>
            </div>
            <button onClick={() => setShowApiKeySettings(true)} className="bg-amber-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-amber-700 transition-colors">Add Key</button>
          </div>
        )}

        {appState === AppState.IDLE && (
          <div className="space-y-8 animate-fade-in-up">
            <SearchForm 
              onSearch={handleSearch} 
              isSearching={false} 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setAppState(AppState.SUBMIT_PROFILE)}
                className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-3 group"
              >
                <div className="bg-indigo-50 p-3 rounded-full text-indigo-600 group-hover:bg-indigo-100">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800">Submit a Profile</h3>
                  <p className="text-xs text-slate-500">Help the community by adding known info.</p>
                </div>
              </button>

              <button 
                 onClick={() => setAppState(AppState.DATA_REMOVAL)}
                 className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-red-300 hover:shadow-md transition-all flex items-center gap-3 group"
              >
                <div className="bg-red-50 p-3 rounded-full text-red-600 group-hover:bg-red-100">
                  <ShieldBan className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800">Remove My Data</h3>
                  <p className="text-xs text-slate-500">Opt-out of public search results.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {appState === AppState.SEARCHING && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
             <div className="relative">
                <div className="w-24 h-24 border-4 border-slate-100 rounded-full"></div>
                <div className="w-24 h-24 border-4 border-teal-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                <ShieldCheck className="w-8 h-8 text-teal-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
             </div>
             <h2 className="text-xl font-bold text-slate-800 mt-8 mb-2">Analyzing Public Records</h2>
             <p className="text-slate-500 max-w-sm text-center">
               Our AI is scanning court documents, social profiles, and news archives. This may take up to 30 seconds.
             </p>
          </div>
        )}

        {appState === AppState.REFINING && (
          <div className="animate-fade-in-up">
             <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-6 flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                   <Database className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="font-bold text-indigo-900 text-sm">Refine & Re-Analyze</h3>
                   <p className="text-xs text-indigo-700">Update the details below to improve accuracy.</p>
                </div>
             </div>
             <SearchForm 
                onSearch={handleSearch} 
                isSearching={false}
                initialValues={currentParams}
              />
          </div>
        )}

        {appState === AppState.RESULTS && reportData && currentParams && user && (
          <ReportView 
            data={reportData} 
            onReset={handleReset}
            onSave={handleSaveReport}
            isSaved={savedRecords.some(r => r.report.timestamp === reportData.timestamp)}
            params={currentParams}
            reviews={getReviewsForCurrentPerson()}
            onAddReview={handleAddReview}
            userEmail={user.email}
            userId={user.id}
            onAddSubmission={handleSubmission}
            existingSubmissions={getSubmissionsForCurrentPerson()}
            onRefineChat={() => setAppState(AppState.REFINE_CHAT)}
          />
        )}
        
        {appState === AppState.REFINE_CHAT && currentParams && user && (
           <RefineChatModal 
             targetName={`${currentParams.firstName} ${currentParams.lastName}`}
             searchBalance={user.maxSearches - user.searchesUsedThisMonth}
             onCancel={() => setAppState(AppState.RESULTS)}
             onSubmit={handleRefineChatSubmit}
           />
        )}

        {appState === AppState.ERROR && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldBan className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Search Failed</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">{errorMsg}</p>
            <button 
              onClick={() => setAppState(AppState.IDLE)}
              className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold"
            >
              Try Again
            </button>
          </div>
        )}

        {appState === AppState.DATABASE && (
          <DatabaseView 
            records={savedRecords.filter(r => r.userId === user?.id)} 
            onSelect={handleSelectRecord}
            onDelete={handleDeleteRecord}
            onNewSearch={() => setAppState(AppState.IDLE)}
            currentUser={user}
          />
        )}

        {appState === AppState.ADMIN && user?.role === 'ADMIN' && (
          <AdminDashboard />
        )}

        {appState === AppState.REFERRAL_DASHBOARD && user && (
          <ReferralDashboard user={user} />
        )}

        {appState === AppState.SUBMIT_PROFILE && user && (
          <SubmitProfileView 
            userId={user.id}
            userEmail={user.email}
            onCancel={() => setAppState(AppState.IDLE)}
          />
        )}

        {appState === AppState.DATA_REMOVAL && (
          <DataRemovalForm onCancel={() => setAppState(AppState.IDLE)} />
        )}

      </main>

      {/* Footer Links (Logged In) */}
      <footer className="max-w-4xl mx-auto text-center py-8 text-slate-400 text-xs border-t border-slate-200 mt-12">
        <div className="flex justify-center gap-4 mb-4">
           <button onClick={() => setAppState(AppState.REFERRAL_INFO)} className="hover:text-teal-600">Affiliates</button>
           <button onClick={() => setAppState(AppState.LEGAL_TOS)} className="hover:text-teal-600">Terms of Service</button>
           <button onClick={() => setAppState(AppState.LEGAL_PRIVACY)} className="hover:text-teal-600">Privacy Policy</button>
        </div>
        <p>&copy; {new Date().getFullYear()} SafeDate Check. Confidential & Secure.</p>
      </footer>

      {showUpgrade && <PaymentModal onClose={() => setShowUpgrade(false)} onUpgrade={handleUpgrade} />}
      {showApiKeySettings && <ApiKeySettings onClose={() => setShowApiKeySettings(false)} />}
      <InstallPwaPrompt />
    </div>
  );
};

export default App;