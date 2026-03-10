
import React from 'react';
import { SavedRecord, User } from '../types';
import { Search, MapPin, Calendar, Trash2, ChevronRight, User as UserIcon, Database, Link as LinkIcon } from 'lucide-react';

interface DatabaseViewProps {
  records: SavedRecord[];
  onSelect: (record: SavedRecord) => void;
  onDelete: (id: string) => void;
  onNewSearch: () => void;
  currentUser: User | null;
}

const DatabaseView: React.FC<DatabaseViewProps> = ({ records, onSelect, onDelete, onNewSearch, currentUser }) => {
  
  const handleShare = (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}/?shareId=${recordId}`;
    navigator.clipboard.writeText(link);
    alert("Public Report Link copied to clipboard!");
  };

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
          <Database className="w-10 h-10 text-slate-400 opacity-50" />
        </div>
        <div className="max-w-md">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Your Database is Empty</h3>
          <p className="text-slate-500 mb-6">
            When you run background checks, save them here to build your own personal database of verified profiles.
          </p>
          <button 
            onClick={onNewSearch}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg font-bold shadow-md hover:bg-teal-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Search className="w-4 h-4" />
            Start First Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-6 h-6 text-teal-600" />
          Saved Profiles
        </h2>
        <button 
          onClick={onNewSearch}
          className="text-sm font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 px-4 py-2 rounded-lg transition-colors"
        >
          + New Search
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {records.map((record) => (
          <div 
            key={record.id}
            className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow overflow-hidden flex flex-col"
          >
            <div 
              className="p-5 flex-grow cursor-pointer"
              onClick={() => onSelect(record)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-6 h-6 text-slate-400" />
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
                  {new Date(record.report.timestamp).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-1 truncate">
                {record.params.firstName} {record.params.lastName}
              </h3>
              
              <div className="space-y-1">
                <p className="text-sm text-slate-500 flex items-center gap-2 truncate">
                  <MapPin className="w-3 h-3" /> {record.params.location}
                </p>
                {record.params.dob && (
                  <p className="text-sm text-slate-500 flex items-center gap-2 truncate">
                    <Calendar className="w-3 h-3" /> {record.params.dob}
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-slate-50 p-3 border-t border-slate-100 flex items-center justify-between">
              <button 
                onClick={() => onDelete(record.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Record"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2">
                 {currentUser?.role === 'ADMIN' && (
                    <button 
                      onClick={(e) => handleShare(record.id, e)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Share Public Link"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                 )}

                 <button 
                  onClick={() => onSelect(record)}
                  className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 pr-2"
                >
                  View <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatabaseView;
