import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, BrainCircuit } from 'lucide-react';
import { analyzeEvidence } from '../services/gemini';
import { UserSubmission, EvidenceAnalysis } from '../types';

interface SubmissionFormProps {
  targetName: string;
  userEmail: string;
  userId: string;
  onAnalysisComplete: (submission: UserSubmission) => void;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({ targetName, userEmail, userId, onAnalysisComplete }) => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setImage(base64);
        setMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description && !image) return;

    setAnalyzing(true);
    
    // 1. Run AI Analysis
    const analysis = await analyzeEvidence(description, image || undefined, mimeType || undefined);

    // 2. Construct Submission Object
    const submission: UserSubmission = {
      id: Date.now().toString(),
      targetName,
      submittedByUserId: userId,
      submittedByUserEmail: userEmail,
      type: image ? 'CONVERSATION' : 'OTHER',
      text: description,
      images: image ? [image] : [],
      aiAnalysis: analysis,
      timestamp: Date.now()
    };

    onAnalysisComplete(submission);
    setAnalyzing(false);
    setDescription('');
    setImage(null);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden mt-8">
      <div className="bg-slate-50 p-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Upload className="w-5 h-5 text-teal-600" />
          Contribute Data & Evidence
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Upload screenshots of text conversations or provide details about court cases. 
          Our AI will analyze them for signs of manipulation or abuse.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Detailed Description</label>
          <textarea
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-teal-500 outline-none h-24 bg-white text-slate-900"
            placeholder="Describe the interaction, court case number, or context..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
            Upload Evidence (Screenshot/Doc)
          </label>
          <div 
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 hover:border-teal-300 transition-all bg-white"
          >
            {image ? (
              <span className="text-teal-600 font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Image Attached
              </span>
            ) : (
              <span className="text-slate-400 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" /> Click to attach file
              </span>
            )}
            <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
        </div>

        <button
          type="submit"
          disabled={analyzing || (!description && !image)}
          className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
            ${analyzing 
              ? 'bg-slate-100 text-slate-400' 
              : 'bg-teal-600 text-white hover:bg-teal-700 shadow-md'}`}
        >
          {analyzing ? (
            <>
              <BrainCircuit className="w-5 h-5 animate-pulse" />
              AI Analyzing Evidence...
            </>
          ) : (
            <>
              Analyze & Submit
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SubmissionForm;