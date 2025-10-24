import React, { useState, useEffect } from 'react';
import { AssetType, HistoryItem } from './types';
import Header from './components/Header';
import AssetSelector from './components/AssetSelector';
import LogoGenerator from './components/LogoGenerator';
import BannerGenerator from './components/BannerGenerator';
import ThumbnailGenerator from './components/ThumbnailGenerator';
import DescriptionGenerator from './components/DescriptionGenerator';
import History from './components/History';
import IntroGenerator from './components/IntroGenerator';
import AboutGenerator from './components/AboutGenerator';

const App: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<AssetType>(AssetType.Logo);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('assetHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
  }, []);

  const handleAssetGenerated = (newItem: { type: AssetType; imageUrl: string; prompt: string; }) => {
    setHistory(prevHistory => {
      const fullNewItem: HistoryItem = {
        ...newItem,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const updatedHistory = [fullNewItem, ...prevHistory];
      try {
        localStorage.setItem('assetHistory', JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("Failed to save history to localStorage", error);
      }
      return updatedHistory;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
        localStorage.removeItem('assetHistory');
    } catch (error) {
        console.error("Failed to clear history from localStorage", error);
    }
  };

  const renderGenerator = () => {
    const props = { onAssetGenerated: handleAssetGenerated };
    switch (selectedAsset) {
      case AssetType.Logo:
        return <LogoGenerator {...props} />;
      case AssetType.Banner:
        return <BannerGenerator {...props} />;
      case AssetType.Thumbnail:
        return <ThumbnailGenerator {...props} />;
      case AssetType.Description:
        return <DescriptionGenerator />;
      case AssetType.Intro:
        return <IntroGenerator {...props} />;
      case AssetType.About:
        return <AboutGenerator />;
      default:
        return <LogoGenerator {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-lg text-gray-400 mb-8">
            Select the asset you want to create with AI.
          </p>
          <AssetSelector selectedAsset={selectedAsset} onSelectAsset={setSelectedAsset} />
          <div className="mt-8 bg-gray-800/50 rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700">
            {renderGenerator()}
          </div>
        </div>
        <History history={history} onClearHistory={handleClearHistory} />
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;