import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { AssetType } from '../types';
import { getFriendlyErrorMessage } from '../utils/errorHandler';

interface IntroGeneratorProps {
  onAssetGenerated: (item: { type: AssetType, imageUrl: string, prompt: string }) => void;
}

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

const IntroGenerator: React.FC<IntroGeneratorProps> = ({ onAssetGenerated }) => {
  const [channelName, setChannelName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [apiKeySelected, setApiKeySelected] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setApiKeySelected(hasKey);
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Assume success after the dialog closes to avoid race conditions.
      setApiKeySelected(true);
    } catch (e) {
      console.error("Failed to select API key", e);
      setError("You must select an API key to proceed.");
    }
  };
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim() || !logoFile) {
      setError('Please provide a channel name and upload a logo.');
      return;
    }

    setLoading(true);
    setError(null);
    setImageUrl(null);

    // FIX: Use process.env.API_KEY as per the coding guidelines for video generation.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setError("API_KEY is not configured. Please use the 'Select API Key' button to provide one.");
      setApiKeySelected(false);
      setLoading(false);
      return;
    }

    try {
        setLoadingMessage('Initializing AI client...');
        const ai = new GoogleGenAI({ apiKey: apiKey });
        
        setLoadingMessage('Preparing assets...');
        const base64Logo = await fileToBase64(logoFile);

        const prompt = `Create a professional, 5-second YouTube channel intro video with a 16:9 aspect ratio.
- Channel Name: "${channelName}"
- Instructions:
1. Incorporate the provided channel logo.
2. The style should be modern, dynamic, and engaging with clean animations.
3. The logo and channel name should be revealed creatively.
4. The final output must be high-energy and suitable as a channel intro.`;

        setLoadingMessage('Starting video generation...');
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: {
                imageBytes: base64Logo,
                mimeType: logoFile.type,
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });

        setLoadingMessage('Processing video... This can take a few minutes.');
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        
        setLoadingMessage('Finalizing video...');
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            throw new Error("Video generation failed to produce a download link.");
        }

        const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
        if (!videoResponse.ok) {
            throw new Error(`Failed to download video: ${videoResponse.statusText}`);
        }

        const videoBlob = await videoResponse.blob();
        const generatedVideoUrl = URL.createObjectURL(videoBlob);
        
        setImageUrl(generatedVideoUrl);
        onAssetGenerated({
            type: AssetType.Intro,
            imageUrl: generatedVideoUrl,
            prompt: `Intro for: ${channelName}`,
        });

    } catch (err: any) {
      const friendlyMessage = getFriendlyErrorMessage(err);
      if (friendlyMessage.toLowerCase().includes('api key')) {
        setApiKeySelected(false);
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  if (!apiKeySelected) {
    return (
        <div className="text-center p-6 bg-gray-900/50 rounded-lg border border-yellow-700">
            <h3 className="text-xl font-bold text-yellow-400 mb-2">Action Required: Enable Video Generation</h3>
            <p className="text-gray-400 mb-4 text-left space-y-2">
                <span>The powerful video AI (Veo) used for intros requires a Google Cloud project with billing enabled. This is a one-time setup step required by Google.</span>
                <br/>
                <span>While the project requires billing, Google often provides a generous free tier for new users. Please check the official <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-red-400 underline hover:text-red-300">billing documentation</a> for the most current pricing details.</span>
            </p>
            <button
                onClick={handleSelectKey}
                className="mt-2 bg-yellow-500 text-gray-900 font-bold py-2 px-6 rounded-lg hover:bg-yellow-600 transition-colors duration-300"
            >
                Select API Key & Proceed
            </button>
        </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-1 text-red-400">YouTube Intro Generator</h2>
      <p className="text-center text-gray-400 mb-6">Create a 5-second intro video with your channel name and logo.</p>
      
      {!loading && !imageUrl && (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="channel-name" className="block text-sm font-medium text-gray-300 mb-1">Channel Name</label>
                <input id="channel-name" type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="e.g., The Tech Sphere" className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 transition" disabled={loading} />
            </div>
            <div>
                <label htmlFor="logo-upload-intro" className="block text-sm font-medium text-gray-300 mb-1">Upload Channel Logo</label>
                <div className="mt-2 flex items-center gap-4">
                    {logoPreview && <img src={logoPreview} alt="Logo Preview" className="w-16 h-16 rounded-full object-cover bg-gray-800" />}
                    <input id="logo-upload-intro" type="file" accept="image/*" onChange={handleLogoChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600/20 file:text-red-300 hover:file:bg-red-600/40" disabled={loading} />
                </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center">
                Generate Intro
            </button>
        </form>
      )}

      {loading && (
        <div className="mt-6 w-full h-64 flex flex-col items-center justify-center bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-600">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            <p className="mt-4 text-gray-300 font-semibold">Generating your intro...</p>
            <p className="mt-2 text-sm text-gray-400">{loadingMessage}</p>
        </div>
      )}

      {error && (
        <div className="mt-6 w-full p-4 flex items-center justify-center bg-red-900/30 text-red-300 border border-red-700 rounded-lg">
            <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {imageUrl && !loading && (
        <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4 text-center">Your Generated Intro</h3>
            <div className="bg-gray-900 p-2 rounded-lg shadow-inner">
                <video src={imageUrl} controls autoPlay loop className="w-full h-auto rounded-md" />
            </div>
            <a href={imageUrl} download="generated-intro.mp4" className="mt-6 w-full inline-block text-center bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-300">
                Download Video
            </a>
        </div>
      )}
    </div>
  );
};

export default IntroGenerator;
