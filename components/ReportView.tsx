
import React, { useState } from 'react';
import { ReportData, SocialFeedback as SocialFeedbackType, UserSubmission } from '../types';
import { ShieldAlert, CheckCircle, ExternalLink, ArrowLeft, Save, Database, Users, MapPin, AlertTriangle, Search, Scale, Heart, Globe, Link, BrainCircuit, EyeOff, Newspaper, ShieldBan, FileText, ArrowRight, MessageSquare, Sparkles } from 'lucide-react';
import SocialFeedback from './SocialFeedback';
import SubmissionForm from './SubmissionForm';
import { isProfileRemoved } from '../services/storage';

interface ReportViewProps {
  data: ReportData;
  onReset: () => void;
  onSave: () => void;
  isSaved: boolean;
  params: { firstName: string; lastName: string; location: string };
  reviews: SocialFeedbackType[];
  onAddReview: (review: Omit<SocialFeedbackType, 'id' | 'timestamp' | 'isVerified'>) => void;
  userEmail: string;
  userId: string;
  onAddSubmission: (sub: UserSubmission) => void;
  existingSubmissions: UserSubmission[];
  onRefineChat?: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({ 
  data,
  onReset,
  onSave,
  isSaved,
  params,
  reviews,
  onAddReview,
  userEmail,
  userId,
  onAddSubmission,
  existingSubmissions,
  onRefineChat
}) => {
  const [activeTab, setActiveTab] = useState<'REPORT' | 'SOURCES' | 'COMMUNITY'>('REPORT');
  
  const isRemoved = isProfileRemoved(params.firstName, params.lastName, params.location);

  if (isRemoved) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-l-4 border-red-500 animate-fade-in-up">
        <ShieldBan className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Data Removed by Request</h2>
        <p className="text-slate-600 max-w-lg mx-auto mb-6">
          The public profile for <strong>{params.firstName} {params.lastName}</strong> in <strong>{params.location}</strong> has been removed from our search results due to a privacy or safety request.
        </p>
        <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-500 max-w-lg mx-auto">
          <p>We comply with all data removal requests to ensure the safety of individuals. If you believe this is an error, please contact support.</p>
        </div>
        <button 
          onClick={onReset}
          className="mt-8 px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800"
        >
          Run New Search
        </button>
      </div>
    );
  }

  // Calculate Color for Safety Score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-100 border-red-200';
    if (score >= 50) return 'text-orange-600 bg-orange-100 border-orange-200';
    if (score >= 20) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-emerald-600 bg-emerald-100 border-emerald-200';
  };

  const scoreColor = getScoreColor(data.safetyScore);

  // Helper: Parse Links in text
  const parseLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-teal-600 hover:underline break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Helper: Parse Bold text first, then links within
  const parseContent = (content: string) => {
    // Split by bold (**text**)
    const parts = content.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, i) => {
      // Handle Bold
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900">{parseLinks(part.slice(2, -2))}</strong>;
      }
      // Handle Normal Text (check for links)
      return <span key={i}>{parseLinks(part)}</span>;
    });
  };

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={index} className="h-2" />;

      // Headers Detection
      // Regex detects: Optional Numbering (e.g., "1. "), then Hashes (## or ###), then Content
      const headerMatch = trimmed.match(/^(\d+\.\s*)?(#{2,3})\s+(.+)/);
      
      if (headerMatch) {
        const level = headerMatch[2].length; // ## or ###
        const content = headerMatch[3];      // Actual Title Text
        
        if (level === 2) {
          return (
            <h3 key={index} className="text-xl font-bold text-slate-800 mt-6 mb-3 pb-2 border-b border-slate-100">
              {parseContent(content)}
            </h3>
          );
        }
        if (level === 3) {
          return (
            <h4 key={index} className="text-lg font-bold text-slate-800 mt-4 mb-2">
              {parseContent(content)}
            </h4>
          );
        }
      }

      // Bullets (* or -)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.substring(2);
        return (
          <div key={index} className="flex items-start gap-3 mb-2 ml-2">
             <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
             <div className="text-slate-700 leading-relaxed">{parseContent(content)}</div>
          </div>
        );
      }

      // Numbered Lists (1. ) - Only matches if NOT matched by Header regex above
      if (/^\d+\.\s/.test(trimmed)) {
        const numberMatch = trimmed.match(/^(\d+\.)\s/);
        const numberLabel = numberMatch ? numberMatch[1] : '';
        const content = trimmed.replace(/^\d+\.\s/, '');
        
        return (
          <div key={index} className="flex items-start gap-3 mb-2 ml-2">
             <span className="font-bold text-slate-500 text-sm mt-0.5 min-w-[20px]">{numberLabel}</span>
             <div className="text-slate-700 leading-relaxed">{parseContent(content)}</div>
          </div>
        );
      }

      // Normal Paragraphs
      return (
        <div key={index} className="text-slate-600 mb-2 leading-relaxed">
          {parseContent(line)}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button 
          onClick={onReset}
          className="flex items-center text-slate-500 hover:text-teal-600 font-medium transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Search
        </button>
        <div className="flex gap-2 self-end sm:self-auto">
           {onRefineChat && (
             <button
               onClick={onRefineChat}
               className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:shadow-sm"
             >
               <Sparkles className="w-4 h-4" /> Refine Search
             </button>
           )}
           <button 
            onClick={onSave}
            disabled={isSaved}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all
              ${isSaved 
                ? 'bg-slate-100 text-slate-400 cursor-default' 
                : 'bg-white border border-slate-200 text-slate-700 hover:border-teal-500 hover:text-teal-600 shadow-sm'}`}
           >
             {isSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
             {isSaved ? 'Saved' : 'Save Report'}
           </button>
        </div>
      </div>

      {/* Main Report Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        {/* Header Section */}
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <h1 className="text-3xl font-extrabold text-slate-900">{params.firstName} {params.lastName}</h1>
                 {data.safetyLevel === 'SAFE' && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                 {data.safetyLevel === 'CRITICAL' && <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                  <MapPin className="w-3 h-3 text-slate-400" /> {params.location}
                </span>
                <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                   <Users className="w-3 h-3 text-slate-400" />
                   {params.dob ? `Age: ${params.dob}` : 'Age: Unverified'}
                </span>
              </div>
            </div>

            <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 ${scoreColor} min-w-[140px]`}>
               <span className="text-xs font-bold uppercase tracking-wider opacity-80">Safety Score</span>
               <span className="text-4xl font-black">{data.safetyScore}</span>
               <span className="text-xs font-bold mt-1">{data.safetyLevel.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('REPORT')}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 min-w-[120px]
              ${activeTab === 'REPORT' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <FileText className="w-4 h-4" /> Full Report
          </button>
          <button 
            onClick={() => setActiveTab('SOURCES')}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 min-w-[120px]
              ${activeTab === 'SOURCES' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Link className="w-4 h-4" /> Sources ({data.recommendedDirectories.length})
          </button>
          <button 
            onClick={() => setActiveTab('COMMUNITY')}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 min-w-[120px]
              ${activeTab === 'COMMUNITY' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Users className="w-4 h-4" /> Community ({reviews.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8">
           {activeTab === 'REPORT' && (
             <div className="space-y-8 animate-fade-in">
                {/* Risk Analysis */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-indigo-600" />
                    AI Risk Analysis
                  </h3>
                  <p className="text-slate-700 leading-relaxed">{data.riskAnalysis}</p>
                </div>

                {/* Enhanced Markdown Report Content */}
                <div className="prose prose-slate max-w-none">
                  {renderMarkdown(data.summary)}
                </div>
             </div>
           )}

           {activeTab === 'SOURCES' && (
             <div className="space-y-6 animate-fade-in">
               <h3 className="font-bold text-lg text-slate-900">Official Records & Research Links</h3>
               <p className="text-slate-600">The following links were identified as highly relevant for verifying this individual's background.</p>
               
               <div className="grid grid-cols-1 gap-3">
                 {data.recommendedDirectories.map((link, idx) => (
                   <a 
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50 hover:shadow-md transition-all group bg-white"
                   >
                     <div>
                       <div className="font-bold text-teal-700 group-hover:text-teal-800 flex items-center gap-2">
                         {link.title || "Official Record"} <ExternalLink className="w-3 h-3" />
                       </div>
                       <div className="text-sm text-slate-500 mt-1">{link.description}</div>
                       <div className="text-xs text-slate-400 mt-1 font-mono truncate max-w-xs">{link.url}</div>
                     </div>
                     <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500" />
                   </a>
                 ))}

                 {data.recommendedDirectories.length === 0 && (
                   <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                     No specific direct links found. Try searching local county clerk websites.
                   </div>
                 )}
               </div>

               {/* Grounding Sources */}
               {data.sources && data.sources.length > 0 && (
                 <div className="mt-8 pt-8 border-t border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                       <Globe className="w-4 h-4 text-slate-400" />
                       Web References
                    </h4>
                    <div className="flex flex-wrap gap-2">
                       {data.sources.map((source, i) => (
                         source.web?.uri ? (
                           <a 
                             key={i}
                             href={source.web.uri}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full hover:bg-slate-200 hover:text-slate-900 transition-colors flex items-center gap-1"
                           >
                             <Link className="w-3 h-3" />
                             {source.web.title || new URL(source.web.uri).hostname}
                           </a>
                         ) : null
                       ))}
                    </div>
                 </div>
               )}
             </div>
           )}

           {activeTab === 'COMMUNITY' && (
             <div className="animate-fade-in space-y-8">
               <SocialFeedback 
                 reviews={reviews}
                 onAddReview={onAddReview}
                 firstName={params.firstName}
               />
               
               {/* Evidence Submission Area */}
               <SubmissionForm 
                 targetName={`${params.firstName} ${params.lastName}`}
                 userEmail={userEmail}
                 userId={userId}
                 onAnalysisComplete={onAddSubmission}
               />

               {/* Display Existing Submissions (Private to User) */}
               {existingSubmissions.length > 0 && (
                 <div className="mt-8">
                    <h3 className="font-bold text-slate-800 mb-4">Your Evidence Submissions</h3>
                    <div className="space-y-4">
                      {existingSubmissions.map(sub => (
                        <div key={sub.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                           <div className="flex justify-between mb-2">
                              <span className="font-bold text-slate-700">Submitted on {new Date(sub.timestamp).toLocaleDateString()}</span>
                              {sub.aiAnalysis?.isHarmful ? (
                                <span className="text-red-600 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Risk Detected</span>
                              ) : (
                                <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Low Risk</span>
                              )}
                           </div>
                           <p className="text-slate-600 italic">"{sub.text}"</p>
                        </div>
                      ))}
                    </div>
                 </div>
               )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ReportView;
