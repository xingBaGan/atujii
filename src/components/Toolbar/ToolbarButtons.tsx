import React, { useEffect, useState, useRef } from 'react';
import { FileJson, Settings as SettingsIcon, FilterIcon, Keyboard, Dices  } from 'lucide-react';
import { useLocale } from '../../contexts/LanguageContext';
import { FilterOptions } from '../../types/index.ts';

interface ToolbarButtonsProps {
  onOpenConfig: () => Promise<void>;
  setIsSettingsOpen: (isOpen: boolean) => void;
  setIsShortcutsHelpOpen: (isOpen: boolean) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
  filterOptions: FilterOptions;
  filterButtonRef: React.RefObject<HTMLElement>;
  filterRef: React.RefObject<HTMLDivElement>;
  filterColors: string[];
  randomInspirationIndex: () => void;
  randomButtonState: {
    isActive: boolean;
    tooltip: string;
  };
  setRandomInspiration: (inspiration: number) => void;
}

const pressTime = 2000; // 2 seconds for long press
const ToolbarButtons: React.FC<ToolbarButtonsProps> = ({
  onOpenConfig,
  setIsSettingsOpen,
  setIsShortcutsHelpOpen,
  isFilterOpen,
  setIsFilterOpen,
  filterOptions,
  filterButtonRef,
  filterRef,
  filterColors,
  randomInspirationIndex,
  randomButtonState,
  setRandomInspiration,
}) => {
  const { t } = useLocale();
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const progressInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current && 
        !filterRef.current.contains(event.target as Node) &&
        !(filterButtonRef.current && filterButtonRef.current.contains(event.target as Node))
      ) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsFilterOpen, filterButtonRef]);

  const getFilterCount = () => {
    return filterColors.length +
      filterOptions?.ratio.length +
      filterOptions?.formats.length +
      (filterOptions?.rating !== null ? 1 : 0);
  };

  const handleRandomButtonMouseDown = () => {
    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true);
    }, 500);
  };

  const handleRandomButtonMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    if (!isLongPressing) {
      randomInspirationIndex();
    }
    if (isLongPressing) {
      setRandomInspiration(0);
      setIsLongPressing(false);
    }
  };

  const handleRandomButtonMouseLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    setIsLongPressing(false);
  };

  return (
    <div ref={filterRef} className="flex items-center space-x-2">
      <button
        onClick={onOpenConfig}
        className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-sky-500"
        title={t('openData')}
        aria-label={t('openData')}
      >
        <FileJson className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-sky-500"
        title={t('settings')}
      >
        <SettingsIcon size={20} />
      </button>

      <div className="relative">
        <button
          ref={filterButtonRef as React.RefObject<HTMLButtonElement>}
          className={`p-2 rounded-lg text-gray-600 ${
            isFilterOpen || getFilterCount() > 0
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-sky-500'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-sky-500'
          }`}
          title={`${t('filter')} (Ctrl+R)`}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <div className="relative">
            <FilterIcon size={20} />
            {getFilterCount() > 0 && (
              <div className="absolute -top-2 -right-2 flex items-center justify-center w-4 h-4 text-[10px] text-white bg-red-500 rounded-full">
                {getFilterCount()}
              </div>
            )}
          </div>
        </button>
      </div>

      <button 
        onClick={() => setIsShortcutsHelpOpen(true)}
        className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-sky-500"
        title={t('shortcuts.show')}
      >
        <Keyboard size={20} />
      </button>
      <div className="relative">
        <button
          className={`p-2 rounded-lg transition-all duration-300 relative ${
            randomButtonState.isActive
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 hover:bg-gray-300'
          } ${isLongPressing ? 'scale-110 rotate-12' : ''}`}
          onMouseDown={handleRandomButtonMouseDown}
          onMouseUp={handleRandomButtonMouseUp}
          onMouseLeave={handleRandomButtonMouseLeave}
          title={randomButtonState.tooltip}
        >
          <div className="relative">
            <Dices 
              size={20} 
              className={`transition-transform duration-300 ${isLongPressing ? 'animate-bounce' : ''}`}
            />
            {isLongPressing && (
              <>
                <div className="absolute inset-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      className="text-blue-500"
                      strokeWidth="2"
                      stroke="currentColor"
                      fill="transparent"
                      r="10"
                      cx="12"
                      cy="12"
                      style={{
                        strokeDasharray: '62.8',
                        strokeDashoffset: `${62.8 - (progress / 100) * 62.8}`,
                        transition: 'stroke-dashoffset 0.1s linear'
                      }}
                    />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
              </>
            )}
          </div>
          {progress === 100 && (
            <div className="flex absolute inset-0 justify-center items-center">
              <div className="w-6 h-6 bg-blue-500 rounded-full animate-ping" />
              <div className="flex absolute inset-0 justify-center items-center">
                <div className="w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default ToolbarButtons; 