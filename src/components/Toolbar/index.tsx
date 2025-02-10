import React, { useState, useRef } from 'react';
import { Menu, Import } from 'lucide-react';
import { ViewMode, SortType, FilterOptions } from '../../types';
import ThemeToggle from '../ThemeToggle';
import LanguageToggle from '../LanguageToggle';
import { useLocale } from '../../contexts/LanguageContext';
import FilterPopup from '../FilterPopup';
import ShortcutsHelp from '../ShortcutsHelp';
import SearchBar from './SearchBar';
import ViewModeToggle from './ViewModeToggle';
import SortDropdown from './SortDropdown';
import BulkActions from './BulkActions';
import ToolbarButtons from './ToolbarButtons';

interface ToolbarProps {
  viewMode: ViewMode;
  sortBy: SortType;
  sortDirection: 'asc' | 'desc';
  onViewModeChange: (mode: ViewMode) => void;
  onSortChange: (sort: SortType) => void;
  onSearch: (tags: string[]) => void;
  onFilter: (filters: FilterOptions) => void;
  selectedCount: number;
  bulkActions: any[];
  onToggleSidebar: () => void;
  onImport: () => void;
  isSidebarOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
  isSettingsOpen: boolean;
  filterColors: string[];
  setFilterColors: (colors: string[]) => void;
  searchButtonRef: React.RefObject<HTMLElement>;
  sortButtonRef: React.RefObject<HTMLElement>;
  filterButtonRef: React.RefObject<HTMLElement>;
}

const Toolbar: React.FC<ToolbarProps> = ({
  viewMode,
  sortBy,
  sortDirection,
  onViewModeChange,
  onSortChange,
  onSearch,
  onFilter,
  selectedCount,
  bulkActions,
  onToggleSidebar,
  onImport,
  isSidebarOpen,
  setIsSettingsOpen,
  filterColors,
  setFilterColors,
  searchButtonRef,
  sortButtonRef,
  filterButtonRef,
}) => {
  const { t } = useLocale();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    colors: filterColors,
    ratio: [],
    rating: null,
    formats: [],
    precision: 0.85
  });
  const filterRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <div className="flex relative z-20 justify-between items-center px-6 h-16 bg-white bg-opacity-30 border-b backdrop-blur-sm dark:bg-gray-800 dark:bg-opacity-30 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 hover:bg-opacity-80 dark:hover:bg-gray-700 dark:hover:bg-opacity-80"
            title={isSidebarOpen ? t('hideSidebar') : t('showSidebar')}
          >
            <Menu size={20} />
          </button>
          
          <button
            onClick={onImport}
            className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            title={t('import')}
          >
            <Import size={20} />
          </button>

          <LanguageToggle />
          <ThemeToggle />

          {selectedCount > 0 ? (
            <BulkActions
              selectedCount={selectedCount}
              bulkActions={bulkActions}
            />
          ) : (
            <>
              <SearchBar
                onSearch={onSearch}
                searchButtonRef={searchButtonRef}
              />

              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
              />

              <div className="flex items-center pl-4 space-x-2 border-l dark:border-gray-700">
                <SortDropdown
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSortChange={onSortChange}
                  sortButtonRef={sortButtonRef}
                />
              </div>

              <div className="relative">
                <ToolbarButtons
                  onOpenConfig={async () => {
                    const result = await window.electron.openImageJson();
                    if (!result.success) {
                      console.error(t('configOpenFailed', { error: result.error || '' }));
                    }
                  }}
                  setIsSettingsOpen={setIsSettingsOpen}
                  setIsShortcutsHelpOpen={setIsShortcutsHelpOpen}
                  isFilterOpen={isFilterOpen}
                  setIsFilterOpen={setIsFilterOpen}
                  filterOptions={filterOptions}
                  filterButtonRef={filterButtonRef}
                  filterRef={filterRef}
                />

                {isFilterOpen && (
                  <div className="absolute top-6 left-24 z-50 mt-2" ref={filterRef}>
                    <FilterPopup
                      isOpen={isFilterOpen}
                      filters={[
                        {
                          id: 'colors',
                          type: 'colors',
                          label: t('colors')
                        },
                        {
                          id: 'ratio',
                          type: 'ratio',
                          label: t('ratio'),
                          options: ['4:3', '16:9', '1:1', '3:4', '9:16']
                        },
                        {
                          id: 'rating',
                          type: 'rating',
                          label: t('rating'),
                          options: ['1', '2', '3', '4', '5']
                        },
                        {
                          id: 'formats',
                          type: 'formats',
                          label: t('formats'),
                          options: ['jpg', 'png', 'gif', 'webp']
                        }
                      ]}
                      filterColors={filterColors}
                      setFilterColors={setFilterColors}
                      filterOptions={filterOptions}
                      onFilterChange={(type, value) => {
                        setFilterOptions(prev => {
                          const newOptions = { ...prev };
                          if (type === 'rating') {
                            if (newOptions.rating === parseInt(value as string)) {
                              newOptions.rating = null;
                            } else {
                              newOptions.rating = parseInt(value as string);
                            }
                          } else if (type === 'precision') {
                            newOptions.precision = value as number;
                          } else {
                            const arr = newOptions[type] as string[];
                            const index = arr.indexOf(value as string);
                            if (index === -1) {
                              arr.push(value as string);
                            } else {
                              arr.splice(index, 1);
                            }
                          }
                          onFilter(newOptions);
                          return newOptions;
                        });
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ShortcutsHelp
        isOpen={isShortcutsHelpOpen}
        onClose={() => setIsShortcutsHelpOpen(false)}
      />
    </>
  );
};

export default Toolbar; 