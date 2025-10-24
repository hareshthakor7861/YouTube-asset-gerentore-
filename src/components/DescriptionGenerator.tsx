import React, { useState, useEffect, useRef } from 'react';
import { generateText } from '../services/geminiService';
import { getFriendlyErrorMessage } from '../utils/errorHandler';

const DescriptionGenerator: React.FC = () => {
  const [songTitle, setSongTitle] = useState<string>('');
  const [singerName, setSingerName] = useState<string>('');
  const [language, setLanguage] = useState<string>('English');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedDescription, setGeneratedDescription] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>('');

  const songTitleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    songTitleInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim() || !singerName.trim()) {
      setError('Please provide both song title and artist name.');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedDescription(null);
    setCopySuccess('');

    try {
        const prompt = `Generate a compelling YouTube video description in ${language} for the song "${songTitle}" by "${singerName}". The description should be enthusiastic, mention both the song title and artist, include a call to action (e.g., "Listen now on your favorite streaming platforms!", "Don't forget to Like, Share, and Subscribe!"), and end with a list of 5 relevant hashtags in the same language.`;
        const result = await generateText(prompt);
        setGeneratedDescription(result);
    } catch (err: any) {
        setError(getFriendlyErrorMessage(err));
    } finally {
        setLoading(false);
    }
  };
  
  const handleCopy = () => {
    if (generatedDescription) {
        navigator.clipboard.writeText(generatedDescription).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed to copy');
        });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-1 text-red-400">YouTube Description Generator</h2>
      <p className="text-center text-gray-400 mb-6">Enter song details to generate a description with hashtags in your chosen language.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="song-title-desc" className="block text-sm font-medium text-gray-300 mb-1">Song Title</label>
          <input ref={songTitleInputRef} id="song-title-desc" type="text" value={songTitle} onChange={(e) => setSongTitle(e.target.value)} placeholder="e.g., Midnight City Lights" className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 transition" disabled={loading} />
        </div>
        <div>
          <label htmlFor="singer-name-desc" className="block text-sm font-medium text-gray-300 mb-1">Singer / Artist Name</label>
          <input id="singer-name-desc" type="text" value={singerName} onChange={(e) => setSingerName(e.target.value)} placeholder="e.g., Aria" className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 transition" disabled={loading} />
        </div>
        <div>
            <label htmlFor="language-select" className="block text-sm font-medium text-gray-300 mb-1">Language</label>
            <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 transition"
                disabled={loading}
            >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Japanese">Japanese</option>
            </select>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center">
          {loading ? (
            <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div> Generating...</>
          ) : 'Generate Description'}
        </button>
      </form>
      
      {loading && (
          <div className="mt-6 w-full h-48 flex flex-col items-center justify-center bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-600">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            <p className="mt-4 text-gray-300">Generating description...</p>
          </div>
      )}

      {error && (
        <div className="mt-6 w-full p-4 flex items-center justify-center bg-red-900/30 text-red-300 border border-red-700 rounded-lg">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {generatedDescription && !loading && (
        <div className="mt-6 space-y-4">
          <h3 className="text-xl font-semibold text-center">Generated Description</h3>
          <div className="bg-gray-800 p-4 rounded-md whitespace-pre-wrap font-mono text-sm text-gray-300 relative border border-gray-600">
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded text-xs transition-colors"
              title="Copy to clipboard"
            >
              {copySuccess || 'Copy'}
            </button>
            <p>{generatedDescription}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DescriptionGenerator;