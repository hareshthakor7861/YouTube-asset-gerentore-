import React from 'react';
import { HistoryItem, AssetType } from '../types';

interface HistoryProps {
  history: HistoryItem[];
  onClearHistory: () => void;
}

const History: React.FC<HistoryProps> = ({ history, onClearHistory }) => {
  if (history.length === 0) {
    return null; // Don't render the section if history is empty
  }

  const handleClearClick = () => {
    if (window.confirm('Are you sure you want to clear your entire generation history? This action cannot be undone.')) {
      onClearHistory();
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-16">
      <div className="flex justify-between items-center mb-6 px-4 sm:px-0">
        <h2 className="text-3xl font-bold text-gray-200">Generation History</h2>
        {history.length > 0 && (
          <button
            onClick={handleClearClick}
            className="bg-gray-700 text-gray-300 hover:bg-gray-600 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 text-sm"
          >
            Clear History
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {history.map((item) => {
          const fileExtension = item.type === AssetType.Intro ? 'mp4' : 'png';
          const downloadFilename = `generated-${item.type.toLowerCase()}-${item.id}.${fileExtension}`;

          return (
          <div key={item.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 flex flex-col group transition-all duration-300 hover:shadow-red-500/20 hover:border-red-800">
            <div className="relative overflow-hidden bg-gray-900/50 h-40 flex items-center justify-center">
                {item.imageUrl && ( item.type === AssetType.Intro
                    ? <video src={item.imageUrl} controls className="max-w-full max-h-full object-contain" />
                    : <img src={item.imageUrl} alt={`Generated ${item.type}`} className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                )}
                {item.type !== AssetType.Intro && <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>}
            </div>

            <div className="p-4 flex flex-col flex-grow">
              <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full self-start ${
                item.type === AssetType.Logo ? 'bg-blue-500/20 text-blue-300' :
                item.type === AssetType.Banner ? 'bg-purple-500/20 text-purple-300' :
                item.type === AssetType.Intro ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-green-500/20 text-green-300'
              }`}>
                {item.type}
              </span>
              <p className="text-sm text-gray-400 mt-2 flex-grow clamp-3" title={item.prompt}>
                {item.prompt}
              </p>
              <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-700/50">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
            {item.imageUrl && (
              <div className="p-4 bg-gray-900/50 border-t border-gray-700">
                 <a
                  href={item.imageUrl}
                  download={downloadFilename}
                  className="w-full inline-block text-center bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-300"
                  >
                  Download
                  </a>
              </div>
            )}
          </div>
        )})}
      </div>
       <style>{`
        .clamp-3 {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3;
            overflow: hidden;
            text-overflow: ellipsis;
            min-height: 4.5rem; /* 3 lines * 1.5rem line-height */
        }
      `}</style>
    </div>
  );
};

export default History;