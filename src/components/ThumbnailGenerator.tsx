import React, { useState } from 'react';
import { generateImageWithImageInput, generateText } from '../services/geminiService';
import ImagePreview from './ImagePreview';
import { AssetType } from '../types';
import { getFriendlyErrorMessage } from '../utils/errorHandler';

interface ThumbnailGeneratorProps {
  onAssetGenerated: (item: { type: AssetType, imageUrl: string, prompt: string }) => void;
}

const ThumbnailGenerator: React.FC<ThumbnailGeneratorProps> = ({ onAssetGenerated }) => {
  const [songTitle, setSongTitle] = useState<string>('');
  const [singerName, setSingerName] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
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
    if (!songTitle || !singerName || !imageFile) {
      setError('Please fill in all fields and upload an image.');
      return;
    }

    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const descriptionPrompt = `Generate a short, creative, and visually descriptive prompt for a YouTube song thumbnail. Based on the song title "${songTitle}" by "${singerName}", describe a fitting mood, style, color palette, and background elements.`;
      
      const creativeDescription = await generateText(descriptionPrompt);

      const base64Data = await fileToBase64(imageFile);
      const fullPrompt = `Create an eye-catching YouTube song thumbnail (1280x720 pixels).
        - Song Title: "${songTitle}"
        - Artist: "${singerName}"
        - Visual Theme: "${creativeDescription}"
        
        Instructions:
        1. Use the provided image of the artist as the main subject, integrating them seamlessly.
        2. Create a professional, high-quality background based on the Visual Theme.
        3. Add the song title and artist's name using a stylish, highly readable font. Ensure text is prominent and well-placed.
        4. The final image must be exactly 1280x720 pixels and look like a professional music thumbnail.`;
        
      const resultUrl = await generateImageWithImageInput(fullPrompt, base64Data, imageFile.type);
      setImageUrl(resultUrl);

      onAssetGenerated({
        type: AssetType.Thumbnail,
        imageUrl: resultUrl,
        prompt: `Title: ${songTitle}, Artist: ${singerName}`,
      });
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-1 text-red-400">Song Thumbnail Generator</h2>
      <p className="text-center text-gray-400 mb-6">Provide song details and an image. Our AI will automatically generate a creative theme for your thumbnail (1280x720 px).</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="song-title" className="block text-sm font-medium text-gray-300 mb-1">Song Title</label>
            <input id="song-title" type="text" value={songTitle} onChange={(e) => setSongTitle(e.target.value)} placeholder="e.g., Midnight City Lights" className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 transition" disabled={loading} title="Enter the full title of the song." />
          </div>
          <div>
            <label htmlFor="singer-name" className="block text-sm font-medium text-gray-300 mb-1">Singer / Artist Name</label>
            <input id="singer-name" type="text" value={singerName} onChange={(e) => setSingerName(e.target.value)} placeholder="e.g., Aria" className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 transition" disabled={loading} title="Enter the name of the artist or band." />
          </div>
        </div>
        <div>
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-1">Upload Singer/Artist Image</label>
          <div className="mt-2 flex items-center gap-4">
            {imagePreview && <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-md object-cover" />}
            <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600/20 file:text-red-300 hover:file:bg-red-600/40" disabled={loading} title="Upload a high-quality photo of the artist. This will be the main focus of the thumbnail." />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center">
          {loading ? (
            <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div> Generating Thumbnail...</>
          ) : 'Generate Thumbnail'}
        </button>
      </form>
      <ImagePreview imageUrl={imageUrl} loading={loading} error={error} assetType="Thumbnail" />
    </div>
  );
};

export default ThumbnailGenerator;