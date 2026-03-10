
import React from 'react';
import { SavedRecord } from '../types';
import { ShieldCheck, ArrowRight, Lock, Search } from 'lucide-react';
import ReportView from './ReportView';

interface SharedReportViewProps {
  record: SavedRecord;
  onClaimTrial: (record: SavedRecord) => void;
}

const SharedReportView: React.FC<SharedReportViewProps> = ({ record, onClaimTrial }) => {
  return (
    <div className="bg-slate-50 min-h-screen pb-48 md:pb-24">
      {/* Public Header */}
      <div className="bg-slate-900 text-white p-3 md:p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="bg-teal-600 p-1.5 rounded-lg">
               <ShieldCheck className="w-5 h-5" />
             </div>
             <span className="font-bold text-lg leading-none">SafeDate<span className="text-teal-400">Check</span></span>
          </div>
          <div className="text-[10px] md:text-xs bg-slate-800 px-2 md:px-3 py-1 rounded-full text-slate-300 border border-slate-700 whitespace-nowrap">
             <Lock className="w-3 h-3 inline mr-1" />
             Secure Shared Report
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6 md:mb-8 rounded-r-lg flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
           <div>
              <p className="text-indigo-800 font-bold mb-1 text-sm md:text-base">
                You are viewing a shared background report.
              </p>
              <p className="text-indigo-700 text-xs md:text-sm">
                Some interactive features are disabled. Is this information incomplete?
              </p>
           </div>
           <button 
             onClick={() => onClaimTrial(record)}
             className="w-full md:w-auto px-4 py-3 md:py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 flex-shrink-0 active:scale-95"
           >
             <Search className="w-4 h-4" />
             Refine Search with New Info
           </button>
        </div>

        {/* Reuse the main Report View but pass empty/dummy handlers for interactions */}
        <ReportView 
          data={record.report} 
          params={record.params} 
          onReset={() => {}} // Disabled
          onSave={() => {}} // Disabled
          isSaved={true} // Hide save button state
          reviews={[]} // Do not show potentially private reviews in public share
          onAddReview={() => {}} // Disabled
          userEmail="Guest"
          userId="guest"
          onAddSubmission={() => {}} // Disabled
          existingSubmissions={[]} // Do not show evidence submissions publicly
        />
      </div>

      {/* CTA FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 md:p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 safe-area-bottom">
         <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
               <h3 className="font-bold text-slate-900 text-base md:text-lg">Need to add more details?</h3>
               <p className="text-slate-500 text-xs md:text-sm">
                 Create a free account to <strong>refine this search</strong>. <span className="text-teal-600 font-bold whitespace-nowrap">No Credit Card Required.</span>
               </p>
            </div>
            <button 
              onClick={() => onClaimTrial(record)}
              className="w-full md:w-auto px-6 md:px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 animate-pulse active:scale-[0.98]"
            >
               Refine Search & Start Free Trial <ArrowRight className="w-5 h-5" />
            </button>
         </div>
      </div>
    </div>
  );
};

export default SharedReportView;
