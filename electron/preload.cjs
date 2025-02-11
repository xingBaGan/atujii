const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  readDirectory: (path) => ipcRenderer.invoke('read-directory', path),
  readFileMetadata: (path) => ipcRenderer.invoke('read-file-metadata', path),
  loadImagesFromJson: () => ipcRenderer.invoke('load-images-from-json'),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
  saveImagesToJson: (images, categories) => 
    ipcRenderer.invoke('save-images-to-json', images, categories),
  openImageJson: () => ipcRenderer.invoke('open-image-json'),
  saveCategories: (categories) => ipcRenderer.invoke('save-categories', categories),
  saveImageToLocal: (imageBuffer, fileName, ext) => 
    ipcRenderer.invoke('save-image-to-local', imageBuffer, fileName, ext),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  isRemoteComfyUI: () => ipcRenderer.invoke('is-remote-comfyui'),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  tagImage: (imagePath, modelName) => ipcRenderer.invoke('tag-image', imagePath, modelName),
  getMainColor: (imagePath) => ipcRenderer.invoke('get-main-color', imagePath),
  getQueueStatus: () => ipcRenderer.invoke('get-queue-status'),
  processDirectoryFiles: (dirPath) => ipcRenderer.invoke('process-directory', dirPath),
  openInEditor: (filePath) => ipcRenderer.invoke('open-in-photoshop', filePath),
  downloadUrlImage: (url) => ipcRenderer.invoke('download-url-image', url),
  showInFolder: (filePath) => ipcRenderer.invoke('show-in-folder', filePath),
  onRemoteImagesDownloaded: (callback) => {
    ipcRenderer.on('remote-images-downloaded', (event, result) => callback(result));
  },
  removeRemoteImagesDownloadedListener: (callback) => {
    ipcRenderer.removeListener('remote-images-downloaded', callback);
  },
  onQueueUpdate: (callback) => {
    ipcRenderer.on('queue-update', (event, status) => callback(status));
  },
  removeQueueUpdateListener: (callback) => {
    ipcRenderer.removeListener('queue-update', callback);
  },
  // 接收主进程消息的方法
  on: (channel, callback) => {
    if (channel === 'initialize-plugin') {  // 白名单校验
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },
  // 移除监听
  removeListener: (channel, callback) => {
    if (channel === 'initialize-plugin') {
      ipcRenderer.removeListener(channel, callback);
    }
  }
});

// 暴露给主进程的方法
contextBridge.exposeInMainWorld('plugins', {
  getPlugins: () => ipcRenderer.invoke('get-plugins'),
  initializePlugin: (pluginId) => ipcRenderer.invoke('plugin-setup', pluginId),
  setupPlugin: (plugin) => {
    if (plugin) {
      console.log(`设置插件: ${plugin.name}`);
      // setup 函数会通过 initialize-plugin 事件单独处理
    }
  },
  on: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  }
});