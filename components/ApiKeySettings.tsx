import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, CheckCircle, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, clearStoredApiKey, hasApiKey } from '../services/apikey';

interface ApiKeySettingsProps {
  onClose: () => void;
}

const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ onClose }) => {
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasKey, setHasKey] = useState(hasApiKey());

  // Show masked existing key on open
  useEffect(() => {
    const existing = getStoredApiKey();
    if (existing) setKeyInput(existing);
  }, []);

  const handleSave = () => {
    if (!keyInput.trim() || keyInput.trim().length < 10) return;
    setStoredApiKey(keyInput.trim());
    setHasKey(true);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  const handleClear = () => {
    clearStoredApiKey();
    setKeyInput('');
    setHasKey(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-teal-50 p-2.5 rounded-xl">
            <Key className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Gemini API Key</h2>
            <p className="text-xs text-slate-500">Stored locally on your device only</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 flex gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            SafeDate Check is Bring Your Own Key (BYOK). Your Gemini API key is stored{' '}
            <strong>only in your browser</strong> and never sent to our servers.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none font-mono text-sm bg-white text-slate-900"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIza..."
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-800 font-medium"
          >
            <ExternalLink className="w-3 h-3" />
            Get a free API key at Google AI Studio
          </a>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={!keyInput.trim() || keyInput.trim().length < 10}
              className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {saved ? (
                <><CheckCircle className="w-4 h-4" /> Saved!</>
              ) : (
                'Save Key'
              )}
            </button>

            {hasKey && (
              <button
                onClick={handleClear}
                className="px-4 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                title="Remove API key"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySettings;
