
import React, { useState } from 'react';
import { UserPlus, Search, CheckCircle, GitMerge, FileText, ArrowRight } from 'lucide-react';
import { checkProfileMatch } from '../services/gemini';
import { getSavedRecords, saveRecord, saveSubmission } from '../services/storage';
import { SavedRecord, UserSubmission, SearchParams, ReportData } from '../types';

interface SubmitProfileViewProps {
  onCancel: () => void;
  userId: string;
  userEmail: string;
}

const SubmitProfileView: React.FC<SubmitProfileViewProps> = ({ onCancel, userId, userEmail }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    location: '',
    dob: '',
    details: ''
  });

  // Match Result
  const [matchResult, setMatchResult] = useState<{
    found: boolean;
    record?: SavedRecord;
    reasoning?: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const records = getSavedRecords();
    const result = await checkProfileMatch(formData, records);

    if (result.matchFound && result.matchedRecordId) {
      const record = records.find(r => r.id === result.matchedRecordId);
      setMatchResult({ found: true, record, reasoning: result.reasoning });
    } else {
      setMatchResult({ found: false, reasoning: result.reasoning });
    }

    setStep(2);
    setLoading(false);
  };

  const handleCreateNewProfile = async () => {
    // Create a mock "empty" report to start the profile
    const emptyParams: SearchParams = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      location: formData.location,
      dob: formData.dob,
      additionalContext: formData.details
    };
    
    const mockReport: ReportData = {
      summary: `**User Submitted Profile**\n\nDetails provided: ${formData.details}\n\n*This profile was created by a community member and has not yet been verified against public records.*`,
      sources: [],
      riskAnalysis: "User submitted data. Pending verification.",
      safetyScore: 50,
      safetyLevel: 'CAUTION',
      recommendedDirectories: [],
      timestamp: Date.now()
    };

    const newRecord: SavedRecord = {
      id: Date.now().toString(),
      params: emptyParams,
      report: mockReport,
      source: 'USER_SUBMITTED'
    };

    await saveRecord(newRecord);
    alert("Profile Created Successfully in Database!");
    onCancel();
  };

  const handleMergeProfile = async () => {
    if (matchResult?.record) {
      const submission: UserSubmission = {
        id: Date.now().toString(),
        targetName: `${formData.firstName} ${formData.lastName}`,
        submittedByUserId: userId,
        submittedByUserEmail: userEmail,
        type: 'OTHER',
        text: `[MERGED DATA] User added details: ${formData.details}`,
        timestamp: Date.now()
      };
      
      await saveSubmission(submission);
      alert("Information merged into existing profile as a user submission.");
      onCancel();
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
      <div className="bg-indigo-600 p-6 text-white flex items-center gap-4">
        <UserPlus className="w-10 h-10 text-indigo-200" />
        <div>
          <h2 className="text-2xl font-bold">Submit a Person</h2>
          <p className="text-indigo-100 text-sm">Help build the database. Our AI will check if they already exist.</p>
        </div>
      </div>

      <div className="p-8">
        {step === 1 && (
          <form onSubmit={handleInitialSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                <input 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleInputChange}
                  required 
                  className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-indigo-500 bg-white text-slate-900" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                <input 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleInputChange}
                  required 
                  className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-indigo-500 bg-white text-slate-900" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                <select 
                  name="location" 
                  value={formData.location} 
                  onChange={handleInputChange}
                  required 
                  className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-indigo-500 bg-white text-slate-900" 
                >
                  <option value="">Select Scope</option>
                  <option value="Nationwide">Nationwide</option>
                  <option value="California">California</option>
                  <option value="New York">New York</option>
                  <option value="Texas">Texas</option>
                  <option value="Florida">Florida</option>
                  <option value="Illinois">Illinois</option>
                  {/* ... other states */}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">DOB / Approx Age</label>
                <input 
                  name="dob" 
                  value={formData.dob} 
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-indigo-500 bg-white text-slate-900" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Information / Evidence</label>
              <textarea 
                name="details" 
                value={formData.details} 
                onChange={handleInputChange}
                required
                placeholder="Share what you know about this person..."
                className="w-full border border-slate-200 rounded-lg p-3 h-32 outline-none focus:border-indigo-500 bg-white text-slate-900" 
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={onCancel} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">Cancel</button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-grow px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 flex justify-center items-center gap-2"
              >
                {loading ? <Search className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                {loading ? 'AI Checking for Matches...' : 'Analyze & Continue'}
              </button>
            </div>
          </form>
        )}

        {step === 2 && matchResult && (
          <div className="animate-fade-in space-y-6">
            {matchResult.found ? (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-indigo-600" />
                  <h3 className="text-xl font-bold text-indigo-900">Profile Match Found!</h3>
                </div>
                <p className="text-indigo-800 mb-4">{matchResult.reasoning}</p>
                
                <div className="bg-white p-4 rounded-lg border border-indigo-100 mb-6">
                  <p className="font-bold text-slate-700">Existing Profile:</p>
                  <p className="text-slate-600">{matchResult.record?.params.firstName} {matchResult.record?.params.lastName}</p>
                  <p className="text-slate-500 text-sm">{matchResult.record?.params.location}</p>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleMergeProfile}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"
                  >
                    <GitMerge className="w-5 h-5" />
                    Merge Info to Existing Profile
                  </button>
                  <button 
                    onClick={handleCreateNewProfile}
                    className="flex-1 bg-white border border-indigo-200 text-indigo-700 py-3 rounded-lg font-bold hover:bg-indigo-50"
                  >
                    No, Create Separate Profile
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-8 h-8 text-emerald-600" />
                  <h3 className="text-xl font-bold text-emerald-900">No Match Found</h3>
                </div>
                <p className="text-emerald-800 mb-6">
                  Our AI didn't find any close matches in the database. This appears to be a new entry.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={onCancel}
                    className="flex-1 bg-white border border-emerald-200 text-emerald-700 py-3 rounded-lg font-bold hover:bg-emerald-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateNewProfile}
                    className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700"
                  >
                    Create New Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitProfileView;