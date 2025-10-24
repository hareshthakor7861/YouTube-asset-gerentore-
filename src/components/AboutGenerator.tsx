import React, { useState, useEffect, useRef } from 'react';
import { generateText } from '../services/geminiService';
import { getFriendlyErrorMessage } from '../utils/errorHandler';

const AboutGenerator: React.FC = () => {
  const [channelName, setChannelName] = useState<string>('');
  const [channelCategory, setChannelCategory] = useState<string>('');
  const [tone, setTone] = useState<string>('Friendly');
  const [language, setLanguage] = useState<string>('English');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAbout, setGeneratedAbout] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>('');

  const channelNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    channelNameInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim() || !channelCategory.trim()) {
      setError('Please provide both a channel name and a category.');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedAbout(null);
    setCopySuccess('');

    try {
      const prompt = `Generate a compelling YouTube channel 'About' page description in ${language}.
- Channel Name: "${channelName}"
- Channel Category/Topic: "${channelCategory}"
- Desired Tone: "${tone}"

The description should be engaging for the target audience. It must clearly explain what the channel is about, detail the type of content and upload frequency (you can invent a realistic schedule, e.g., 'new videos every week'), and conclude with a strong call to action, encouraging viewers to subscribe.`;
      const result = await generateText(prompt);
      setGeneratedAbout(result);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedAbout) {
      navigator.clipboard.writeText(generatedAbout).then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      }, () => {
        setCopySuccess('Failed to copy');
      });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-1 text-red-400">YouTube 'About' Page Generator</h2>
      <p className="text-center text-gray-400 mb-6">Describe your channel, and our AI will write a professional 'About' page for you.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="channel-name-about" className="block text-sm font-medium text-gray-300 mb-1">Channel Name</label>
          <input ref={channelNameInputRef} id="channel-name-about" type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="e.g., The Creative Coder" className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 transition" disabled={loading} />
        </div>
        <div>
          <label htmlFor="channel-category-about" className="block text-sm font-medium text-gray-300 mb-1">Channel Category / Topics</label>
          <input id="channel-category-about" type="text" value={channelCategory} onChange={(e) => setChannelCategory(e.target.value)} placeholder="e.g., Web development tutorials, creative coding" className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 transition" disabled={loading} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="tone-select" className="block text-sm font-medium text-gray-300 mb-1">Tone of Voice</label>
                <select id="tone-select" value={tone} onChange={(e) => setTone(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 transition" disabled={loading}>
                    <option>Friendly</option>
                    <option>Professional</option>
                    <option>Humorous</option>
                    <option>Inspirational</option>
                    <option>Educational</option>
                </select>
            </div>
            <div>
                <label htmlFor="language-select-about" className="block text-sm font-medium text-gray-300 mb-1">Language</label>
                <select id="language-select-about" value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 transition" disabled={loading}>
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Gujarati</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Japanese</option>
                </select>
            </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center">
          {loading ? (
            <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div> Generating...</>
          ) : 'Generate About Page'}
        </button>
      </form>

      {loading && (
        <div className="mt-6 w-full h-48 flex flex-col items-center justify-center bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-600">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          <p className="mt-4 text-gray-300">Writing your 'About' page...</p>
        </div>
      )}

      {error && (
        <div className="mt-6 w-full p-4 flex items-center justify-center bg-red-900/30 text-red-300 border border-red-700 rounded-lg">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {generatedAbout && !loading && (
        <div className="mt-6 space-y-4">
          <h3 className="text-xl font-semibold text-center">Generated 'About' Page</h3>
          <div className="bg-gray-800 p-4 rounded-md whitespace-pre-wrap font-mono text-sm text-gray-300 relative border border-gray-600">
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded text-xs transition-colors"
              title="Copy to clipboard"
            >
              {copySuccess || 'Copy'}
            </button>
            <p>{generatedAbout}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutGenerator;