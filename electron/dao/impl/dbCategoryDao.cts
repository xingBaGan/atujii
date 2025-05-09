import { CategoryDAO } from '../CategoryDAO.cjs';
import { LocalImageData, Category } from '../type.cjs';
import { ImageDatabase } from '../../pouchDB/Database.cjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { DAOFactory } from '../DAOFactory.cjs';

export default class DBCategoryDAO implements CategoryDAO {
  private db: ImageDatabase;

  constructor() {
    this.db = ImageDatabase.getInstance();
  }

  async getImagesAndCategories(): Promise<{ images: LocalImageData[], categories: Category[] }> {
    try {
      const dbImages = await this.db.getAllImages();
      const dbCategories = await this.db.getAllCategories();

      const images = dbImages.map(img => ({
        id: img.id,
        path: img.path,
        name: img.name,
        extension: img.extension,
        size: img.size,
        dateCreated: img.dateCreated,
        dateModified: img.dateModified,
        tags: img.tags || [],
        favorite: img.favorite,
        categories: img.categories || [],
        type: img.type,
        width: img.width,
        height: img.height,
        ratio: img.ratio || `${img.width}:${img.height}`,
        duration: img.duration,
        thumbnail: img.thumbnail,
        isBindInFolder: img.isBindInFolder,
        rating: img.rating,
        colors: img.colors || []
      }));

      const categories = dbCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        images: cat.images || [],
        count: cat.count || 0,
        folderPath: cat.folderPath,
        isImportFromFolder: cat.isImportFromFolder,
        order: cat.order,
        father: cat.father,
        children: cat.children,
        level: cat.level
      }));

      return { images, categories };
    } catch (error) {
      console.error('Error getting images and categories:', error);
      return { images: [], categories: [] };
    }
  }

  async addCategory(newCategory: Category, images: LocalImageData[], categories: Category[]): Promise<Category[]> {
    try {
      const categoryWithImages = {
        ...newCategory,
        images: [],
        count: 0
      };

      await this.db.createCategory(categoryWithImages);

      return [...categories, categoryWithImages];
    } catch (error) {
      console.error('Error in add-category:', error);
      throw error;
    }
  }

  async renameCategory(categoryId: string, newName: string, categories: Category[]): Promise<Category[]> {
    try {
      await this.db.updateCategory(categoryId, { name: newName });

      return categories.map(category =>
        category.id === categoryId
          ? { ...category, name: newName }
          : category
      );
    } catch (error) {
      console.error('Error in rename-category:', error);
      throw error;
    }
  }

  async deleteCategory(categoryId: string, images: LocalImageData[], categories: Category[]): Promise<{
    updatedCategories: Category[],
    updatedImages: LocalImageData[]
  }> {
    try {
      const deletedCategory = categories.find(category => category.id === categoryId);
      let tempImages = [...images];

      if (deletedCategory?.isImportFromFolder) {
        tempImages = images.map(img => {
          if (deletedCategory.images?.includes(img.id)) {
            return { ...img, isBindInFolder: false };
          }
          return img;
        });

        // 更新图片在数据库中的状态
        for (const imageId of deletedCategory.images || []) {
          // find the image in the original images
          const originalImage = images.find(img => img.id === imageId);
          if (originalImage) {
            const originalCategories = originalImage.categories || [];
            const newCategories = originalCategories.filter(categoryId => categoryId !== categoryId);
            await this.db.updateImage(imageId, { isBindInFolder: false, categories: newCategories });
          }
        }
      }

      // 删除分类的子分类
      await Promise.all(deletedCategory?.children?.map(async childId => {
        await this.deleteCategory(childId, images, categories);
      }) || []);

      // 从父分类中删除该分类
      if (deletedCategory?.father) {
        const fatherCategory = categories.find(category => category.id === deletedCategory.father);
        if (fatherCategory) {
          await this.db.updateCategory(fatherCategory.id, { children: fatherCategory.children?.filter(childId => childId !== categoryId) });
        }
      }

      // 删除分类
      await this.db.deleteCategory(categoryId);

      const { categories: updatedCategories, images: updatedImages } = await this.getImagesAndCategories();
      return {
        updatedCategories,
        updatedImages
      };
    } catch (error) {
      console.error('Error in delete-category:', error);
      throw error;
    }
  }

  async removeFromGrandParentCategory(selectedImages: Set<string>, selectedCategories: string[], images: LocalImageData[], categories: Category[]): Promise<{
    updatedImages: LocalImageData[];
    updatedCategories: Category[];
  }> {
    let grandParentCategories = new Set<string>();
    // 遍历selectedCategories 的父级以上的categories, 删除selectedImages
    for (const categoryId of selectedCategories) {
      let currentCategory = categories.find(category => category.id === categoryId);
      while (currentCategory && currentCategory?.father) {
        currentCategory = categories.find(category => category.id === currentCategory!.father);
        if (currentCategory) {
          currentCategory.images = currentCategory.images?.filter(image => !selectedImages.has(image)) || [];
          currentCategory.count = currentCategory.images?.length || 0;
          // 找到images中对应的image, 删除
          grandParentCategories.add(currentCategory.id);
        }
      }
    }
    // 遍历selectedImages, 删除categories中对应的 parentCategory
    for (const imageId of selectedImages) {
      const image = images.find(image => image.id === imageId);
      if (image) {
        image.categories = image.categories?.filter(categoryId => !grandParentCategories.has(categoryId)) || [];
        image.isDirty = true;
      }
    }
    const imageDAO = DAOFactory.getImageDAO();
    await imageDAO.saveImagesAndCategories(images, categories);
    return { updatedImages: images, updatedCategories: categories };
  }

  collectChildren(categoryId: string, categories: Category[]): string[] {
    const children: string[] = [];
    const current = categories?.find(cat => cat.id === categoryId);
    if (!current?.children) return children;
    for (const childId of current.children) {
      // 收集儿子
      children.push(childId);
      const child = categories?.find(cat => cat.id === childId);
      if (child?.children) {
        children.push(...this.collectChildren(childId, categories));
      }
    }
    return children;
  };

  async removeFromChildrenCategory(selectedImages: Set<string>, selectedCategories: string[], images: LocalImageData[], categories: Category[]): Promise<{
    updatedImages: LocalImageData[];
    updatedCategories: Category[];
  }> {
    const allChildrenId: string[] = [];
    for (const selectedId of selectedCategories) {
      allChildrenId.push(...this.collectChildren(selectedId, categories));
    }
    for (const categoryId of allChildrenId) {
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        category.images = category.images?.filter(imageId => !selectedImages.has(imageId)) || [];
        category.count = category.images?.length || 0;
      }
    }
    for (const imageId of selectedImages) {
      const image = images.find(image => image.id === imageId);
      if (image) {
        image.categories = image.categories?.filter(categoryId => !allChildrenId.includes(categoryId)) || [];
        image.isDirty = true;
      }
    }
    const imageDAO = DAOFactory.getImageDAO();
    await imageDAO.saveImagesAndCategories(images, categories);
    return { updatedImages: images, updatedCategories: categories };
  }

  async addToCategory(
    selectedImages: Set<string>,
    selectedCategories: string[],
    images: LocalImageData[],
    categories: Category[]
  ): Promise<{
    updatedImages: LocalImageData[];
    updatedCategories: Category[];
  }> {
    try {
      const updatedImages = [...images];
      const updatedCategories = [...categories];

      // 为每个选中的图片添加分类
      for (const imageId of selectedImages) {
        for (const categoryId of selectedCategories) {
          await this.db.addImageToCategory(imageId, categoryId);
        }

        // 更新内存中的图片对象
        const imgIndex = updatedImages.findIndex(img => img.id === imageId);
        if (imgIndex !== -1) {
          updatedImages[imgIndex] = {
            ...updatedImages[imgIndex],
            categories: Array.from(new Set([
              ...(updatedImages[imgIndex].categories || []),
              ...selectedCategories
            ]))
          };
        }
      }

      // 更新内存中的分类对象的images和count
      for (let i = 0; i < updatedCategories.length; i++) {
        if (selectedCategories.includes(updatedCategories[i].id)) {
          const existingImages = updatedCategories[i].images || [];
          const newImages = Array.from(selectedImages);
          const allImages = Array.from(new Set([...existingImages, ...newImages]));

          updatedCategories[i] = {
            ...updatedCategories[i],
            images: allImages,
            count: allImages.length
          };
          await this.db.updateCategory(updatedCategories[i].id, updatedCategories[i]);
        }
      }
      // 将祖父中重复的图片删除
      const { 
        updatedImages: updatedImages2,
        updatedCategories: updatedCategories2
       } = await this.removeFromGrandParentCategory(selectedImages, selectedCategories, updatedImages, updatedCategories);
      // 将儿子中重复的图片删除
      const { 
        updatedImages: updatedImages3,
        updatedCategories: updatedCategories3
       } = await this.removeFromChildrenCategory(selectedImages, selectedCategories, updatedImages2, updatedCategories2);
      return { updatedImages: updatedImages3, updatedCategories: updatedCategories3 };
    } catch (error) {
      console.error('Error in add-to-category:', error);
      throw error;
    }
  }

  async importFolderFromPath(
    folderPath: string,
    images: LocalImageData[],
    categories: Category[]
  ): Promise<{
    newImages: LocalImageData[];
    updatedCategories: Category[];
    categoryId: string;
  }> {
    try {
      // 创建新分类
      const folderName = path.basename(folderPath);
      const categoryId = uuidv4();
      const category: Category = {
        id: categoryId,
        name: folderName,
        images: [],
        count: 0,
        folderPath: folderPath,
        isImportFromFolder: true
      };

      // 读取文件夹中的图片
      const files = fs.readdirSync(folderPath);
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      });

      // 创建新图片对象
      const newImages: LocalImageData[] = [];
      const imageIds: string[] = [];

      for (const file of imageFiles) {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);

        const imageId = uuidv4();
        imageIds.push(imageId);

        const newImage: LocalImageData = {
          id: imageId,
          path: `local-image://${filePath}`,
          name: file,
          extension: path.extname(file).substring(1),
          size: stats.size,
          dateCreated: stats.birthtime.toISOString(),
          dateModified: stats.mtime.toISOString(),
          tags: [],
          favorite: false,
          categories: [categoryId],
          type: 'image',
          width: 0, // 这里需要获取实际宽度
          height: 0, // 这里需要获取实际高度
          ratio: '1:1', // 默认比例
          isBindInFolder: true,
          rating: 0,
          colors: []
        };

        newImages.push(newImage);

        // 将图片保存到数据库
        await this.db.createImage({
          id: newImage.id || '',
          path: newImage.path,
          name: newImage.name,
          extension: newImage.extension,
          size: newImage.size,
          dateCreated: newImage.dateCreated,
          dateModified: newImage.dateModified,
          tags: newImage.tags,
          favorite: newImage.favorite || false,
          categories: newImage.categories || [],
          type: 'image',
          width: newImage.width || 0,
          height: newImage.height || 0,
          ratio: newImage.ratio || '1:1',
          isBindInFolder: newImage.isBindInFolder || false,
          rating: newImage.rating || 0,
          colors: newImage.colors || []
        });
      }

      // 更新分类
      category.images = imageIds;
      category.count = imageIds.length;

      // 保存分类到数据库
      await this.db.createCategory(category);

      // 过滤掉重复的图片
      const filteredImages = [...images.filter(img => !newImages.some(newImg => newImg.id === img.id)), ...newImages];

      return {
        newImages: filteredImages,
        updatedCategories: [...categories, category],
        categoryId: category.id
      };
    } catch (error) {
      console.error('Error in import-folder-from-path:', error);
      throw error;
    }
  }

  async saveCategories(categories: Category[]): Promise<boolean> {
    try {
      await Promise.all(categories.map(async (category) => {
        const dbCategory = await this.db.getCategory(category.id);
        if (dbCategory) {
          await this.db.updateCategory(category.id, category);
        } else {
          await this.db.createCategory(category);
        }
      }));
      return true;
    } catch (error) {
      console.error('Error in save-categories:', error);
      throw error;
    }
  }
}
