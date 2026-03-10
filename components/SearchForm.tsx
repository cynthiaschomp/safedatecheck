
import React, { useState, useRef, useEffect } from 'react';
import { SearchParams } from '../types';
import { Search, Shield, MapPin, Calendar, Info, UserPlus, Link as LinkIcon, Image as ImageIcon, X } from 'lucide-react';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isSearching: boolean;
  initialValues?: SearchParams | null;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isSearching, initialValues }) => {
  const [formData, setFormData] = useState<SearchParams>({
    firstName: '',
    lastName: '',
    location: '',
    dob: '',
    additionalContext: '',
    aliases: '',
    socialProfiles: '',
    image: undefined,
    imageMimeType: undefined
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill form if initialValues provided (e.g. refining a search)
  useEffect(() => {
    if (initialValues) {
      setFormData(prev => ({
        ...prev,
        ...initialValues
      }));
    }
  }, [initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Convert to Base64 for API
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Strip the data:image/xyz;base64, prefix for the API
        const base64Data = base64String.split(',')[1];
        
        setFormData(prev => ({ 
          ...prev, 
          image: base64Data,
          imageMimeType: file.type
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setFormData(prev => ({ ...prev, image: undefined, imageMimeType: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(formData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-center">
        <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">SafeDate Check</h2>
        <p className="text-teal-50">Deep-dive background search with safety scoring.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g. John"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all bg-white text-slate-900"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              placeholder="e.g. Doe"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all bg-white text-slate-900"
            />
          </div>
        </div>

        {/* Location & DOB */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              State / Location <span className="text-red-500">*</span>
            </label>
            <select
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all bg-white text-slate-900"
            >
              <option value="">Select Scope</option>
              <option value="Nationwide">Nationwide (USA)</option>
              <option value="Alabama">Alabama</option>
              <option value="Alaska">Alaska</option>
              <option value="Arizona">Arizona</option>
              <option value="Arkansas">Arkansas</option>
              <option value="California">California</option>
              <option value="Colorado">Colorado</option>
              <option value="Connecticut">Connecticut</option>
              <option value="Delaware">Delaware</option>
              <option value="Florida">Florida</option>
              <option value="Georgia">Georgia</option>
              <option value="Hawaii">Hawaii</option>
              <option value="Idaho">Idaho</option>
              <option value="Illinois">Illinois</option>
              <option value="Indiana">Indiana</option>
              <option value="Iowa">Iowa</option>
              <option value="Kansas">Kansas</option>
              <option value="Kentucky">Kentucky</option>
              <option value="Louisiana">Louisiana</option>
              <option value="Maine">Maine</option>
              <option value="Maryland">Maryland</option>
              <option value="Massachusetts">Massachusetts</option>
              <option value="Michigan">Michigan</option>
              <option value="Minnesota">Minnesota</option>
              <option value="Mississippi">Mississippi</option>
              <option value="Missouri">Missouri</option>
              <option value="Montana">Montana</option>
              <option value="Nebraska">Nebraska</option>
              <option value="Nevada">Nevada</option>
              <option value="New Hampshire">New Hampshire</option>
              <option value="New Jersey">New Jersey</option>
              <option value="New Mexico">New Mexico</option>
              <option value="New York">New York</option>
              <option value="North Carolina">North Carolina</option>
              <option value="North Dakota">North Dakota</option>
              <option value="Ohio">Ohio</option>
              <option value="Oklahoma">Oklahoma</option>
              <option value="Oregon">Oregon</option>
              <option value="Pennsylvania">Pennsylvania</option>
              <option value="Rhode Island">Rhode Island</option>
              <option value="South Carolina">South Carolina</option>
              <option value="South Dakota">South Dakota</option>
              <option value="Tennessee">Tennessee</option>
              <option value="Texas">Texas</option>
              <option value="Utah">Utah</option>
              <option value="Vermont">Vermont</option>
              <option value="Virginia">Virginia</option>
              <option value="Washington">Washington</option>
              <option value="West Virginia">West Virginia</option>
              <option value="Wisconsin">Wisconsin</option>
              <option value="Wyoming">Wyoming</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              DOB or Age Range
            </label>
            <input
              type="text"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              placeholder="e.g. 05/12/1990 or 'Approx 30'"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all bg-white text-slate-900"
            />
          </div>
        </div>

        {/* Aliases */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-slate-400" />
            Aliases / Nicknames
          </label>
          <input
            type="text"
            name="aliases"
            value={formData.aliases}
            onChange={handleChange}
            placeholder="e.g. Johnny, J-Dog, or middle name"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all bg-white text-slate-900"
          />
        </div>

        {/* Social Profiles */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-slate-400" />
            Known Social Profiles
          </label>
          <input
            type="text"
            name="socialProfiles"
            value={formData.socialProfiles}
            onChange={handleChange}
            placeholder="e.g. Instagram handle, Facebook URL, LinkedIn"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all bg-white text-slate-900"
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-slate-400" />
            Photo / Dating Profile Screenshot (Optional)
          </label>
          
          {!previewUrl ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-all group bg-white"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-teal-100">
                <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-teal-600" />
              </div>
              <p className="text-sm text-slate-600 font-medium">Click to upload image</p>
              <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG</p>
            </div>
          ) : (
            <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 bg-white p-2 flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow">
                <p className="text-sm font-medium text-slate-700">Image attached</p>
                <p className="text-xs text-slate-500">Will be analyzed for text and matching faces.</p>
              </div>
              <button 
                type="button"
                onClick={clearImage}
                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Additional Context */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" />
            Additional Context
          </label>
          <input
            type="text"
            name="additionalContext"
            value={formData.additionalContext}
            onChange={handleChange}
            placeholder="e.g. Works at Tech Corp, University..."
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all bg-white text-slate-900"
          />
        </div>

        <button
          type="submit"
          disabled={isSearching}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all
            ${isSearching 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-teal-600 hover:bg-teal-700 hover:shadow-xl active:scale-[0.99]'
            }`}
        >
          {isSearching ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Running Deep Search...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              {initialValues ? 'Refine & Re-Run Search' : 'Run Background Check'}
            </>
          )}
        </button>

        <p className="text-xs text-center text-slate-400 mt-4">
          By using this tool, you agree that this information is for personal safety only and not for employment, credit, or tenant screening purposes (FCRA compliance).
        </p>
      </form>
    </div>
  );
};

export default SearchForm;
