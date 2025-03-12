const { app, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const { generateHashId } = require('../utils/index.cjs');
const { getComfyURL } = require('./settingService.cjs');
const { saveImageToLocal, loadImagesData, getJsonFilePath, deletePhysicalFile, saveImagesAndCategories } = require('./FileService.cjs');
const { getVideoDuration, generateVideoThumbnail, getImageSize, processDirectoryFiles } = require('./mediaService.cjs');
const { tagImage, getMainColor } = require(path.join(__dirname, '../../', 'script', 'script.cjs'))
const { tagQueue, colorQueue } = require('./queueService.cjs');
const { logger } = require('./logService.cjs');

// 检查是否为远程 ComfyUI
const isRemoteComfyUI = function () {
  const ComfyUI_URL = getComfyURL();
  return !(ComfyUI_URL.includes('localhost') || ComfyUI_URL.includes('127.0.0.1'));
}

const init = () => {
  // =============== 视频处理相关 ===============
  ipcMain.handle('get-video-duration', async (event, filePath) => {
    if (filePath.startsWith('local-image://')) {
      filePath = decodeURIComponent(filePath.replace('local-image://', ''));
    }
    return await getVideoDuration(filePath);
  });

  ipcMain.handle('generate-video-thumbnail', async (event, filePath) => {
    if (filePath.startsWith('local-image://')) {
      filePath = decodeURIComponent(filePath.replace('local-image://', ''));
    }
    return await generateVideoThumbnail(filePath);
  });

  // =============== 文件操作相关 ===============
  ipcMain.handle('open-in-photoshop', async (_, filePath) => {
    try {
      const localPath = decodeURIComponent(filePath.replace('local-image://', ''));
      await shell.openPath(localPath)
      return { success: true };
    } catch (error) {
      logger.error('打开 Photoshop 失败:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('show-in-folder', async (_, filePath) => {
    try {
      const localPath = decodeURIComponent(filePath.replace('local-image://', ''));
      await shell.showItemInFolder(localPath);
      return { success: true };
    } catch (error) {
      logger.error('在文件夹中显示失败:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('read-directory', async (event, dirPath) => {
    try {
      const files = await fsPromises.readdir(dirPath);
      return files;
    } catch (error) {
      logger.error('读取目录失败:', error);
      throw error;
    }
  });

  ipcMain.handle('read-file-metadata', async (event, filePath) => {
    try {
      const stats = await fsPromises.stat(filePath);
      return {
        size: stats.size,
        dateCreated: stats.birthtime,
        dateModified: stats.mtime
      };
    } catch (error) {
      logger.error('读取文件元数据失败:', error);
      throw error;
    }
  });

  // =============== 图片下载和处理相关 ===============
  ipcMain.handle('download-url-image', async (_, url) => {
    try {
      const https = require('https');
      const http = require('http');
      const client = url.startsWith('https') ? https : http;

      // 下载图片数据
      const imageBuffer = await new Promise((resolve, reject) => {
        client.get(url, (res) => {
          if (res.statusCode !== 200) {
            reject(new Error(`请求失败: ${res.statusCode}`));
            return;
          }

          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        }).on('error', reject);
      });

      // 处理文件名和扩展名
      const id = generateHashId(url, imageBuffer.length);
      const fileNameMatch = url.match(/filename=([^&]+)/);
      let fileName = fileNameMatch ? fileNameMatch[1] : id;
      const contentType = await new Promise((resolve) => {
        client.get(url, (res) => {
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
      logger.error('下载图片失败:', error);
      return { success: false, error: error.message };
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
      logger.error('加载图片数据失败:', error);
      throw error;
    }
  });

  ipcMain.handle('save-images-to-json', async (event, images, categories, currentSelectedCategory) => {
    try {
      return await saveImagesAndCategories(images, categories);
    } catch (error) {
      logger.error('保存图片数据失败:', error);
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
      result.filePaths.map(async (filePath) => {
        const stats = await fsPromises.stat(filePath);
        const localImageUrl = `local-image://${encodeURIComponent(filePath)}`;
        const ext = path.extname(filePath).toLowerCase();
        const isVideo = ['.mp4', '.mov', '.avi', '.webm'].includes(ext);

        const metadata = {
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
            logger.error('处理视频元数据失败:', error);
          }
        }

        return metadata;
      })
    );

    return fileMetadata;
  });

  // =============== 分类管理相关 ===============
  ipcMain.handle('save-categories', async (event, categories) => {
    try {
      const filePath = getJsonFilePath();
      const existingData = JSON.parse(await fsPromises.readFile(filePath, 'utf8'));
      existingData.categories = categories;
      await fsPromises.writeFile(filePath, JSON.stringify(existingData, null, 2));
      return { success: true };
    } catch (error) {
      logger.error('保存分类数据失败:', error);
      throw error;
    }
  });

  // =============== 图片分析相关 ===============
  ipcMain.handle('tag-image', async (event, imagePath, modelName) => {
    const taskId = `tag-${Date.now()}`;
    try {
      return await tagQueue.addTask(async () => {
        imagePath = decodeURIComponent(imagePath);
        imagePath = imagePath.replace('local-image://', '');
        return await tagImage(imagePath, modelName);
      }, taskId);
    } catch (error) {
      logger.error('图片标签分析失败:', error);
      throw error;
    }
  });

  ipcMain.handle('get-main-color', async (event, imagePath) => {
    const taskId = `color-${Date.now()}`;
    try {
      return await colorQueue.addTask(async () => {
        imagePath = decodeURIComponent(imagePath);
        imagePath = imagePath.replace('local-image://', '');
        return await getMainColor(imagePath);
      }, taskId);
    } catch (error) {
      logger.error('提取主色调失败:', error);
      throw error;
    }
  });

  // =============== 队列管理相关 ===============
  ipcMain.handle('get-queue-status', async () => {
    return {
      tag: {
        queueLength: tagQueue.getQueueLength(),
        runningTasks: tagQueue.getRunningTasks()
      },
      color: {
        queueLength: colorQueue.getQueueLength(),
        runningTasks: colorQueue.getRunningTasks()
      }
    };
  });

  ipcMain.handle('reset-queue-progress', async (event, type) => {
    if (type === 'tag') {
      tagQueue.reset();
    } else {
      colorQueue.reset();
    }
    return true;
  });

  // =============== 文件夹监控相关 ===============
  ipcMain.handle('process-directory', async (event, dirPath, currentCategory = {}) => {
    try {
      tagQueue.reset();
      colorQueue.reset();
      const results = await processDirectoryFiles(dirPath, currentCategory);
      return results;
    } catch (error) {
      logger.error('处理目录失败:', error);
      throw new Error('处理目录失败: ' + error.message);
    }
  });

  // =============== 其他功能 ===============
  ipcMain.handle('is-remote-comfyui', async () => {
    return isRemoteComfyUI();
  });

  // =============== 文件夹操作相关 ===============
  ipcMain.handle('open-folder-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });

    if (result.canceled) {
      return null;
    }

    return result.filePaths[0];
  });

  ipcMain.handle('read-images-from-folder', async (event, folderPath) => {
    try {
      const [files, _category] = await processDirectoryFiles(folderPath);

      // 创建新的分类对象
      const categoryName = path.basename(folderPath);
      const category = {
        id: `category-${Date.now()}`,
        name: categoryName,
        images: files.map(file => file.id),
        count: files.length,
        folderPath: folderPath,
        isImportFromFolder: true
      };

      return {
        category,
        images: files
      };
    } catch (error) {
      logger.error('读取文件夹图片失败:', error);
      throw error;
    }
  });

  // =============== 文件管理相关 ===============
  ipcMain.handle('copy-file-to-category-folder', async (event, filePath, currentCategory) => {
    const watchService = require('./watchService.cjs');
    return await watchService.copyFileToCategoryFolder(filePath, currentCategory);
  });

  ipcMain.handle('delete-file', async (event, filePath) => {
    return await deletePhysicalFile(filePath);
  });

  ipcMain.handle('read-file', async (event, filePath) => {
    try {
      if (filePath.includes('local-image://')) {
        filePath = filePath.replace('local-image://', '');
      }
      const buffer = await fsPromises.readFile(filePath);
      return buffer;
    } catch (error) {
      logger.error('读取文件失败:', error);
      throw error;
    }
  });

  // =============== JSON文件操作相关 ===============
  ipcMain.handle('open-image-json', async () => {
    try {
      const jsonPath = getJsonFilePath();
      await shell.openPath(jsonPath);
      return { success: true };
    } catch (error) {
      logger.error('打开 images.json 失败:', error);
      return { success: false, error: error.message };
    }
  });

  // 初始化插件系统
  const pluginService = require('./pluginService.cjs');
  pluginService.initializeAndSetupIPC(ipcMain);
}

init();