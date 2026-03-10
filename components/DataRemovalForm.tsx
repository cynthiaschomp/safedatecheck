import React, { useState } from 'react';
import { ShieldBan, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import { submitRemovalRequest } from '../services/storage';

interface DataRemovalFormProps {
  onCancel: () => void;
}

const DataRemovalForm: React.FC<DataRemovalFormProps> = ({ onCancel }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('privacy');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitRemovalRequest(firstName, lastName, location, reason, email);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center border border-emerald-100 animate-fade-in-up">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Processed</h2>
        <p className="text-slate-600 mb-6">
          The data for <strong>{firstName} {lastName}</strong> in <strong>{location}</strong> has been hidden from public view on this platform.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
          <h4 className="flex items-center gap-2 font-bold text-amber-800 text-sm mb-1">
            <AlertTriangle className="w-4 h-4" />
            Safety Notice
          </h4>
          <p className="text-sm text-amber-700">
            Please note: Profiles that are removed via this request form will be permanently flagged as <strong>"Data Removed by Request"</strong> to all future users. This is to ensure transparency and safety.
          </p>
        </div>
        <button 
          onClick={onCancel}
          className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
      <div className="bg-slate-900 p-6 text-white flex items-center gap-4">
        <ShieldBan className="w-10 h-10 text-red-500" />
        <div>
          <h2 className="text-2xl font-bold">Remove My Data</h2>
          <p className="text-slate-400 text-sm">Submit a request to hide a profile from public search results.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>How this works:</strong> We will instantly hide the specific name and location from generating new reports. 
            However, users searching for this name will see a notice that "Data was removed by request" as a safety precaution.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
            <input 
              type="text" 
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none bg-white text-slate-900"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
            <input 
              type="text" 
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none bg-white text-slate-900"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Location Scope (State)</label>
          <select
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none bg-white text-slate-900"
          >
             <option value="">Select State</option>
              <option value="Nationwide">Nationwide (USA)</option>
              <option value="Alabama">Alabama</option>
              <option value="Alaska">Alaska</option>
              <option value="Arizona">Arizona</option>
              <option value="Arkansas">Arkansas</option>
              <option value="California">California</option>
              <option value="Colorado">Colorado</option>
              <option value="Connecticut">Connecticut</option>
              <option value="Florida">Florida</option>
              <option value="Georgia">Georgia</option>
              <option value="Illinois">Illinois</option>
              <option value="New York">New York</option>
              <option value="Texas">Texas</option>
              {/* Simplified list for brevity in this component */}
              <option value="Washington">Washington</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Requester Email</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none bg-white text-slate-900"
            placeholder="For verification purposes"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Reason for Removal</label>
          <select 
            value={reason} 
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-slate-200 rounded-lg p-3 outline-none bg-white text-slate-900"
          >
            <option value="privacy">Privacy Concern</option>
            <option value="inaccurate">Inaccurate Information</option>
            <option value="harassment">Prevention of Harassment</option>
            <option value="legal">Legal Requirement</option>
          </select>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-3 rounded-lg font-bold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="flex-grow px-6 py-3 rounded-lg font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg transition-all"
          >
            Submit Removal Request
          </button>
        </div>
      </form>
    </div>
  );
};

export default DataRemovalForm;