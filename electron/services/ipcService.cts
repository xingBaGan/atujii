import { app, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import { generateHashId } from '../utils/index.cjs';
import { getComfyURL } from './settingService.cjs';
import { 
  saveImageToLocal, 
  loadImagesData, 
  getJsonFilePath, 
  deletePhysicalFile, 
  saveImagesAndCategories 
} from './FileService.cjs';
import { 
  getVideoDuration, 
  generateVideoThumbnail, 
  getImageSize, 
  processDirectoryFiles 
} from './mediaService.cjs';
import { tagImage, getMainColor } from '../../script/script.cjs';
import { tagQueue, colorQueue } from './queueService.cjs';
import { logger } from './logService.cjs';

interface FileMetadata {
  id: string;
  path: string;
  name: string;
  extension: string;
  size: number;
  dateCreated: string;
  dateModified: string;
  tags: string[];
  favorite: boolean;
  categories: string[];
  type: 'video' | 'image';
  duration?: number;
  thumbnail?: string;
}

interface LogMeta {
  [key: string]: any;
}

// 检查是否为远程 ComfyUI
const isRemoteComfyUI = async function (): Promise<boolean> {
  const ComfyUI_URL = await getComfyURL();
  return !(ComfyUI_URL?.includes('localhost') || ComfyUI_URL?.includes('127.0.0.1'));
}

const init = (): void => {
  // =============== 视频处理相关 ===============
  ipcMain.handle('get-video-duration', async (event, filePath: string) => {
    if (filePath.startsWith('local-image://')) {
      filePath = decodeURIComponent(filePath.replace('local-image://', ''));
    }
    return await getVideoDuration(filePath);
  });

  ipcMain.handle('generate-video-thumbnail', async (event, filePath: string) => {
    if (filePath.startsWith('local-image://')) {
      filePath = decodeURIComponent(filePath.replace('local-image://', ''));
    }
    return await generateVideoThumbnail(filePath);
  });

  // =============== 文件操作相关 ===============
  ipcMain.handle('open-in-photoshop', async (_, filePath: string) => {
    try {
      const localPath = decodeURIComponent(filePath.replace('local-image://', ''));
      await shell.openPath(localPath)
      return { success: true };
    } catch (error) {
      logger.error('打开 Photoshop 失败:', { error } as LogMeta);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('show-in-folder', async (_, filePath: string) => {
    try {
      const localPath = decodeURIComponent(filePath.replace('local-image://', ''));
      await shell.showItemInFolder(localPath);
      return { success: true };
    } catch (error) {
      logger.error('在文件夹中显示失败:', { error } as LogMeta);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('read-directory', async (event, dirPath: string) => {
    try {
      const files = await fsPromises.readdir(dirPath);
      return files;
    } catch (error) {
      logger.error('读取目录失败:', { error } as LogMeta);
      throw error;
    }
  });

  ipcMain.handle('read-file-metadata', async (event, filePath: string) => {
    try {
      const stats = await fsPromises.stat(filePath);
      return {
        size: stats.size,
        dateCreated: stats.birthtime,
        dateModified: stats.mtime
      };
    } catch (error) {
      logger.error('读取文件元数据失败:', { error } as LogMeta);
      throw error;
    }
  });

  // =============== 图片下载和处理相关 ===============
  ipcMain.handle('download-url-image', async (_, url: string) => {
    try {
      const https = require('https');
      const http = require('http');
      const client = url.startsWith('https') ? https : http;

      // 下载图片数据
      const imageBuffer = await new Promise<Buffer>((resolve, reject) => {
        client.get(url, (res: any) => {
          if (res.statusCode !== 200) {
            reject(new Error(`请求失败: ${res.statusCode}`));
            return;
          }

          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        }).on('error', reject);
      });

      // 处理文件名和扩展名
      const id = generateHashId(url, imageBuffer.length);
      const fileNameMatch = url.match(/filename=([^&]+)/);
      let fileName = fileNameMatch ? fileNameMatch[1] : id;
      const contentType = await new Promise<string>((resolve) => {
        client.get(url, (res: any) => {
          resolve(res.headers['content-type'] || 'image/jpeg');
        });
      });
      const ext = contentType.split('/').pop() || 'jpg';
      
      if (!fileName.includes('.')) {
        fileName = fileName + '.' + ext;
      }

      // 保存图片到本地
      const localPath = await saveImageToLocal(imageBuffer, fileName, ext);
      return {
        success: true,
        localPath,
        fileName,
        extension: ext,
        size: imageBuffer.length,
        type: contentType
      };
    } catch (error) {
      logger.error('下载图片失败:', { error } as LogMeta);
      return { success: false, error: (error as Error).message };
    }
  });

  // =============== 数据管理相关 ===============
  ipcMain.handle('load-images-from-json', async () => {
    try {
      const jsonPath = getJsonFilePath();

      if (!fs.existsSync(jsonPath)) {
        return { images: [], categories: [] };
      }

      const data = await fs.promises.readFile(jsonPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      logger.error('加载图片数据失败:', { error } as LogMeta);
      throw error;
    }
  });

  ipcMain.handle('save-images-to-json', async (event, images: any[], categories: any[], currentSelectedCategory: string) => {
    try {
      return await saveImagesAndCategories(images, categories);
    } catch (error) {
      logger.error('保存图片数据失败:', { error } as LogMeta);
      throw error;
    }
  });

  // =============== 文件选择对话框相关 ===============
  ipcMain.handle('show-open-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: '媒体文件', extensions: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'webm'] }
      ]
    });

    if (result.canceled) {
      return [];
    }

    // 处理选中的文件
    const fileMetadata = await Promise.all(
      result.filePaths.map(async (filePath): Promise<FileMetadata> => {
        const stats = await fsPromises.stat(filePath);
        const localImageUrl = `local-image://${encodeURIComponent(filePath)}`;
        const ext = path.extname(filePath).toLowerCase();
        const isVideo = ['.mp4', '.mov', '.avi', '.webm'].includes(ext);

        const metadata: FileMetadata = {
          id: Date.now().toString(),
          path: localImageUrl,
          name: path.basename(filePath, ext),
          extension: ext.slice(1),
          size: stats.size,
          dateCreated: stats.birthtime.toISOString(),
          dateModified: stats.mtime.toISOString(),
          tags: [],
          favorite: false,
          categories: [],
          type: isVideo ? 'video' : 'image',
        };

        if (isVideo) {
          try {
            metadata.duration = await getVideoDuration(filePath);
            metadata.thumbnail = await generateVideoThumbnail(filePath);
          } catch (error) {
            logger.error('处理视频元数据失败:', { error } as LogMeta);
          }
        }

        return metadata;
      })
    );

    return fileMetadata;
  });

  // =============== 分类管理相关 ===============
  ipcMain.handle('save-categories', async (event, categories: any[]) => {
    try {
      const filePath = getJsonFilePath();
      const existingData = JSON.parse(await fsPromises.readFile(filePath, 'utf8'));
      existingData.categories = categories;
      await fsPromises.writeFile(filePath, JSON.stringify(existingData, null, 2));
      return { success: true };
    } catch (error) {
      logger.error('保存分类数据失败:', { error } as LogMeta);
      throw error;
    }
  });

  // =============== 图片分析相关 ===============
  ipcMain.handle('tag-image', async (event, imagePath: string, modelName: string) => {
    const taskId = `tag-${Date.now()}`;
    try {
      return await tagQueue.addTask(async () => {
        imagePath = decodeURIComponent(imagePath);
        imagePath = imagePath.replace('local-image://', '');
        return await tagImage(imagePath, modelName);
      }, taskId);
    } catch (error) {
      logger.error('图片标签分析失败:', { error } as LogMeta);
      throw error;
    }
  });

  ipcMain.handle('get-main-color', async (event, imagePath: string) => {
    const taskId = `color-${Date.now()}`;
    try {
      return await colorQueue.addTask(async () => {
        imagePath = decodeURIComponent(imagePath);
        imagePath = imagePath.replace('local-image://', '');
        return await getMainColor(imagePath);
      }, taskId);
    } catch (error) {
      logger.error('提取主色调失败:', { error } as LogMeta);
      throw error;
    }
  });
};

export { init, isRemoteComfyUI }; 