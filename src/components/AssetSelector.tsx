import React from 'react';
import { AssetType } from '../types';

interface AssetSelectorProps {
  selectedAsset: AssetType;
  onSelectAsset: (assetType: AssetType) => void;
}

const AssetButton: React.FC<{
  label: AssetType;
  isSelected: boolean;
  onClick: () => void;
}> = ({ label, isSelected, onClick }) => {
  const baseClasses = "w-full text-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
  const selectedClasses = "bg-red-600 text-white shadow-lg";
  const unselectedClasses = "bg-gray-700 text-gray-300 hover:bg-gray-600";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
    >
      {label}
    </button>
  );
};

const AssetSelector: React.FC<AssetSelectorProps> = ({ selectedAsset, onSelectAsset }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <AssetButton
        label={AssetType.Logo}
        isSelected={selectedAsset === AssetType.Logo}
        onClick={() => onSelectAsset(AssetType.Logo)}
      />
      <AssetButton
        label={AssetType.Banner}
        isSelected={selectedAsset === AssetType.Banner}
        onClick={() => onSelectAsset(AssetType.Banner)}
      />
      <AssetButton
        label={AssetType.Thumbnail}
        isSelected={selectedAsset === AssetType.Thumbnail}
        onClick={() => onSelectAsset(AssetType.Thumbnail)}
      />
      <AssetButton
        label={AssetType.Description}
        isSelected={selectedAsset === AssetType.Description}
        onClick={() => onSelectAsset(AssetType.Description)}
      />
      <AssetButton
        label={AssetType.Intro}
        isSelected={selectedAsset === AssetType.Intro}
        onClick={() => onSelectAsset(AssetType.Intro)}
      />
      <AssetButton
        label={AssetType.About}
        isSelected={selectedAsset === AssetType.About}
        onClick={() => onSelectAsset(AssetType.About)}
      />
    </div>
  );
};

export default AssetSelector;