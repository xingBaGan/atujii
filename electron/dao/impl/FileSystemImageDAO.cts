import { ImageDAO } from '../ImageDAO.cjs';
import {
  loadImagesData,
  saveImagesAndCategories,
  deletePhysicalFile,
} from '../../services/FileService.cjs';
import {
  LocalImageData,
  Category,
  FilterType,
  FilterOptions,
  SortType,
  SortDirection,
  ColorInfo,
} from '../type.cjs';

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const isSimilarColor = (color1: string, color2: string, precision: number = 0.8): boolean => {
  // 确保精度在有效范围内
  precision = Math.max(0.1, Math.min(1, precision));
  
  // 转换为RGB
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return false;
  
  // 计算欧几里得距离
  const distance = Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
  
  // 最大可能距离是 sqrt(255^2 + 255^2 + 255^2) ≈ 441.67
  const maxDistance = Math.sqrt(3 * Math.pow(255, 2));
  
  // 计算相似度（0到1之间）
  const similarity = 1 - (distance / maxDistance);
  
  // 根据精度判断是否相似
  return similarity >= precision;
}; 

export default class FileSystemImageDAO implements ImageDAO {
  async getImagesAndCategories() {
    const data = await loadImagesData();
    return data;
  }

  async toggleFavorite(
    id: string,
    images: LocalImageData[],
    categories: Category[]
  ): Promise<LocalImageData[]> {
    const updatedImages = images.map((img) =>
      img.id === id ? { ...img, favorite: !img.favorite } : img
    );

    await saveImagesAndCategories(updatedImages, categories);
    return updatedImages;
  }


  async addImages(
    newImages: LocalImageData[],
    currentImages: LocalImageData[],
    categories: Category[],
    currentSelectedCategory?: Category
  ): Promise<LocalImageData[]> {
    const newImagesData = newImages.filter(img =>
      !currentImages.some(existingImg => existingImg.id === img.id)
    );

    const updatedImages = [...currentImages, ...newImagesData];
    await saveImagesAndCategories(
      updatedImages,
      categories,
    );

    return updatedImages;
  }

  async bulkDeleteSoft(
    selectedImages: Set<string>,
    images: LocalImageData[],
    categories: Category[]
  ): Promise<{
    updatedImages: LocalImageData[];
    updatedCategories?: Category[];
  }> {
    const updatedImages = images.filter(img => !selectedImages.has(img.id));

    const updatedCategories = categories.map(category => {
      const newImages = category.images?.filter(id => !selectedImages.has(id)) || [];
      return {
        ...category,
        images: newImages,
        count: newImages.length
      };
    });

    await saveImagesAndCategories(updatedImages, updatedCategories);
    return {
      updatedImages: updatedImages,
      updatedCategories: updatedCategories
    };
  }

  async bulkDeleteHard(
    selectedImages: Set<string>,
    images: LocalImageData[],
    categories: Category[]
  ): Promise<{
    updatedImages: LocalImageData[];
    updatedCategories?: Category[];
  }> {
    const updatedImages = images.filter(img => !selectedImages.has(img.id));
    const deletedImages = images.filter(img => selectedImages.has(img.id));
    const updatedCategories = categories.map(category => {
      const newImages = category.images?.filter(id => !selectedImages.has(id)) || [];
      return {
        ...category,
        images: newImages,
        count: newImages.length
      };
    });

    for (const img of deletedImages) {
      if (img.path.includes('local-image://') && img.isBindInFolder) {
        await deletePhysicalFile(img.path);
      }
    }

    await saveImagesAndCategories(updatedImages, updatedCategories);

    return {
      updatedImages,
      updatedCategories
    };
  }

  async updateTags(
    mediaId: string,
    newTags: string[],
    images: LocalImageData[],
    categories: Category[]
  ): Promise<LocalImageData[]> {
    const updatedImages = images.map(img =>
      img.id === mediaId ? { ...img, tags: newTags } : img
    );
    await saveImagesAndCategories(updatedImages, categories);
    return updatedImages;
  }

  async updateRating(
    mediaId: string,
    rate: number,
    images: LocalImageData[],
    categories: Category[]
  ): Promise<{
    updatedImages: LocalImageData[];
    updatedImage: LocalImageData | null;
  }> {
    const updatedImages = images.map(img =>
      img.id === mediaId ? { ...img, rating: rate } : img
    );
    await saveImagesAndCategories(updatedImages, categories);

    return {
      updatedImages,
      updatedImage: updatedImages.find(img => img.id === mediaId) || null
    };
  }

  async loadImagesFromJson() {
    return await loadImagesData();
  }

  filterAndSortImages(
    mediaList: LocalImageData[],
    {
      filter,
      selectedCategory,
      categories,
      searchTags,
      filterColors,
      multiFilter,
      sortBy,
      sortDirection
    }: {
      filter: FilterType;
      selectedCategory: FilterType | string;
      categories: Category[];
      searchTags: string[];
      filterColors: string[];
      multiFilter: FilterOptions;
      sortBy: SortType;
      sortDirection: SortDirection;
    }
  ): LocalImageData[] {
    let filtered = mediaList.filter(img => img.type !== 'video') as LocalImageData[];

    if (searchTags.length > 0) {
      filtered = filtered.filter(img =>
        searchTags.every(tag =>
          img.tags?.some((imgTag: string) =>
            imgTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    if (selectedCategory === FilterType.Videos) {
      filtered = mediaList.filter(img => img.type === 'video') as LocalImageData[];
    } else if (filter === FilterType.Favorites) {
      filtered = filtered.filter(img => img.favorite);
    } else if (filter === FilterType.Recent) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = mediaList.filter(img => new Date(img.dateModified) >= sevenDaysAgo);
    } else if (selectedCategory !== FilterType.Photos) {
      const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
      if (selectedCategoryData) {
        filtered = mediaList.filter(img =>
          img.categories?.includes(selectedCategory) ||
          selectedCategoryData.images?.includes(img.id)
        );
      }
    }

    filtered = filtered.filter(img => {
      if (filterColors.length > 0) {
        return filterColors.some(filterColor =>
          (img.colors || []).some((c: string | ColorInfo) => {
            const imgColor = typeof c === 'string' ? c : c.color;
            return isSimilarColor(imgColor, filterColor, multiFilter.precision);
          })
        );
      }

      if (multiFilter.ratio.length > 0) {
        return multiFilter.ratio.some(ratio => img.ratio === ratio);
      }
      if (typeof multiFilter.rating === 'number') {
        return img.rating === multiFilter.rating;
      }
      if (multiFilter.formats.length > 0) {
        const ext = img?.extension?.toLowerCase();
        return multiFilter.formats.some(format => ext?.endsWith(format.toLowerCase()));
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case SortType.Name:
          comparison = a.name.localeCompare(b.name);
          break;
        case SortType.Date:
          comparison = new Date(a.dateModified).getTime() - new Date(b.dateModified).getTime();
          break;
        case SortType.Size:
          comparison = a.size - b.size;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }
}