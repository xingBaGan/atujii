import { ImportStatus, LocalImageData } from '../types';
import { getMainColor } from '../utils';

const baseUrl = 'http://localhost:3000';

async function getLocalImagePath(imagePath: string): Promise<string> {
  // 如果是本地路径，直接解码
  return decodeURIComponent(imagePath.replace('local-image://', ''));
}

export async function generateImageTags(imagePath: string): Promise<string[]> {
  try {
    // 获取本地图片路径
    const localPath = await getLocalImagePath(imagePath);
    
    const response = await fetch(`${baseUrl}/api/tagger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imagePath: localPath
      })
    });

    const result = await response.json();
    
    if (result.success && result.data?.outputs?.tags) {
      return result.data.outputs.tags[0].split(',').map((tag: string) => tag.trim());
    }
    
    return [];
  } catch (error) {
    console.error(`生成图片标签失败:`, error);
    return [];
  }
}

export async function addTagsToImages(
  selectedImages: LocalImageData[], 
  allImages: LocalImageData[],
  categories: any[],
  modelName: string,
  setImportState: (importState: ImportStatus) => void
): Promise<{
  updatedImages: LocalImageData[],
  success: boolean
}> {
  try {
    setImportState(ImportStatus.Tagging);
    // 对每个选中的图片调用 tagger API
    const updatedImages = await Promise.all(
      selectedImages.map(async (image) => {
        const imagePath = await getLocalImagePath(image.path);
        const newTags = await window.electron.tagImage(imagePath, modelName);
        // 按照字母顺序排序
        const sortedTags = newTags.map(tag => tag.trim()).sort((a, b) => a.localeCompare(b));
        if (!image?.colors?.length) {
          const colors = await getMainColor(imagePath);
          image.colors = colors;
        }

        if (newTags.length > 0) {
        // 合并现有标签和新标签，去重
          return {
            ...image,
            tags: [...new Set([...image.tags, ...sortedTags])]
          };
        }
        return image;
      })
    );
    // 更新图片数据
    const finalImages = allImages.map(img => {
      const updatedImg = updatedImages.find(updated => updated?.id === img.id);
      return updatedImg || img;
    });

    // 将 MediaInfo 转换为 LocalImageData
    const localImageDataList: LocalImageData[] = finalImages.map(img => {
      const { dateCreated, dateModified, ...rest } = img;
      return {
        ...rest,
        dateCreated: dateCreated,
        dateModified: dateModified
      };
    });
    setImportState(ImportStatus.Imported);
    // 保存更新后的图片数据
    await window.electron.saveImagesToJson(localImageDataList, categories);

    return {
      updatedImages: finalImages,
      success: true
    };
  } catch (error) {
    console.error('批量添加标签失败:', error);
    return {
      updatedImages: allImages,
      success: false
    };
  }
}
