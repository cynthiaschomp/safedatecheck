
import React from 'react';
import { ArrowLeft, Scale, Shield, FileText, Database, Server } from 'lucide-react';

interface LegalViewProps {
  mode: 'TOS' | 'PRIVACY';
  onBack: () => void;
}

const LegalView: React.FC<LegalViewProps> = ({ mode, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto pb-20 mt-10 animate-fade-in-up px-6">
      <button 
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-teal-600 font-medium transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to App
      </button>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            {mode === 'TOS' ? (
              <Scale className="w-10 h-10 text-teal-400" />
            ) : (
              <Shield className="w-10 h-10 text-teal-400" />
            )}
            <div>
              <h1 className="text-3xl font-bold">
                {mode === 'TOS' ? 'Terms of Service' : 'Privacy Policy'}
              </h1>
              <p className="text-slate-400">Effective Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="p-8 prose prose-slate max-w-none">
          {mode === 'TOS' ? (
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-bold text-slate-800">1. Acceptance of Terms</h3>
                <p>By accessing and using SafeDate Check, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
              </section>

              <section className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                   <FileText className="w-5 h-5" /> 
                   2. Account Creation & Public Profiles
                </h3>
                <p className="font-semibold text-indigo-800 mt-2">
                  IMPORTANT: Reciprocal Data Policy
                </p>
                <p className="text-indigo-900/80">
                  By creating an account on SafeDate Check, you explicitly acknowledge and agree that a public profile regarding your own identity may be created or maintained within our system. This profile may include public records, court documents, and community feedback submitted by other users. 
                </p>
                <p className="text-indigo-900/80 mt-2">
                  Our platform operates on a transparency model. To view safety data about others, you agree to be part of the safety ecosystem yourself.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-800">3. User Conduct</h3>
                <p>You agree to use this service only for personal safety purposes. You may not use this information for employment screening, tenant screening, credit evaluation, or any purpose covered by the Fair Credit Reporting Act (FCRA).</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-800">4. Data Accuracy & AI Limitations</h3>
                <p>
                  Our services utilize Artificial Intelligence (AI) to aggregate and analyze public records. While we strive for accuracy, public records may be incomplete, outdated, or inaccurate. The AI analysis, including "Safety Scores" and "Risk Assessments," are algorithmic estimates and should not be considered legal advice or absolute fact. You agree to verify all critical information with official government sources.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-800">5. Cancellation & Data Removal</h3>
                <p>
                  You may request the removal of your data from our public search results at any time via the "Remove My Data" form. 
                  <strong className="block mt-2">Effect of Removal:</strong>
                  Requesting removal of your public data constitutes an immediate cancellation of your account and termination of your access to our services. We do not allow anonymous users to query our database while hiding their own presence.
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-8">
              <section>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Database className="w-5 h-5 text-teal-600" />
                  1. Information We Collect
                </h3>
                <p className="mb-4">We collect information to provide our safety services, improve user experience, and maintain community integrity. This includes:</p>
                
                <ul className="list-disc pl-5 space-y-2 text-slate-700">
                  <li>
                    <strong>Information You Provide:</strong> When you create an account, we collect your name, email, username, and payment information. When you submit reviews or evidence, we store the content of those submissions.
                  </li>
                  <li>
                    <strong>Public Records & Aggregated Data:</strong> We access third-party public databases, court records, news archives, and social media platforms to compile background reports. This data is publicly available information that we synthesize for easier consumption.
                  </li>
                  <li>
                    <strong>AI Analysis Data:</strong> When you upload screenshots or documents for analysis, our AI processes this content to identify patterns. This content is temporarily processed and may be stored as part of the evidence record if you choose to submit it.
                  </li>
                  <li>
                    <strong>Usage Data:</strong> We collect information on how you interact with the service, including search queries, time spent on reports, and feature usage to detect abuse and improve performance.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Server className="w-5 h-5 text-teal-600" />
                  2. How We Use Your Data
                </h3>
                <p>We use the collected data for the following purposes:</p>
                <ul className="list-disc pl-5 space-y-2 text-slate-700 mt-2">
                  <li><strong>Service Provision:</strong> To generate background checks, safety scores, and risk assessments.</li>
                  <li><strong>Community Safety:</strong> To identify potential risks through cross-referencing user submissions with public records.</li>
                  <li><strong>Accountability:</strong> To enforce our Reciprocal Data Policy, ensuring that those who search for others are also identifiable within the system.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-800">3. Anonymity of Submitters</h3>
                <p>
                  We prioritize the safety of our whistleblowers and contributors. Any "Social Feedback" or "Evidence" you submit about an individual will be displayed publicly as "Anonymous Community Member". 
                  <br/>
                  Your email address and identity are strictly confidential and visible only to system administrators for moderation purposes.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-800">4. Data Retention</h3>
                <p>We retain account information as long as your account is active. Public record data is cached to improve performance. If you request data removal, we block your specific profile from appearing in search results, though we retain a record of the request for legal compliance.</p>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalView;
