import React, { useState, useRef, useCallback, useEffect } from 'react';
import { handleDrop as handleDropUtil } from '../utils';
import DragOverlay from './DragOverlay';
import MediaViewer from './MediaViewer';
import SubfolderBar from './SubfolderBar';
import { Category, ImportStatus, InstallStatus, LocalImageData } from '../types/index.ts';
import { ImageGridBaseProps } from './ImageGridBase';
import GridView from './GridView';
import ListView from './ListView';
import { useElectron } from '../hooks/useElectron';
import { getImageById } from '../services/imageService';

const MediaGrid: React.FC<ImageGridBaseProps & {
  installStatus: InstallStatus;
  subfolders?: {
    name: string;
    count: number;
    thumbnail?: LocalImageData;
  }[];
  onSelectSubfolder?: (name: string) => void;
  isZenMode?: boolean;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  columnCount?: number;
}> = ({
  images,
  onFavorite,
  viewMode,
  selectedImages,
  onSelectImage,
  updateTagsByMediaId,
  addImages,
  existingImages,
  categories,
  gridItemAppendButtonsProps,
  setImportState,
  importState,
  currentSelectedCategory,
  installStatus,
  onSelectSubfolder,
  isZenMode,
  isDragging,
  setIsDragging,
  columnCount = 4
}) => {
    const [viewingMedia, setViewingMedia] = useState<LocalImageData | null>(null);
   
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
    const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const [mouseDownTime, setMouseDownTime] = useState<number>(0);
    const [mouseDownPos, setMouseDownPos] = useState<{ x: number, y: number } | null>(null);
    const { openInEditor, showInFolder } = useElectron();
    const [subfolders, setSubfolders] = useState<{
      id: string;
      name: string;
      count: number;
      thumbnail?: string;
      children?: string[];
    }[]>([]);

    const handleTagsUpdate = (mediaId: string, newTags: string[]) => {
      updateTagsByMediaId(mediaId, newTags);
      if (viewingMedia?.id === mediaId) {
        const updatedMedia = images.find(img => img.id === mediaId);
        if (updatedMedia) {
          setViewingMedia({ ...updatedMedia, tags: newTags });
        }
      }
    };

    // 处理鼠标按下事件
    const handleMouseDown = (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      // if ((e.target as HTMLElement).closest('.image-item')) return;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 记录鼠标按下的时间和位置
      setMouseDownTime(Date.now());
      setMouseDownPos({ x, y });
    };

    // 处理鼠标移动事件
    const handleMouseMove = (e: React.MouseEvent) => {
      if (!mouseDownPos) return;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      // 计算鼠标移动距离
      const moveDistance = Math.sqrt(
        Math.pow(currentX - mouseDownPos.x, 2) +
        Math.pow(currentY - mouseDownPos.y, 2)
      );

      // 如果移动距离超过阈值，开始框选
      if (moveDistance > 5 && !isSelecting) {
        setIsSelecting(true);
        setSelectionStart(mouseDownPos);
        setSelectionEnd({ x: currentX, y: currentY });
      }

      if (isSelecting) {
        setSelectionEnd({ x: currentX, y: currentY });
      }
    };

    // 处理鼠标松开事件
    const handleMouseUp = (e: React.MouseEvent) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - mouseDownTime;
      const isInListItem = (e.target as HTMLElement).closest('.image-item');
      const isInGridItem = (e.target as HTMLElement).closest('.waterfall-item');
      if (isSelecting) {
        // 如果正在框选，处理框选逻辑
        const selectedIds = getImagesInSelection();
        if (selectedIds.length > 0) {
          selectedIds.forEach(id => onSelectImage(id, true));
        }
      } else if (timeDiff < 200 && mouseDownPos && (!isInListItem && !isInGridItem)) {
        // 如果是快速点击（小于200ms）且没有明显移动，视为点击事件
        onSelectImage('', false); // 清除选择
      }

      // 重置状态
      setIsSelecting(false);
      setMouseDownPos(null);
    };

    // 获取选择框内的图片
    const getImagesInSelection = () => {
      const container = containerRef.current;
      if (!container) return [];

      const minX = Math.min(selectionStart.x, selectionEnd.x);
      const maxX = Math.max(selectionStart.x, selectionEnd.x);
      const minY = Math.min(selectionStart.y, selectionEnd.y);
      const maxY = Math.max(selectionStart.y, selectionEnd.y);

      const selectedIds: string[] = [];
      const imageElements = container.getElementsByClassName('image-item');
      Array.from(imageElements).forEach((element) => {
        const rect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const elementX = rect.left - containerRect.left;
        const elementY = rect.top - containerRect.top;

        if (
          elementX < maxX &&
          elementX + rect.width > minX &&
          elementY < maxY &&
          elementY + rect.height > minY
        ) {
          const imageId = element.getAttribute('data-image-id');
          if (imageId) {
            selectedIds.push(imageId);
          }
        }
      });

      return selectedIds;
    };

    // 计算选择框样式
    const getSelectionStyle = () => {
      if (!isSelecting) return undefined;

      const left = Math.min(selectionStart.x, selectionEnd.x);
      const top = Math.min(selectionStart.y, selectionEnd.y);
      const width = Math.abs(selectionEnd.x - selectionStart.x);
      const height = Math.abs(selectionEnd.y - selectionStart.y);
      return {
        position: 'fixed',
        left: `calc(${left}px + 12rem)`,
        top: `calc(${top}px + 4rem)`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        border: '1px solid rgb(59, 130, 246)',

        pointerEvents: 'none',
        zIndex: 10,
      } as React.CSSProperties;
    };

    const isImporting = importState === ImportStatus.Importing || importState === ImportStatus.Tagging;

    const handleOpenInEditor = useCallback((path: string) => {
      openInEditor(path);
    }, [openInEditor]);

    const handleShowInFolder = useCallback((path: string) => {
      showInFolder(path);
    }, [showInFolder]);

    const fetchSubfolders = useCallback(async (currentSelectedCategory: Category | string | undefined) => {
      if (typeof currentSelectedCategory === 'string') return [];
      const subfolders = await Promise.all(currentSelectedCategory?.children?.map(async (childId: Category['id']) => {
        const childCategory = categories.find(cat => cat.id === childId);
        let firstImage;
        if (childCategory?.images && childCategory?.images.length > 0) {
          firstImage = await getImageById(childCategory?.images[0]);
        }
        return {
          id: childId,
          name: childCategory?.name || '',
          count: childCategory?.count || 0,
          thumbnail: firstImage?.path || '',
          children: childCategory?.children || []
        }
      }) || []);
      return subfolders;
    }, [currentSelectedCategory, categories]);

    useEffect(() => {
      const fetch = async () => {
        const subfolders = await fetchSubfolders(currentSelectedCategory);
        setSubfolders(subfolders);
      }
      fetch();
    }, [fetchSubfolders,currentSelectedCategory]);

    return (
      <div
        className="relative pr-1 media-grid-container"
        style={{ height: 'calc(100vh - 4rem)' }}
      >
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

        <div className="pt-2 pl-2 w-full h-full select-none scroll-smooth"
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsSelecting(false);
            setMouseDownPos(null);
          }}
          style={{ 
            position: 'relative',
            overflow: isImporting || isDragging ? 'hidden' : 'auto',
          }}
          onDragEnter={() => setIsDragging(true)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={async (e) => {
            await handleDropUtil(e, addImages, existingImages, categories, setImportState, currentSelectedCategory);
            setIsDragging(false);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsDragging(false);
            }
          }}
        >
          {isSelecting && <div style={getSelectionStyle()} />}
          <DragOverlay isDragging={isDragging} importState={importState} installStatus={installStatus} />
          {viewMode === 'list' ? (
            <ListView {...{
              images,
              onFavorite,
              viewMode,
              selectedImages,
              onSelectImage,
              updateTagsByMediaId,
              addImages,
              existingImages,
              categories,
              setImportState,
              importState,
              setViewingMedia,
              onOpenInEditor: handleOpenInEditor,
              showInFolder: handleShowInFolder,
              gridItemAppendButtonsProps: gridItemAppendButtonsProps,
            }} />
          ) : (
            <GridView {...{
              images,
              onFavorite,
              viewMode,
              selectedImages,
              onSelectImage,
              updateTagsByMediaId,
              addImages,
              existingImages,
              categories,
              setImportState,
              importState,
              setViewingMedia,
              onOpenInEditor: handleOpenInEditor,
              showInFolder: handleShowInFolder,
              gridItemAppendButtonsProps: gridItemAppendButtonsProps,
              columnCount: columnCount
            }} />
          )}
        </div>
        { subfolders && subfolders.length > 0 && (
          <SubfolderBar 
            subfolders={subfolders}
            onSelectSubfolder={onSelectSubfolder}
            isVisible={!isZenMode}
          />
        )}
      </div>    
    );
  };

export default MediaGrid;