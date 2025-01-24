import React, { useState } from 'react';
import Masonry from 'react-masonry-css';
import { Heart, MoreVertical, FileText, Calendar, Check, Play } from 'lucide-react';
import { Category, Image as ImageType, ViewMode } from '../types';
import MediaViewer from './MediaViewer';
import { handleDrop as handleDropUtil } from '../utils';
import DragOverlay from './DragOverlay';

interface ImageGridProps {
  images: ImageType[];
  onFavorite: (id: string) => void;
  viewMode: ViewMode;
  selectedImages: Set<string>;
  onSelectImage: (id: string, isShiftKey: boolean) => void;
  updateTagsByMediaId: (mediaId: string, newTags: string[]) => void;
  addImages: (newImages: ImageType[]) => void;
  existingImages: ImageType[];
  categories: Category[];
  setIsTagging: (isTagging: boolean) => void;
  isTagging: boolean;
}

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  onFavorite,
  viewMode,
  selectedImages,
  onSelectImage,
  updateTagsByMediaId,
  addImages,
  existingImages,
  categories,
  setIsTagging,
  isTagging,
}) => {
  const [viewingMedia, setViewingMedia] = useState<ImageType | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  console.log("----isTagging", isTagging);
  const breakpointColumns = {
    default: 4,
    1536: 3,
    1280: 3,
    1024: 2,
    768: 2,
    640: 1,
  };

  const renderMediaItem = (image: ImageType) => {
    if (image.type === 'video') {
      return (
        <div className="relative w-full h-0 pb-[56.25%]">
          <video
            src={image.path}
            className="object-cover absolute inset-0 w-full h-full rounded-lg"
            controls
          />
          {image.duration && (
            <div className="absolute right-2 bottom-2 px-2 py-1 text-sm text-white bg-black bg-opacity-50 rounded">
              {Math.floor(image.duration / 60)}:{(image.duration % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
      );
    }

    return (
      <img
        src={image.path}
        alt={image.name}
        className="w-full h-auto rounded-2xl"
      />
    );
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // 阻止默认右键菜单
    onSelectImage(id, e.shiftKey);
  };

  const handleClick = (e: React.MouseEvent, image: ImageType) => {
    if (e.shiftKey) {
      // 如果按住Shift键，则触发选择功能
      onSelectImage(image.id, true);
    } else if (!e.ctrlKey && !e.metaKey) {
      // 普通点击时预览图片（除非按住Ctrl/Command键）
      setViewingMedia(image);
    }
  };

  const handleTagsUpdate = (mediaId: string, newTags: string[]) => {
    updateTagsByMediaId(mediaId, newTags);
    // 如果当前正在查看的媒体被更新了，同步更新 viewingMedia
    if (viewingMedia?.id === mediaId) {
      const updatedMedia = images.find(img => img.id === mediaId);
      if (updatedMedia) {
        setViewingMedia({ ...updatedMedia, tags: newTags });
      }
    }
  };

  if (viewMode === 'list') {
    return (
      <>
        {viewingMedia && (
          <MediaViewer
            media={viewingMedia}
            onTagsUpdate={handleTagsUpdate}
            onClose={() => setViewingMedia(null)}
            onPrevious={() => {
              const index = images.findIndex(img => img.id === viewingMedia?.id);
              if (index > 0) {
                setViewingMedia(images[index - 1]);
              }
            }}
            onNext={() => {
              const index = images.findIndex(img => img.id === viewingMedia?.id);
              if (index < images.length - 1) {
                setViewingMedia(images[index + 1]);
              }
            }}
          />
        )}
        
        <div className="p-6" 
             onDragEnter={() => setIsDragging(true)} 
             onDragOver={(e) => e.preventDefault()} 
             onDrop={async (e) => { await handleDropUtil(e, addImages, existingImages, categories, setIsTagging); setIsDragging(false); }}
             onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }}>
          <DragOverlay isDragging={isDragging} isTagging={isTagging} />
          <div className="bg-white bg-opacity-60 rounded-lg shadow dark:bg-gray-800">
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-4 border-b dark:border-gray-700 font-medium text-gray-500 dark:text-gray-400">
              <div className="w-12"></div>
              <div>Name</div>
              <div>Size</div>
              <div>dateModified</div>
              <div className="w-20">Actions</div>
            </div>
            {images.map((image) => (
              <div
                key={image.id}
                className={`
                  grid 
                  grid-cols-[auto_1fr_auto_auto_auto]
                  gap-4 p-4 items-center
                hover:bg-gray-50
                dark:hover:bg-gray-700
                  transition-colors cursor-pointer ${
                    selectedImages.has(image.id) ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                  }`}
                onClick={(e) => handleClick(e, image)}
                onContextMenu={(e) => handleContextMenu(e, image.id)}
              >
                <div className="relative w-12 h-12">
                  {image.type === 'video' ? (
                    <div className="relative w-12 h-12">
                      <img
                        src={image.thumbnail || image.path}
                        alt={image.name}
                        className="object-cover w-12 h-12 rounded"
                      />
                      <div className="flex absolute inset-0 justify-center items-center">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={image.path}
                      alt={image.name}
                      className="object-cover w-12 h-12 rounded"
                    />
                  )}
                  {selectedImages.has(image.id) && (
                    <div className="flex absolute inset-0 justify-center items-center rounded bg-blue-500/50">
                      <Check className="text-white" size={20} />
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <FileText size={16} className="mr-2 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-200">{image.name}</span>
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {(image.size / 1024 / 1024).toFixed(2)} MB
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Calendar size={16} className="mr-2" />
                  {new Date(image.dateModified).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    title={image.favorite ? "取消收藏" : "收藏"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFavorite(image.id);
                    }}
                    className={`p-2 rounded-full ${
                      image.favorite
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Heart size={16} />
                  </button>
                  <button
                    title="更多选项"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 text-gray-700 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {viewingMedia && (
        <MediaViewer
          media={viewingMedia}
          onTagsUpdate={handleTagsUpdate}
          onClose={() => setViewingMedia(null)}
          onPrevious={() => {
            const index = images.findIndex(img => img.id === viewingMedia?.id);
            if (index > 0) {
              setViewingMedia(images[index - 1]);
            }
          }}
          onNext={() => {
            const index = images.findIndex(img => img.id === viewingMedia?.id);
            if (index < images.length - 1) {
              setViewingMedia(images[index + 1]);
            }
          }}
        />
      )}
      
      <div className="p-6 w-full h-full" 
           onDragEnter={() => setIsDragging(true)} 
           onDragOver={(e) => e.preventDefault()} 
           onDrop={async (e) => { await handleDropUtil(e, addImages, existingImages, categories, setIsTagging); setIsDragging(false); }}
           onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }}>
          <DragOverlay isDragging={isDragging} isTagging={isTagging} />
          <Masonry
            breakpointCols={breakpointColumns}
            className="flex -ml-6 [&>*]:will-change-[transform,opacity] [&>*]:transition-all [&>*]:duration-500 [&>*]:ease-[cubic-bezier(0.4,0,0.2,1)]"
            columnClassName="pl-6 space-y-6 [&>*]:will-change-[transform,opacity] [&>*]:transition-all [&>*]:duration-500 [&>*]:ease-[cubic-bezier(0.4,0,0.2,1)]"
          >
            {images.map((image) => (
              <div
                key={image.id}
                className={`relative group cursor-pointer will-change-transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] transform ${
                  selectedImages.has(image.id) ? 'ring-4 ring-blue-500 rounded-lg scale-[0.98]' : 'scale-100'
                }`}
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  perspective: '1000px',
                  WebkitPerspective: '1000px'
                }}
                onClick={(e) => handleClick(e, image)}
                onContextMenu={(e) => handleContextMenu(e, image.id)}
              >
                {renderMediaItem(image)}
                <div className={`absolute inset-0 bg-black will-change-opacity transition-opacity duration-300 ease-in-out rounded-lg ${
                  selectedImages.has(image.id) ? 'bg-opacity-30' : 'bg-opacity-0 group-hover:bg-opacity-30'
                }`} />
                {selectedImages.has(image.id) && (
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
            ))}
          </Masonry>
        </div>
      </>
    );
  };

export default ImageGrid;