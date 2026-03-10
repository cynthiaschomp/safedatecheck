
import React, { useState, useEffect, useRef } from 'react';
import { getUsers, getSubmissions, saveUser, getAdminConfig, saveAdminConfig, getInvites, createInvite } from '../services/storage';
import { sendInviteEmail } from '../services/email';
import { User, UserSubmission, AdminConfig, Invite } from '../types';
import { Users, CreditCard, ShieldAlert, Gift, Copy, Check, Link as LinkIcon, Mail, FileEdit, Code, Bold, Italic, Underline, List, X, Type, Database, Server } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  
  // Safe default initialization
  const [config, setConfig] = useState<AdminConfig>({ 
    stripePublicKey: '', 
    stripeSecretKey: '',
    sendGridApiKey: '',
    sendGridFromEmail: '',
    passwordResetEmailSubject: '',
    passwordResetEmailBody: ''
  });
  
  const [activeTab, setActiveTab] = useState<'USERS' | 'SUBMISSIONS' | 'SETTINGS' | 'INVITES' | 'EMAIL_TEMPLATES'>('USERS');
  
  // Invite Form
  const [inviteEmail, setInviteEmail] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [generatedInvite, setGeneratedInvite] = useState<Invite | null>(null);
  const [inviteError, setInviteError] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Refs for safe DOM access
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUsers(getUsers());
    setSubmissions(getSubmissions());
    setConfig(getAdminConfig());
    setInvites(getInvites());
  }, []);

  // Sync editor content on load
  useEffect(() => {
    if (activeTab === 'EMAIL_TEMPLATES' && editorRef.current && config.passwordResetEmailBody) {
      if (editorRef.current.innerHTML !== config.passwordResetEmailBody) {
        editorRef.current.innerHTML = config.passwordResetEmailBody;
      }
    }
  }, [activeTab, config.passwordResetEmailBody]);

  const handleGrantPremium = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.tier = 'PAID';
      user.maxSearches = 100;
      saveUser(user);
      setUsers([...getUsers()]); // Refresh
    }
  };

  const handleConfigSave = () => {
    saveAdminConfig(config);
    alert("Configuration Saved");
  };

  const handleGenerateInvite = async () => {
    try {
      setInviteError('');
      setSendingEmail(true);
      
      const newInvite = createInvite(inviteEmail || undefined, customCode || undefined);
      setInvites(getInvites());
      setGeneratedInvite(newInvite);
      
      // If email provided, send the email
      if (inviteEmail) {
        const emailSent = await sendInviteEmail(inviteEmail, newInvite.code);
        if (!emailSent) {
          // console.warn("Email simulation failed or keys missing");
        }
      }

      setInviteEmail('');
      setCustomCode('');
    } catch (e: any) {
      setInviteError(e.message);
    } finally {
      setSendingEmail(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const getInviteLink = (code: string) => {
    return `${window.location.origin}?invite=${code}`;
  };

  // --- EDITOR FUNCTIONS ---

  const execCmd = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setConfig({ ...config, passwordResetEmailBody: editorRef.current.innerHTML });
      editorRef.current.focus();
    }
  };

  const insertShortcode = (code: string) => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    
    // Check if selection is inside the editor
    if (selection && selection.rangeCount > 0 && editorRef.current.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      // Create a text node to insert (treat shortcode as text, not HTML tag)
      const textNode = document.createTextNode(code);
      range.insertNode(textNode);
      
      // Move cursor after insertion
      range.setStartAfter(textNode);
      range.setEndAfter(textNode); 
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // If not focused, just append to the end
      editorRef.current.innerHTML += code;
    }

    setConfig({ ...config, passwordResetEmailBody: editorRef.current.innerHTML });
  };

  const SHORTCODES = [
    { code: '{reset_link}', desc: 'The generated password reset URL' },
    { code: '{user_email}', desc: 'The user\'s email address' },
    { code: '{app_name}', desc: 'App Name (SafeDate Check)' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
        <ShieldAlert className="w-8 h-8 text-teal-600" />
        Admin Dashboard
      </h1>

      <div className="flex gap-2 md:gap-4 mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap hide-scrollbar">
        <button 
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === 'USERS' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          Manage Users
        </button>
        <button 
          onClick={() => setActiveTab('INVITES')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === 'INVITES' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          <Gift className="w-4 h-4" /> Invites
        </button>
        <button 
          onClick={() => setActiveTab('SUBMISSIONS')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === 'SUBMISSIONS' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          Submissions
        </button>
        <button 
          onClick={() => setActiveTab('EMAIL_TEMPLATES')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === 'EMAIL_TEMPLATES' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          Email Templates
        </button>
        <button 
          onClick={() => setActiveTab('SETTINGS')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === 'SETTINGS' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          Settings
        </button>
      </div>

      {activeTab === 'USERS' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold text-slate-600">Email</th>
                  <th className="p-4 font-semibold text-slate-600">Tier</th>
                  <th className="p-4 font-semibold text-slate-600">Usage</th>
                  <th className="p-4 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-slate-100 last:border-0">
                    <td className="p-4 font-medium text-slate-800">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${user.tier === 'PAID' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                        {user.tier}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {user.searchesUsedThisMonth} / {user.maxSearches}
                    </td>
                    <td className="p-4">
                      {user.tier === 'FREE' && (
                        <button 
                          onClick={() => handleGrantPremium(user.id)}
                          className="text-xs bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg hover:bg-teal-100 font-semibold whitespace-nowrap"
                        >
                          Gift Premium
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'INVITES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-indigo-500" />
                Generate Invite Link
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Create a 30-day Premium access link. You can assign it to a specific email or make it open for anyone.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Custom Code (Optional)</label>
                  <input 
                    type="text"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                    placeholder="e.g. TESTERS"
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:border-teal-500 outline-none uppercase font-mono bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assign to Email (Optional)</label>
                  <input 
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="friend@example.com"
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:border-teal-500 outline-none bg-white text-slate-900"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">If entered, we will email the invite automatically.</p>
                </div>
                
                {inviteError && (
                  <p className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded">{inviteError}</p>
                )}

                <button 
                  onClick={handleGenerateInvite}
                  disabled={sendingEmail}
                  className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  {sendingEmail ? 'Generating & Sending...' : 'Generate Link'}
                </button>
              </div>
            </div>

            {generatedInvite && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl animate-fade-in">
                <p className="text-emerald-800 font-bold text-sm mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4" /> Invite Created!
                </p>
                
                {/* Code Display */}
                <div className="flex items-center gap-2 bg-white border border-emerald-100 p-2 rounded-lg mb-2">
                  <span className="text-xs font-bold text-slate-400 px-2">CODE:</span>
                  <code className="flex-grow font-mono text-lg font-bold text-slate-800 break-all">
                    {generatedInvite.code}
                  </code>
                  <button 
                    onClick={() => copyToClipboard(generatedInvite.code)}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                    title="Copy Code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                {/* Link Display */}
                <div className="flex items-center gap-2 bg-white border border-emerald-100 p-2 rounded-lg">
                   <span className="text-xs font-bold text-slate-400 px-2">LINK:</span>
                   <input 
                    readOnly
                    value={getInviteLink(generatedInvite.code)}
                    className="flex-grow text-xs text-slate-600 bg-transparent outline-none truncate bg-white min-w-0"
                   />
                  <button 
                    onClick={() => copyToClipboard(getInviteLink(generatedInvite.code))}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                    title="Copy Link"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-emerald-700 mt-2">
                  {inviteEmail ? `Invited email sent to ${inviteEmail}!` : "Share this link manually."}
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-700">Recent Invites</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-white border-b border-slate-100 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="p-4">Code & Link</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Assigned To</th>
                    <th className="p-4">Created</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {invites.length === 0 ? (
                     <tr><td colSpan={4} className="p-8 text-center text-slate-400">No invites generated yet.</td></tr>
                  ) : (
                    invites.map(invite => (
                      <tr key={invite.code} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                        <td className="p-4">
                          <div className="font-mono font-bold text-slate-700 text-base">{invite.code}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <input 
                              readOnly
                              value={getInviteLink(invite.code)}
                              className="text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded px-2 py-1 w-48 truncate outline-none focus:border-teal-300"
                              onClick={(e) => e.currentTarget.select()}
                            />
                            <button 
                              onClick={() => copyToClipboard(getInviteLink(invite.code))}
                              className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                              title="Copy Link"
                            >
                              <LinkIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                            ${invite.status === 'USED' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>
                            {invite.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">
                          {invite.createdForEmail || <span className="text-slate-400 italic">Open</span>}
                        </td>
                        <td className="p-4 text-slate-500">
                          {new Date(invite.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'SUBMISSIONS' && (
        <div className="space-y-4">
          {submissions.length === 0 && <p className="text-slate-400 italic">No evidence submitted yet.</p>}
          {submissions.map(sub => (
            <div key={sub.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{sub.targetName}</h3>
                  <p className="text-sm text-slate-500">
                    Submitted by: <span className="text-teal-600">{sub.submittedByUserEmail}</span> on {new Date(sub.timestamp).toLocaleDateString()}
                  </p>
                </div>
                {sub.aiAnalysis?.isHarmful && (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 self-start">
                    <ShieldAlert className="w-3 h-3" /> High Risk Detected
                  </span>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-lg mb-4 text-slate-700 text-sm">
                "{sub.text}"
              </div>

              {sub.aiAnalysis && (
                 <div className="border-l-4 border-indigo-500 pl-4 py-1">
                    <p className="text-xs font-bold text-indigo-600 uppercase mb-1">AI Evidence Analysis</p>
                    <p className="text-sm font-semibold text-slate-800">{sub.aiAnalysis.summary}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {sub.aiAnalysis.detectedBehaviors.map((b, i) => (
                        <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                          {b}
                        </span>
                      ))}
                    </div>
                 </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'EMAIL_TEMPLATES' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <FileEdit className="w-5 h-5 text-slate-400" />
                  Password Reset Email
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email Subject</label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-white text-slate-900"
                    placeholder="Reset Your Password"
                    value={config.passwordResetEmailSubject || ''}
                    onChange={e => setConfig({...config, passwordResetEmailSubject: e.target.value})}
                  />
                </div>
                
                {/* Visual Editor */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Body Content
                  </label>
                  
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {/* Toolbar */}
                    <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-1 flex-wrap">
                      <button onClick={() => execCmd('bold')} className="p-2 hover:bg-white hover:shadow-sm rounded transition-colors text-slate-600" title="Bold">
                        <Bold className="w-4 h-4" />
                      </button>
                      <button onClick={() => execCmd('italic')} className="p-2 hover:bg-white hover:shadow-sm rounded transition-colors text-slate-600" title="Italic">
                        <Italic className="w-4 h-4" />
                      </button>
                      <button onClick={() => execCmd('underline')} className="p-2 hover:bg-white hover:shadow-sm rounded transition-colors text-slate-600" title="Underline">
                        <Underline className="w-4 h-4" />
                      </button>
                      <div className="w-px bg-slate-300 mx-1 hidden md:block"></div>
                      <button onClick={() => execCmd('insertUnorderedList')} className="p-2 hover:bg-white hover:shadow-sm rounded transition-colors text-slate-600" title="Bulleted List">
                        <List className="w-4 h-4" />
                      </button>
                      <button onClick={() => execCmd('removeFormat')} className="p-2 hover:bg-white hover:shadow-sm rounded transition-colors text-slate-600" title="Clear Formatting">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Editable Area */}
                    <div 
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      className="p-4 min-h-[300px] outline-none text-slate-800 text-sm leading-relaxed prose prose-sm max-w-none"
                      onInput={() => {
                        if (editorRef.current) {
                          setConfig({...config, passwordResetEmailBody: editorRef.current.innerHTML});
                        }
                      }}
                    ></div>
                  </div>
                  
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <Type className="w-3 h-3" />
                    Visual Editor Enabled. Use shortcodes from the panel to insert dynamic data.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleConfigSave}
                  className="w-full md:w-auto bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800"
                >
                  Save Templates
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-6">
                <h3 className="font-bold text-sm text-slate-500 uppercase mb-4 flex items-center gap-2">
                  <Code className="w-4 h-4" /> Available Shortcodes
                </h3>
                <div className="space-y-3">
                  {SHORTCODES.map(sc => (
                    <div 
                      key={sc.code} 
                      onClick={() => insertShortcode(sc.code)}
                      className="group cursor-pointer p-3 rounded-lg border border-slate-100 hover:border-teal-200 hover:bg-teal-50 transition-all select-none active:bg-teal-100"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <code className="text-xs font-bold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">{sc.code}</code>
                        <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">Click to Insert</span>
                      </div>
                      <p className="text-xs text-slate-500">{sc.desc}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'SETTINGS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Firebase Configuration */}
          <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 md:col-span-2">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900">
              <Database className="w-5 h-5 text-teal-600" />
              Firebase Database (Persistence)
            </h3>
            <p className="text-sm text-slate-500 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
              Configure Firebase to save reports, users, and submissions permanently in the cloud. 
              Without this, data is only stored in the browser's local storage and may be lost if cache is cleared.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">API Key</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-lg p-3 font-mono text-sm bg-white text-slate-900"
                  value={config.firebaseConfig?.apiKey || ''}
                  onChange={e => setConfig({...config, firebaseConfig: {...(config.firebaseConfig || {} as any), apiKey: e.target.value}})}
                  placeholder="AIzaSy..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Auth Domain</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-lg p-3 font-mono text-sm bg-white text-slate-900"
                  value={config.firebaseConfig?.authDomain || ''}
                  onChange={e => setConfig({...config, firebaseConfig: {...(config.firebaseConfig || {} as any), authDomain: e.target.value}})}
                  placeholder="project.firebaseapp.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Project ID</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-lg p-3 font-mono text-sm bg-white text-slate-900"
                  value={config.firebaseConfig?.projectId || ''}
                  onChange={e => setConfig({...config, firebaseConfig: {...(config.firebaseConfig || {} as any), projectId: e.target.value}})}
                  placeholder="project-id"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Storage Bucket</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-lg p-3 font-mono text-sm bg-white text-slate-900"
                  value={config.firebaseConfig?.storageBucket || ''}
                  onChange={e => setConfig({...config, firebaseConfig: {...(config.firebaseConfig || {} as any), storageBucket: e.target.value}})}
                  placeholder="project.appspot.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Messaging Sender ID</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-lg p-3 font-mono text-sm bg-white text-slate-900"
                  value={config.firebaseConfig?.messagingSenderId || ''}
                  onChange={e => setConfig({...config, firebaseConfig: {...(config.firebaseConfig || {} as any), messagingSenderId: e.target.value}})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">App ID</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-lg p-3 font-mono text-sm bg-white text-slate-900"
                  value={config.firebaseConfig?.appId || ''}
                  onChange={e => setConfig({...config, firebaseConfig: {...(config.firebaseConfig || {} as any), appId: e.target.value}})}
                  placeholder="1:1234567890:web:..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-400" />
              Stripe API Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Publishable Key</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-lg p-3 font-mono text-sm bg-white text-slate-900"
                  placeholder="pk_test_..."
                  value={config.stripePublicKey || ''}
                  onChange={e => setConfig({...config, stripePublicKey: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Secret Key</label>
                <input 
                  type="password" 
                  className="w-full border border-slate-200 rounded-lg p-3 font-mono text-sm bg-white text-slate-900"
                  placeholder="sk_test_..."
                  value={config.stripeSecretKey || ''}
                  onChange={e => setConfig({...config, stripeSecretKey: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5 text-slate-400" />
              SendGrid API Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">SendGrid API Key</label>
                <input 
                  type="password" 
                  className="w-full border border-slate-200 rounded-lg p-3 font-mono text-sm bg-white text-slate-900"
                  placeholder="SG.xxxxxxxx..."
                  value={config.sendGridApiKey || ''}
                  onChange={e => setConfig({...config, sendGridApiKey: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Sender Email</label>
                <input 
                  type="email" 
                  className="w-full border border-slate-200 rounded-lg p-3 font-mono text-sm bg-white text-slate-900"
                  placeholder="noreply@safedate.com"
                  value={config.sendGridFromEmail || ''}
                  onChange={e => setConfig({...config, sendGridFromEmail: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <button 
              onClick={handleConfigSave}
              className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 w-full md:w-auto"
            >
              Save All Configurations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;