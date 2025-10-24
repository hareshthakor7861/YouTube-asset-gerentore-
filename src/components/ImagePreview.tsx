import React from 'react';

interface ImagePreviewProps {
  imageUrl: string | null;
  loading: boolean;
  error: string | null;
  assetType: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl, loading, error, assetType }) => {
  if (loading) {
    return (
      <div className="mt-6 w-full h-64 flex flex-col items-center justify-center bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        <p className="mt-4 text-gray-300">Generating your {assetType.toLowerCase()}...</p>
        <p className="mt-1 text-sm text-gray-400">This may take a moment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 w-full p-4 flex items-center justify-center bg-red-900/30 text-red-300 border border-red-700 rounded-lg">
        <p><strong>Error:</strong> {error}</p>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4 text-center">Your Generated {assetType}</h3>
        <div className="bg-gray-900 p-2 rounded-lg shadow-inner">
           <img src={imageUrl} alt={`Generated ${assetType}`} className="w-full h-auto rounded-md object-contain max-h-[400px]" />
        </div>
        <a
          href={imageUrl}
          download={`generated-${assetType.toLowerCase().replace(' ', '-')}.png`}
          className="mt-6 w-full inline-block text-center bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-300"
        >
          Download Image
        </a>
      </div>
    );
  }

  return null;
};

export default ImagePreview;