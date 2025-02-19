import React, { useState, useEffect, useRef } from 'react';
import { 
  Image, FolderPlus, Clock, Heart, Trash2, 
  MoreVertical, Edit2, GripVertical, Video 
} from 'lucide-react';
import { Category, FilterType } from '../types';
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd';
import { StrictModeDroppable } from './StrictModeDroppable';
import { useLocale } from '../contexts/LanguageContext';

interface SidebarProps {
  selectedCategory: FilterType;
  onSelectCategory: (id: FilterType) => void;
  categories: Category[];
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onAddCategory: (category: Category) => void;
  onRenameCategory: (id: string, newName: string) => void;
  onDeleteCategory: (id: string) => void;
  onUpdateCategories?: (categories: Category[]) => void;
  setShowDeleteConfirm: (id: string | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  categories,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onUpdateCategories,
  setShowDeleteConfirm,
}) => {
  const { t } = useLocale();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-button') && !target.closest('.dropdown-content')) {
        setShowDropdown(null);
      }
      if (!target.closest('.edit-input') && editingCategory) {
        if (editingName.trim()) {
          handleRenameCategory(editingCategory);
        } else {
          setEditingCategory(null);
          setEditingName('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingCategory, editingName]);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory({
        id: `category-${Date.now()}`,
        name: newCategoryName.trim(),
        images: [],
        count: 0,
      });
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleRenameCategory = (id: string) => {
    if (editingName.trim()) {
      onRenameCategory(id, editingName.trim());
      setEditingCategory(null);
      setEditingName('');
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onUpdateCategories) return;

    const { source, destination } = result;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const reorderedCategories = Array.from(categories);
    const [removed] = reorderedCategories.splice(source.index, 1);
    reorderedCategories.splice(destination.index, 0, removed);

    onUpdateCategories(reorderedCategories);
  };

  const handleDeleteRequest = (categoryId: string) => {
    setShowDeleteConfirm(categoryId);
    setShowDropdown(null);
  };

  return (
    <div className="z-10 w-48 h-full bg-white bg-opacity-30 border-r border-gray-200 backdrop-blur-sm dark:bg-gray-800 dark:bg-opacity-30 dark:border-gray-700">
      <div className="p-4">
        <div className="space-y-2">
          {[
            { id: 'photos', icon: Image, label: t('photos') },
            { id: 'videos', icon: Video, label: t('videos') },
            { id: 'recent', icon: Clock, label: t('recent') },
            { id: 'favorites', icon: Heart, label: t('favorites') }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onSelectCategory(id as FilterType)}
              className={`flex w-full items-center px-1 py-2 rounded-lg text-gray-700 dark:text-white hover:bg-gray-100 hover:bg-opacity-80 dark:hover:bg-gray-700 dark:hover:bg-opacity-80 ${
                selectedCategory === id ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
            >
              <Icon size={20} className="mr-2" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-rose-400">{t('categories')}</h3>
            <button
              onClick={() => setIsAddingCategory(true)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-rose-400"
              title={t('addCategory')}
            >
              <FolderPlus size={16} />
            </button>
          </div>

          {isAddingCategory && (
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCategory();
                  } else if (e.key === 'Escape') {
                    setIsAddingCategory(false);
                    setNewCategoryName('');
                  }
                }}
                placeholder={t('categoryName')}
                className="flex-1 px-2 py-1 text-sm rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                autoFocus
              />
            </div>
          )}

          <DragDropContext onDragEnd={handleDragEnd}>
            <StrictModeDroppable droppableId="categories">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="overflow-y-auto space-y-1"
                  style={{
                    maxHeight: 'calc(100vh - 280px)',
                    overflowY: 'auto',
                  }}
                >
                  {categories.map((category, index) => (
                    <Draggable
                      key={category.id}
                      draggableId={category.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`group ${
                            selectedCategory === category.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } rounded-lg`}
                        >
                          <div className="flex items-center py-2">
                            <div
                              {...provided.dragHandleProps}
                              className="p-[0.3rem] mr-1 rounded cursor-grab hover:bg-gray-200 dark:hover:bg-gray-600"
                              style={{
                                cursor: snapshot.isDragging ? 'grabbing' : 'grab'
                              }}
                            >
                              <GripVertical size={14} className="text-gray-400" />
                            </div>

                            {editingCategory === category.id ? (
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyDown={(e) => {
                                  e.stopPropagation();
                                  if (e.key === 'Enter') {
                                    handleRenameCategory(category.id);
                                  } else if (e.key === 'Escape') {
                                    setEditingCategory(null);
                                    setEditingName('');
                                  }
                                }}
                                className="flex-1 px-2 py-1 w-full text-sm bg-transparent rounded border dark:text-white edit-input"
                                autoFocus
                                placeholder={t('categoryName')}
                                title={t('categoryName')}
                                aria-label={t('categoryName')}
                              />
                            ) : (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectCategory(category.id as FilterType);
                                  }}
                                  className="flex-1 text-left text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-white"
                                >
                                  {category.name}
                                </button>
                                <span className="mr-2 text-xs text-black dark:text-white">
                                  {category.count || 0}
                                </span>
                              </>
                            )}

                            <div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDropdown(showDropdown === category.id ? null : category.id);
                                }}
                                className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-600 dark:hover:text-gray-300 dropdown-button"
                                title={t('moreActions')}
                                aria-label={t('moreActions')}
                              >
                                <MoreVertical size={14} />
                              </button>

                              {showDropdown === category.id && (
                                <div className="absolute right-[-5] z-10 mt-2 w-48 bg-white rounded-md ring-1 ring-black ring-opacity-5 shadow-lg dark:bg-gray-700 dropdown-content">
                                  <div className="py-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingCategory(category.id);
                                        setEditingName(category.name);
                                        setShowDropdown(null);
                                      }}
                                      className="flex items-center px-4 py-2 w-full text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                                    >
                                      <Edit2 size={14} className="mr-2" />
                                      {t('rename')}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteRequest(category.id)}
                                      className="flex items-center px-4 py-2 w-full text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    >
                                      <Trash2 size={14} className="mr-2" />
                                      {t('delete')}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </StrictModeDroppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;