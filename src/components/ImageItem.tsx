import React from 'react';
import { Heart, MoreVertical, Check } from 'lucide-react';
import { Image as ImageType } from '../types';

interface ImageItemProps {
  image: ImageType;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
  onFavorite: (id: string) => void;
  viewMode: 'grid' | 'list';
}

const ImageItem: React.FC<ImageItemProps> = ({
  image,
  isSelected,
  onSelect,
  onDoubleClick,
  onFavorite,
  viewMode
}) => {
  if (viewMode === 'list') {
    return (
      <div className="relative w-12 h-12">
        <img
          src={image.path}
          alt={image.name}
          className="object-cover w-12 h-12 rounded"
        />
        {isSelected && (
          <div className="flex absolute inset-0 justify-center items-center rounded bg-blue-500/50">
            <Check className="text-white" size={20} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative group cursor-pointer will-change-transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] transform ${
        isSelected ? 'ring-4 ring-blue-500 rounded-lg scale-[0.98]' : 'scale-100'
      }`}
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        perspective: '1000px',
        WebkitPerspective: '1000px'
      }}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
    >
      <img
        src={image.path}
        alt={image.name}
        className="w-full h-auto rounded-2xl"
      />
      <div
        className={`absolute inset-0 bg-black will-change-opacity transition-opacity duration-300 ease-in-out rounded-lg ${
          isSelected ? 'bg-opacity-30' : 'bg-opacity-0 group-hover:bg-opacity-30'
        }`}
      />
      {isSelected && (
        <div className="absolute top-4 left-4 p-1 bg-blue-500 rounded-full transition-transform duration-200 ease-in-out transform scale-100">
          <Check className="text-white" size={20} />
        </div>
      )}
      <div className="flex absolute top-4 right-4 items-center space-x-2 opacity-0 backdrop-blur-sm transition-all duration-300 ease-in-out transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
        <button
          title={image.favorite ? "取消收藏" : "收藏"}
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(image.id);
          }}
          className={`p-2 rounded-full transition-all duration-200 ease-in-out transform hover:scale-110 ${
            image.favorite
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          } backdrop-blur-sm`}
        >
          <Heart size={20} />
        </button>
        <button
          title="更多选项"
          onClick={(e) => e.stopPropagation()}
          className="p-2 text-gray-700 bg-white rounded-full backdrop-blur-sm transition-all duration-200 ease-in-out transform hover:scale-110 hover:bg-gray-100"
        >
          <MoreVertical size={20} />
        </button>
      </div>
      <div className="absolute right-0 bottom-0 left-0 p-4 bg-gradient-to-t from-black to-transparent rounded-2xl opacity-0 backdrop-blur-sm transition-all duration-300 ease-in-out transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
        <h3 className="font-medium text-white truncate">{image.name}</h3>
        <p className="text-sm text-gray-300">
          {new Date(image.dateModified).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default ImageItem; 