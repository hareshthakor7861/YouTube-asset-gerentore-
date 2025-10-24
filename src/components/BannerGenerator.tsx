import React, { useState } from 'react';
import { generateImage, generateImageWithImageInput } from '../services/geminiService';
import { YOUTUBE_BANNER_SIZE } from '../constants';
import ImagePreview from './ImagePreview';
import { AssetType } from '../types';
import { getFriendlyErrorMessage } from '../utils/errorHandler';

interface BannerGeneratorProps {
  onAssetGenerated: (item: { type: AssetType, imageUrl: string, prompt: string }) => void;
}

const BannerGenerator: React.FC<BannerGeneratorProps> = ({ onAssetGenerated }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [useCustomSize, setUseCustomSize] = useState<boolean>(false);
  const [width, setWidth] = useState<number>(YOUTUBE_BANNER_SIZE.width);
  const [height, setHeight] = useState<number>(YOUTUBE_BANNER_SIZE.height);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // remove the data:mime/type;base64, prefix
        resolve(result.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a description for your banner.');
      return;
    }

    setLoading(true);
    setError(null);
    setImageUrl(null);

    const bannerDimensions = useCustomSize ? `${width}x${height}` : `${YOUTUBE_BANNER_SIZE.width}x${YOUTUBE_BANNER_SIZE.height}`;

    try {
      let resultUrl: string;

      if (logoFile) {
        const base64Data = await fileToBase64(logoFile);
        const fullPrompt = `Create a visually stunning YouTube channel banner (${bannerDimensions} pixels) with a 16:9 aspect ratio.
        - Theme: "${prompt}"
        - Instructions:
        1. Use the provided channel logo image. Place it tastefully and prominently within the banner's central safe area (1546x423 pixels), usually on the left or right side.
        2. Design a background and overall aesthetic that complements the logo and the channel theme.
        3. The core content (like channel name or tagline, which you should create if not specified) should be clearly visible within the safe area.
        4. The final design must be cohesive, professional, and captivating on all devices.`;
        resultUrl = await generateImageWithImageInput(fullPrompt, base64Data, logoFile.type);
      } else {
        const fullPrompt = `Create a visually stunning YouTube channel banner (${bannerDimensions} pixels). The core content and channel name should be clearly visible within the central safe area (1546x423 pixels). The banner's theme should be: "${prompt}". Design it to be captivating on desktop, mobile, and TV screens.`;
        resultUrl = await generateImage(fullPrompt, YOUTUBE_BANNER_SIZE.aspectRatio);
      }
      
      setImageUrl(resultUrl);
      onAssetGenerated({
        type: AssetType.Banner,
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
      <h2 className="text-2xl font-bold text-center mb-1 text-red-400">YouTube Banner Generator</h2>
      <p className="text-center text-gray-400 mb-6">Describe your channel's theme. Our AI will create a banner with the optimal size (2560x1440 px). You can also provide custom dimensions.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="banner-prompt" className="block text-sm font-medium text-gray-300 mb-1">
            Banner Description
          </label>
          <input
            id="banner-prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., a futuristic cityscape at night for a tech channel"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 transition"
            disabled={loading}
            title="Describe the mood and style for your banner. e.g., 'a serene mountain landscape for a travel channel'."
          />
        </div>

        <div className="space-y-3">
            <label htmlFor="custom-size-toggle" className="flex items-center text-sm font-medium text-gray-300 cursor-pointer">
                <input
                    id="custom-size-toggle"
                    type="checkbox"
                    checked={useCustomSize}
                    onChange={(e) => setUseCustomSize(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-500 bg-gray-800 text-red-600 focus:ring-red-600 focus:ring-offset-gray-900"
                    disabled={loading}
                />
                <span className="ml-2">Use Custom Banner Dimensions</span>
            </label>
            
            {useCustomSize && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    <div>
                        <label htmlFor="banner-width" className="block text-xs font-medium text-gray-400 mb-1">Width (px)</label>
                        <input
                            id="banner-width"
                            type="number"
                            value={width}
                            onChange={(e) => setWidth(parseInt(e.target.value, 10) || 0)}
                            className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md focus:ring-red-500 focus:border-red-500 transition text-sm"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label htmlFor="banner-height" className="block text-xs font-medium text-gray-400 mb-1">Height (px)</label>
                        <input
                            id="banner-height"
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(parseInt(e.target.value, 10) || 0)}
                            className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md focus:ring-red-500 focus:border-red-500 transition text-sm"
                            disabled={loading}
                        />
                    </div>
                     <p className="col-span-1 sm:col-span-2 text-xs text-gray-500 mt-1">Note: The AI will design for these dimensions. The final image will be generated at a 16:9 aspect ratio.</p>
                </div>
            )}
        </div>


        <div>
          <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-300 mb-1">
            Upload Channel Logo (Optional)
          </label>
          <div className="mt-2 flex items-center gap-4">
            {logoPreview && <img src={logoPreview} alt="Logo Preview" className="w-16 h-16 rounded-full object-cover bg-gray-800" />}
            <input 
              id="logo-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleLogoChange} 
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600/20 file:text-red-300 hover:file:bg-red-600/40" 
              disabled={loading} 
              title="Upload your channel logo to automatically include it in the banner." 
            />
          </div>
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
            'Generate Banner'
          )}
        </button>
      </form>
      <ImagePreview imageUrl={imageUrl} loading={loading} error={error} assetType="Banner" />
    </div>
  );
};

export default BannerGenerator;