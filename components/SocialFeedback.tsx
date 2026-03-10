import React, { useState } from 'react';
import { SocialFeedback } from '../types';
import { MessageSquare, ThumbsUp, ThumbsDown, AlertTriangle, User, Send, Tag, EyeOff } from 'lucide-react';

interface SocialFeedbackProps {
  reviews: SocialFeedback[];
  onAddReview: (review: Omit<SocialFeedback, 'id' | 'timestamp' | 'isVerified'>) => void;
  firstName: string;
  isRedacted?: boolean;
}

const SocialFeedback: React.FC<SocialFeedbackProps> = ({ reviews, onAddReview, firstName, isRedacted = false }) => {
  const [rating, setRating] = useState<number>(3);
  const [comment, setComment] = useState('');
  const [relationship, setRelationship] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Calculate Community Trust Score (0-100) based on average rating (1-5)
  const avgRating = reviews.length > 0 
    ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length 
    : 0;
  
  // Convert 1-5 scale to 0-100% for the meter (1=0%, 5=100%)
  const trustScore = reviews.length > 0 ? ((avgRating - 1) / 4) * 100 : 50;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddReview({
      rating,
      comment,
      relationship,
      tags: selectedTags
    });
    setComment('');
    setRelationship('');
    setSelectedTags([]);
    setIsFormOpen(false);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const availableTags = [
    "Safe", "Aggressive", "Catfish", "Married", "Kind", 
    "Liar", "Generous", "Stalker", "Ghosted", "Cheater"
  ];

  const getMeterColor = (score: number) => {
    if (score >= 75) return 'bg-emerald-500';
    if (score >= 50) return 'bg-blue-500';
    if (score >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border mt-8 transition-colors ${isRedacted ? 'border-red-100 bg-red-50/10' : 'border-indigo-100'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isRedacted ? 'text-slate-700' : 'text-slate-900'}`}>
            <MessageSquare className={`w-6 h-6 ${isRedacted ? 'text-slate-400' : 'text-indigo-600'}`} />
            Community Feedback
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Crowdsourced reviews from other users. 
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
              <AlertTriangle className="w-3 h-3 mr-1 text-amber-500" />
              UNVERIFIED DATA
            </span>
          </p>
        </div>

        {reviews.length > 0 ? (
          <div className="flex items-center gap-4 bg-indigo-50 p-3 rounded-xl border border-indigo-100 w-full md:w-auto">
            <div className="text-right flex-grow md:flex-grow-0">
              <p className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">Community Trust</p>
              <p className="text-2xl font-black text-indigo-900">
                {Math.round(trustScore)}<span className="text-sm font-normal text-indigo-400">/100</span>
              </p>
            </div>
            <div className="h-12 w-2 rounded-full bg-slate-200 overflow-hidden flex flex-col justify-end">
              <div 
                className={`w-full transition-all duration-1000 ease-out ${getMeterColor(trustScore)}`}
                style={{ height: `${trustScore}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-400 italic">No community reviews yet</div>
        )}
      </div>

      {/* Redacted View */}
      {isRedacted && reviews.length > 0 && (
        <div className="bg-white border-l-4 border-red-400 p-4 rounded-r-lg shadow-sm mb-6">
          <div className="flex items-start gap-3">
             <EyeOff className="w-5 h-5 text-red-400 mt-1" />
             <div>
               <p className="font-bold text-red-900 mb-1">Feedback Redacted</p>
               <p className="text-slate-700">
                 The community indicated to us that this person may be a risk. Specific comments have been hidden due to a data removal request.
               </p>
             </div>
          </div>
        </div>
      )}

      {/* Review List - Only if NOT Redacted */}
      {!isRedacted && (
        <div className="space-y-4 mb-8">
          {reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs
                      ${review.rating >= 4 ? 'bg-emerald-500' : review.rating <= 2 ? 'bg-red-500' : 'bg-yellow-500'}`}>
                      {review.rating}/5
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Anonymous</p>
                      <p className="text-[10px] text-slate-400">{review.relationship} • {new Date(review.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {review.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap justify-end max-w-[50%]">
                      {review.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed pl-10">"{review.comment}"</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-500 mb-2">Have you met {firstName}?</p>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="text-indigo-600 font-semibold hover:underline text-sm"
              >
                Be the first to leave a review
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Review Button/Form (Hidden if Redacted) */}
      {!isRedacted && !isFormOpen && reviews.length > 0 && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="w-full py-3 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-600 font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Add Your Experience
          </button>
      )}

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white border border-indigo-200 rounded-xl p-5 shadow-lg animate-fade-in-up">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Submit Anonymous Feedback
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Safety Rating</label>
              <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all
                      ${rating === num 
                        ? (num >= 4 ? 'bg-emerald-500 text-white' : num <= 2 ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white') 
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                  >
                    {num === 1 ? 'High Risk' : num === 5 ? 'Safe' : num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                      ${selectedTags.includes(tag)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Relationship</label>
                <select 
                  required
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none bg-white text-slate-900"
                >
                  <option value="">Select...</option>
                  <option value="Dated">Dated</option>
                  <option value="Met Online">Met Online</option>
                  <option value="Friend">Friend</option>
                  <option value="Ex-Spouse">Ex-Spouse</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Acquaintance">Acquaintance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Comment</label>
              <textarea
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience clearly. Do not share private contact info."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none min-h-[80px] bg-white text-slate-900"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 py-2 text-slate-500 font-medium hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Feedback
              </button>
            </div>
            
            <p className="text-[10px] text-center text-slate-400">
              By submitting, you confirm this information is true to the best of your knowledge.
            </p>
          </div>
        </form>
      )}
    </div>
  );
};

export default SocialFeedback;