import React, { useState, useEffect, useRef } from 'react';
import { 
  Image, FolderPlus, Clock, Heart, Trash2, 
  MoreVertical, Edit2, GripVertical, Video 
} from 'lucide-react';
import { Category, FilterType } from '../types';
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd';
import { StrictModeDroppable } from './StrictModeDroppable';

interface SidebarProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  categories: Category[];
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onAddCategory: (category: Category) => void;
  onRenameCategory: (id: string, newName: string) => void;
  onDeleteCategory: (id: string) => void;
  onUpdateCategories?: (categories: Category[]) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  categories,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onUpdateCategories,
}) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

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

  const handleDeleteConfirm = (categoryId: string) => {
    onDeleteCategory(categoryId);
    setShowDeleteConfirm(null);
    setShowDropdown(null);
  };

  return (
    <div className="w-64 h-full bg-white bg-opacity-30 border-r border-gray-200 backdrop-blur-sm dark:bg-gray-800 dark:bg-opacity-30 dark:border-gray-700">
      <div className="p-4">
        <div className="space-y-2">
          {[
            { id: 'photos', icon: Image, label: '所有图片' },
            { id: 'videos', icon: Video, label: '所有视频' },
            { id: 'recent', icon: Clock, label: '最近添加' }, 
            { id: 'favorites', icon: Heart, label: '收藏' }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onSelectCategory(id)}
              className={`flex w-full items-center px-1 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 hover:bg-opacity-80 dark:hover:bg-gray-700 dark:hover:bg-opacity-80 ${
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
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">分类</h3>
            <button
              onClick={() => setIsAddingCategory(true)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="添加分类"
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
                placeholder="分类名称"
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
                  className="space-y-1"
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
                          className={`relative group ${
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
                                className="flex-1 px-2 py-1 text-sm bg-transparent rounded border dark:text-white edit-input"
                                autoFocus
                                placeholder="输入分类名称"
                                title="编辑分类名称"
                                aria-label="编辑分类名称"
                              />
                            ) : (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectCategory(category.id);
                                  }}
                                  className="flex-1 text-left text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                                >
                                  {category.name}
                                </button>
                                <span className="mr-2 text-xs text-black">
                                  {category.count || 0}
                                </span>
                              </>
                            )}

                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDropdown(showDropdown === category.id ? null : category.id);
                                }}
                                className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-600 dark:hover:text-gray-300 dropdown-button"
                                title="更多操作"
                                aria-label="更多操作"
                              >
                                <MoreVertical size={14} />
                              </button>

                              {showDropdown === category.id && (
                                <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md ring-1 ring-black ring-opacity-5 shadow-lg dark:bg-gray-700 dropdown-content">
                                  <div className="py-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingCategory(category.id);
                                        setEditingName(category.name);
                                        setShowDropdown(null);
                                      }}
                                      className="flex items-center px-4 py-2 w-full text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    >
                                      <Edit2 size={14} className="mr-2" />
                                      重命名
                                    </button>
                                    <button
                                      onClick={() => {
                                        setShowDeleteConfirm(category.id);
                                        setShowDropdown(null);
                                      }}
                                      className="flex items-center px-4 py-2 w-full text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    >
                                      <Trash2 size={14} className="mr-2" />
                                      删除
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

      {showDeleteConfirm && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
          <div className="relative p-6 w-80 bg-white rounded-lg dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              确认删除
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              确定要删除这个分类吗？此操作无法撤销。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 rounded-md dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                取消
              </button>
              <button
                onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;