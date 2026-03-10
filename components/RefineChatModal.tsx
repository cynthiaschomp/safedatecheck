
import React, { useState } from 'react';
import { MessageSquare, Send, X, Shield, Sparkles } from 'lucide-react';

interface RefineChatModalProps {
  onCancel: () => void;
  onSubmit: (refinementText: string) => void;
  targetName: string;
  searchBalance: number;
}

const RefineChatModal: React.FC<RefineChatModalProps> = ({ onCancel, onSubmit, targetName, searchBalance }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-200" />
            <span className="font-bold">Refine Results with AI</span>
          </div>
          <button onClick={onCancel} className="p-1 hover:bg-indigo-500 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-6 bg-slate-50 overflow-y-auto space-y-6">
          
          {/* AI Message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 mt-1">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 text-slate-700 text-sm leading-relaxed">
              <p className="font-bold text-slate-900 mb-1">AI Analyst</p>
              <p>
                I can dig deeper into specific areas for <strong>{targetName}</strong>. 
                What missing information or specific details should I focus on for the next search?
              </p>
              <p className="mt-3 text-slate-500 italic text-xs border-t border-slate-100 pt-2">
                Examples: "Check if he lived in Chicago in 2015", "Search for the alias 'Johnny'", or "Look for bankruptcy records".
              </p>
            </div>
          </div>

        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
           <form onSubmit={handleSubmit} className="relative">
             <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Your Refinement</span>
                <span className={`text-xs font-bold ${searchBalance > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {searchBalance} Searches Remaining
                </span>
             </div>
             <div className="relative">
               <textarea
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 placeholder="Type details to refine the search..."
                 className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none bg-slate-50 min-h-[50px] max-h-[120px] text-slate-900 placeholder:text-slate-400"
                 rows={2}
                 autoFocus
               />
               <button
                 type="submit"
                 disabled={!input.trim()}
                 className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
               >
                 <Send className="w-4 h-4" />
               </button>
             </div>
             <p className="text-[10px] text-center text-slate-400 mt-2 flex items-center justify-center gap-1">
               <Sparkles className="w-3 h-3" />
               This will generate a new report and use <strong>1 Search Token</strong>.
             </p>
           </form>
        </div>
      </div>
    </div>
  );
};

export default RefineChatModal;
