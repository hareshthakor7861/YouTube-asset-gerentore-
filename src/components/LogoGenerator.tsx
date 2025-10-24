import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { YOUTUBE_LOGO_SIZE } from '../constants';
import ImagePreview from './ImagePreview';
import { AssetType } from '../types';
import { getFriendlyErrorMessage } from '../utils/errorHandler';

interface LogoGeneratorProps {
  onAssetGenerated: (item: { type: AssetType, imageUrl: string, prompt: string }) => void;
}

const LogoGenerator: React.FC<LogoGeneratorProps> = ({ onAssetGenerated }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a description for your logo.');
      return;
    }

    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const fullPrompt = `Create a professional, circular YouTube channel logo with a transparent background. The logo should be based on this description: "${prompt}". It needs to be simple, memorable, and visually appealing in small sizes.`;
      const resultUrl = await generateImage(fullPrompt, YOUTUBE_LOGO_SIZE.aspectRatio);
      setImageUrl(resultUrl);
      onAssetGenerated({
        type: AssetType.Logo,
        imageUrl: resultUrl,
        prompt: prompt,
      });
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-1 text-red-400">YouTube Logo Generator</h2>
      <p className="text-center text-gray-400 mb-6">Describe your channel to generate a unique logo (800x800 px).</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="logo-prompt" className="block text-sm font-medium text-gray-300 mb-1">
            Logo Description
          </label>
          <input
            id="logo-prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., a minimalist gaming controller with neon lines"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 transition"
            disabled={loading}
            title="Describe the key elements of your logo. e.g., 'a stylized letter S with a flame'."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Generating...
            </>
          ) : (
            'Generate Logo'
          )}
        </button>
      </form>
      <ImagePreview imageUrl={imageUrl} loading={loading} error={error} assetType="Logo" />
    </div>
  );
};

export default LogoGenerator;