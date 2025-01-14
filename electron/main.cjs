const { app, BrowserWindow, ipcMain, dialog, protocol } = require('electron');
const path = require('path');
const fs = require('fs/promises');

const isDev = !app.isPackaged;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({
      mode: 'detach'
    });
  } else {
    mainWindow.loadFile(path.join(process.resourcesPath, 'app.asar/dist/index.html'));
  }
}

const initializeUserData = async () => {
  try {
    const userDataPath = path.join(app.getPath('userData'), 'images.json');
    console.log('用户数据目录路径:', userDataPath);
    
    // 检查用户数据目录中是否已存在 images.json
    try {
      await fs.access(userDataPath);
    } catch {
      // 如果文件不存在，则复制 mockImages 数据
      const mockImagesContent = {
        "images": [
          {
            "id": "1",
            "path": "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
            "name": "Cute cat",
            "size": 1024000,
            "dimensions": { "width": 1920, "height": 1080 },
            "created": "2024-01-01",
            "modified": "2024-01-01",
            "tags": ["animals", "cats"],
            "favorite": true
          },
          {
            "id": "2",
            "path": "https://images.unsplash.com/photo-1579353977828-2a4eab540b9a",
            "name": "Sunset view",
            "size": 2048000,
            "dimensions": { "width": 2560, "height": 1440 },
            "created": "2024-01-02",
            "modified": "2024-01-02",
            "tags": ["nature", "sunset"],
            "favorite": false
          },
          {
            "id": "3",
            "path": "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
            "name": "Workspace",
            "size": 1536000,
            "dimensions": { "width": 1920, "height": 1280 },
            "created": "2024-01-03",
            "modified": "2024-01-03",
            "tags": ["work", "desk"],
            "favorite": false
          },
          {
            "id": "4",
            "path": "https://images.unsplash.com/photo-1484723091739-30a097e8f929",
            "name": "Food photography",
            "size": 3072000,
            "dimensions": { "width": 3840, "height": 2160 },
            "created": "2024-01-04",
            "modified": "2024-01-04",
            "tags": ["food", "photography"],
            "favorite": true
          }
        ]
      };
      
      await fs.writeFile(userDataPath, JSON.stringify(mockImagesContent, null, 2), 'utf-8');
      console.log('Mock images data initialized in userData directory');
    }
  } catch (error) {
    console.error('Error initializing user data:', error);
  }
};

app.whenReady().then(async () => {
  // 初始化用户数据
  await initializeUserData();

  protocol.registerFileProtocol('local-image', (request, callback) => {
    const filePath = request.url.replace('local-image://', '');
    try {
      const decodedPath = decodeURIComponent(filePath);
      callback({ path: decodedPath });
    } catch (error) {
      console.error('Error handling local-image protocol:', error);
      callback({ error: -2 /* FAILED */ });
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('read-directory', async (event, dirPath) => {
  try {
    const files = await fs.readdir(dirPath);
    return files;
  } catch (error) {
    console.error('Error reading directory:', error);
    throw error;
  }
});

ipcMain.handle('read-file-metadata', async (event, filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime
    };
  } catch (error) {
    console.error('Error reading file metadata:', error);
    throw error;
  }
});

ipcMain.handle('load-images-from-json', async (event, jsonPath) => {
  try {
    const loadPath = jsonPath || path.join(app.getPath('userData'), 'images.json');
    const jsonContent = await fs.readFile(loadPath, 'utf-8');
    const data = JSON.parse(jsonContent);
    return data;
  } catch (error) {
    console.error('Error loading images from JSON:', error);
    return { images: [] };
  }
});

ipcMain.handle('show-open-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif'] }
    ]
  });

  if (result.canceled) {
    return [];
  }

  const fileMetadata = await Promise.all(
    result.filePaths.map(async (filePath) => {
      const stats = await fs.stat(filePath);
      const localImageUrl = `local-image://${encodeURIComponent(filePath)}`;
      return {
        path: localImageUrl,
        originalPath: filePath,
        size: stats.size,
        dateCreated: stats.birthtime.toISOString(),
        dateModified: stats.mtime.toISOString()
      };
    })
  );

  return fileMetadata;
});

ipcMain.handle('save-images-to-json', async (event, images) => {
  try {
    const savePath = path.join(app.getPath('userData'), 'images.json');
    const jsonContent = JSON.stringify({ images }, null, 2);
    await fs.writeFile(savePath, jsonContent, 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving images to JSON:', error);
    return false;
  }
});

// 获取应用数据目录中的 JSON 文件路径
const getJsonFilePath = () => {
  return path.join(app.getPath('userData'), 'images.json');
};

// 处理保存图片数据的请求
ipcMain.handle('save-images', async (event, images) => {
  try {
    const filePath = getJsonFilePath();
    await fs.writeFile(filePath, JSON.stringify({ images }, null, 2));
    return { success: true };
  } catch (error) {
    console.error('保存图片数据失败:', error);
    throw error;
  }
});

// 处理加载图片数据的请求
ipcMain.handle('load-images', async () => {
  try {
    const filePath = getJsonFilePath();
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // 如果文件不存在，返回空数组
    if (error.code === 'ENOENT') {
      return { images: [] };
    }
    console.error('读取图片数据失败:', error);
    throw error;
  }
});
