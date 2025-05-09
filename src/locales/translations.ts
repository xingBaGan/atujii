export const translations = {
  en: {
    // Toolbar
    colors: 'Colors',
    ratio: 'Ratio',
    rating: 'Rating',
    formats: 'Formats',
    search: 'Search',
    settings: 'Settings',
    import: 'Import',
    filter: 'Filter',
    grid: 'Grid View',
    list: 'List View',
    sort: {
      date: 'Date',
      name: 'Name',
      size: 'Size',
      type: 'Type'
    },

    // Categories
    photos: 'Photos',
    videos: 'Videos',
    favorites: 'Favorites',
    recent: 'Recent',
    all: 'All',
    categories: 'Categories',
    addCategory: 'Add Category',
    categoryName: 'Category Name',
    moreActions: 'More Actions',
    addSubcategory: 'Add Subcategory',

    // Actions
    delete: 'Delete',
    rename: 'Rename',
    addToCategory: 'Add to Category',
    deleteFromCategory: 'Delete from Category',
    addTags: 'AI Tag',
    confirm: 'Confirm',
    cancel: 'Cancel',
    openData: 'Open data file',
    hideSidebar: 'Hide Sidebar',
    showSidebar: 'Show Sidebar',
    item: 'item',
    items: 'items',
    subFolder: 'sub folder',
    subFolders: 'sub folders',
    // Image Info
    basicInfo: 'Summary',
    videoInfo: 'Summary',
    fileName: 'File Name',
    fileSize: 'File Size',
    dimensions: 'Dimensions',
    dateCreated: 'Date Created',
    dateModified: 'Date Modified',
    tags: 'Tags',
    tagsHint: '(Press Enter to add tag, Backspace to delete)',
    totalImages: '{{count}} images',
    totalVideos: '{{count}} videos',
    selected: '{{count}} selected',

    // Search
    searchImages: 'Search images...',
    pressEnterToAddTag: 'Press Enter to add tag',
    removeTag: 'Remove tag',
    removeColor: 'Remove color',
    escapeToExit: 'Press ESC to exit search',

    // Messages
    deleteConfirm: 'Are you sure you want to delete?',
    importSuccess: 'Import successful',
    updateSuccess: 'Update successful',
    error: 'An error occurred',
    importFailed: 'Import failed: {{error}}',
    updateFavoritesFailed: 'Failed to update favorites status: {{error}}',
    videoTaggingNotSupported: 'Video tagging is not supported yet',

    // Settings
    settingsTitle: 'Settings',
    comfyServerUrl: 'ComfyUI Server URL',
    backgroundImageUrl: 'Background Image URL',
    autoTagging: 'Auto Tagging',
    modelName: 'Model Name',
    enterBackgroundUrl: 'Enter background image URL',
    close: 'Close',
    save: 'Save',
    configSaved: 'Configuration saved',
    saveFailed: 'Failed to save settings: {{error}}',
    autoColor: 'Auto Color',

    // Dialogs
    deleteConfirmTitle: 'Confirm Delete',
    deleteConfirmMessage: 'Are you sure you want to delete this item?',
    yes: 'Yes',
    no: 'No',

    // Media
    openInEditor: 'Open in Editor',
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites',
    copyPath: 'Copy Path',
    pathCopied: 'Path copied to clipboard',
    enterTags: 'Enter tags...',
    dragToSort: 'Drag to sort',
    dropToUpload: 'Drop files here to upload',
    processingFiles: 'Processing files...',

    // Tags
    editTag: 'Edit Tag',
    enterTagName: 'Enter tag name',
    closeDialog: 'Close dialog',
    deleteTag: 'Delete tag {{tag}}',
    addTag: 'Add tag',
    tagInput: 'Enter tag',
    editTagTitle: 'Edit Tag',
    batchTagSuccess: 'Batch tag success: {{count}} images',
    batchTagError: 'Batch tag error',
    batchTag: 'Add Tag',
    batchTagDialogTitle: 'Batch Tag {{count}} images',
    batchTagImages: 'Batch Tag {{count}} images',
    confirmTagTitle: 'Confirm Tag',
    confirmTagMessage: 'Are you sure you want to add the same tags to these {{count}} images?',
    copyTagsSuccess: 'Tags copied to clipboard',
    pasteTagsSuccess: 'Tags pasted',

    // Colors
    percentage: 'Percentage: {{value}}%',
    selectAsFilterColor: 'Add to filter color',
    colorPalette: 'Color Palette',
    colorPrecision: 'Color Precision',

    // Media Viewer
    previous: 'Previous',
    next: 'Next',
    videoNotSupported: 'Your browser does not support the video tag.',

    // Import Status
    importing: 'Importing...',
    tagging: 'Tagging...',
    loading: 'Loading...',
    releaseToUpload: 'Release to upload',
    rateImage: 'Rate image',
    rateVideo: 'Rate video',
    bindInFolder: 'Copied in Folder',

    // Image Item
    moreOptions: 'More Options',
    openContainingFolder: 'Open in Folder',

    // Video Item
    autoplayBlocked: 'Autoplay blocked',

    // Toolbar
    sortBy: 'Sort by ',
    gridView: 'Grid View',
    listView: 'List View',
    searchPlaceholder: 'Search images...',
    enterToAddTag: 'Press Enter to add tag',
    configOpenFailed: 'Failed to open config file: {{error}}',

    // List View
    listName: 'Name',
    listSize: 'Size',
    listDateModified: 'Date Modified',
    listActions: 'Actions',
    listFileSize: '{{size}} MB',

    // App Status
    updateFailed: 'Update failed: {{error}}',
    deleteFailed: 'Failed to delete images: {{error}}',
    addCategoryFailed: 'Failed to add category: {{error}}',
    renameCategoryFailed: 'Failed to rename category: {{error}}',
    deleteCategoryFailed: 'Failed to delete category: {{error}}',
    loadImagesFailed: 'Failed to load images: {{error}}',
    pasteImageFailed: 'Failed to paste image: {{error}}',
    imageServerStarted: 'Image server started on {{tunnelUrl}}',

    // Shortcuts
    shortcuts: {
      title: 'Keyboard Shortcuts',
      show: 'Show Keyboard Shortcuts',
      escape: 'ESC - Deselect all images',
      delete: 'Delete - Delete selected images',
      ctrlA: 'Ctrl+A - Select all images',
      ctrlS: 'Ctrl+S - Open search',
      ctrlG: 'Ctrl+G - Toggle view mode',
      ctrlE: 'Ctrl+E - Open in editor',
      ctrlH: 'Ctrl+H - Add to favorites',
      ctrlO: 'Ctrl+O - Toggle sort popup',
      ctrlF: 'Ctrl+F - Toggle filter popup',
    },

    // Progress
    tagAnalysis: 'Tag Analysis',
    colorAnalysis: 'Color Analysis',
    processingProgress: '{{completed}}/{{total}}',

    // Delete Images Confirm Dialog
    deleteImagesConfirmTitle: 'Delete Images',
    deleteImagesConfirmMessage: 'Are you sure you want to delete {{count}} images?',
    deleteBindInFolder: '(Delete the bind folder category, it will automatically unbind from the image)',
    canceled: 'tasks canceled',
    copyTags: 'Copy Tags',
    clearTags: 'Clear Tags',

    // install
    environmentCheck: 'Environment Check',
    environmentIncomplete: 'Environment incomplete',
    notInstalled: 'Not Installed',
    requiredPackages: 'Required Packages',
    aiModels: 'AI Models',
    installConfirmMessage: 'Do you want to install the required components now?',
    environmentCheckFailed: 'Environment check failed',
    environmentCheckComplete: 'ai models and environment installed',
    installationComplete: 'Installation complete',
    installationFailed: 'Installation failed: {{error}}',
    installing: 'Installing environment...',
    install: 'Install',
    restartAgainAndInstall: 'Please restart and install again',
    checkEnvironmentVariable: 'Please check if the environment variable is correct',
    randomOrder: 'Random order',
    randomOrderTooltip: 'Random order ({{progress}}/10) - Click to change order or long press to exit',
    startImageServer: 'Start Image Server (default)',
    tunnelStopped: 'Image server stopped',
    copy_url_success: 'URL copied to clipboard',
    scan_to_upload: 'Scan QR code to upload image',
  },
  zh: {
    // 工具栏
    colors: '颜色',
    ratio: '比例',
    rating: '评分',
    formats: '格式',
    search: '搜索',
    settings: '设置',
    import: '导入',
    filter: '筛选',
    grid: '网格视图',
    list: '列表视图',
    sort: {
      date: '日期',
      name: '名称',
      size: '大小',
      type: '类型'
    },
    sortBy: '排序方式：',

    // 分类
    photos: '所有图片',
    videos: '所有视频',
    favorites: '收藏',
    recent: '最近',
    all: '全部',
    categories: '自定义分类',
    addCategory: '添加分类',
    categoryName: '分类名称',
    moreActions: '更多操作',
    addSubcategory: '添加子分类',

    // 操作
    delete: '删除',
    rename: '重命名',
    addToCategory: '添加到分类',
    deleteFromCategory: '从分类中删除',
    addTags: 'AI 打标',
    confirm: '确认',
    cancel: '取消',
    openData: '打开data文件',
    hideSidebar: '隐藏侧边栏',
    showSidebar: '显示侧边栏',
    item: '项',
    items: '项',
    subFolder: '子文件夹',
    subFolders: '子文件夹',

    // 图片信息
    basicInfo: '图片概览',
    videoInfo: '视频概览',
    fileName: '文件名',
    fileSize: '文件大小',
    dimensions: '尺寸',
    dateCreated: '创建日期',
    dateModified: '修改日期',
    tags: '标签',

    // 标签 dialog
    tagsHint: '(按回车添加标签，按退格键删除)',
    totalImages: '{{count}}张图片',
    totalVideos: '{{count}}个视频',
    selected: '已选择{{count}}项',
    batchTagImages: '添加标签{{count}}张图片',
    confirmTagTitle: '确认添加标签',
    confirmTagMessage: '确定要这{{count}}张图片添加相同的标签吗？',
    copyTagsSuccess: '标签已复制到剪贴板',
    pasteTagsSuccess: '标签已粘贴',

    // 搜索
    searchImages: '搜索图片...',
    pressEnterToAddTag: '按回车添加标签',
    removeTag: '删除标签',
    removeColor: '移除颜色',
    escapeToExit: '按ESC退出搜索',

    // 消息
    deleteConfirm: '确定要删除吗？',
    importSuccess: '导入成功',
    updateSuccess: '更新成功',
    error: '发生错误',
    importFailed: '导入失败：{{error}}',
    updateFavoritesFailed: '更新收藏状态失败：{{error}}',
    videoTaggingNotSupported: '视频文件暂不支持批量打标签',

    // 设置
    settingsTitle: '设置',
    comfyServerUrl: 'ComfyUI 服务器地址',
    backgroundImageUrl: '背景图片URL',
    autoTagging: '自动打标',
    modelName: '模型名称',
    enterBackgroundUrl: '输入背景图片URL',
    close: '关闭',
    save: '保存',
    configSaved: '配置已保存',
    saveFailed: '保存设置失败：{{error}}',
    autoColor: '自动取色',
    // 对话框
    deleteConfirmTitle: '确认删除',
    deleteConfirmMessage: '确定要删除此项吗？',
    yes: '是',
    no: '否',

    // 媒体
    openInEditor: '在编辑器中打开',
    addToFavorites: '添加到收藏',
    removeFromFavorites: '取消收藏',
    copyPath: '复制路径',
    pathCopied: '路径已复制到剪贴板',
    enterTags: '输入标签...',
    dragToSort: '拖动排序',
    dropToUpload: '拖放文件到此处上传',
    processingFiles: '正在处理文件...',

    // 标签
    editTag: '编辑标签',
    enterTagName: '输入标签名称',
    closeDialog: '关闭对话框',
    deleteTag: '删除标签 {{tag}}',
    addTag: 'AI 打标',
    tagInput: '输入标签',
    editTagTitle: '编辑标签',
    batchTagSuccess: '批量添加标签成功: {{count}} 张图片',
    batchTagError: '批量添加标签失败',
    batchTag: '添加标签',
    batchTagDialogTitle: '批量添加标签 {{count}} 张图片',

    // 颜色
    percentage: '占比: {{value}}%',
    selectAsFilterColor: '选择为筛选颜色',
    colorPalette: '颜色面板',
    colorPrecision: '颜色精度',

    // Media Viewer
    previous: '上一张',
    next: '下一张',
    videoNotSupported: '您的浏览器不支持视频标签。',

    // 导入状态
    importing: '正在导入...',
    tagging: '正在标记...',
    loading: '加载中...',
    releaseToUpload: '松开以上传',
    rateImage: '给图片评分',
    rateVideo: '给视频评分',
    bindInFolder: '已拷贝',

    // Image Item
    moreOptions: '更多选项',
    openContainingFolder: '打开所在文件夹',

    // Video Item
    autoplayBlocked: '自动播放被阻止',

    // Toolbar
    gridView: '网格视图',
    listView: '列表视图',
    searchPlaceholder: '搜索图片...',
    enterToAddTag: '按回车添加标签',
    configOpenFailed: '打开配置文件失败：{{error}}',

    // List View
    listName: '名称',
    listSize: '大小',
    listDateModified: '修改日期',
    listActions: '操作',
    listFileSize: '{{size}} MB',

    // 应用状态
    updateFailed: '更新失败：{{error}}',
    deleteFailed: '删除图片失败：{{error}}',
    addCategoryFailed: '添加分类失败：{{error}}',
    renameCategoryFailed: '重命名分类失败：{{error}}',
    deleteCategoryFailed: '删除分类失败：{{error}}',
    loadImagesFailed: '加载图片失败：{{error}}',
    pasteImageFailed: '粘贴图片失败：{{error}}',

    // 快捷键
    shortcuts: {
      title: '键盘快捷键',
      show: '显示键盘快捷键',
      escape: 'ESC - 取消选择所有图片',
      delete: 'Delete - 删除选中的图片',
      ctrlA: 'Ctrl+A - 选择所有图片',
      ctrlS: 'Ctrl+S - 打开搜索',
      ctrlG: 'Ctrl+G - 切换视图模式',
      ctrlE: 'Ctrl+E - 在编辑器中打开',
      ctrlH: 'Ctrl+H - 添加到收藏',
      ctrlO: 'Ctrl+O - 切换排序弹窗',
      ctrlF: 'Ctrl+F - 切换筛选弹窗',
    },

    // Progress
    tagAnalysis: '标签分析',
    colorAnalysis: '颜色分析',
    processingProgress: '{{completed}}/{{total}}',

    // Delete Images Confirm Dialog
    deleteImagesConfirmTitle: '删除图片',
    deleteImagesConfirmMessage: '确定要删除这{{count}}张图片吗？',
    deleteBindInFolder: '(删除该绑定文件夹分类，将会自动解除与图片的绑定)',
    canceled: '任务已取消',
    copyTags: '复制标签',
    clearTags: '清空标签',

    // install
    environmentCheck: '环境检查',
    environmentIncomplete: '检测到环境未完全安装',
    notInstalled: '未安装',
    requiredPackages: '必需的包',
    aiModels: 'AI模型',
    installConfirmMessage: '是否要现在安装必需的组件？',
    environmentCheckFailed: '环境检查失败',
    environmentCheckComplete: 'ai 模型和环境安装完毕',
    installationComplete: '安装完成',
    installationFailed: '安装失败：{{error}}',
    installing: '正在安装环境...',
    install: '安装',
    restartAgainAndInstall: '请重新启动并重新安装',
    checkEnvironmentVariable: '请检测环境变量是否正确',
    randomOrder: '随机顺序',
    randomOrderTooltip: '随机顺序 ({{progress}}/10) - 点击更改顺序或长按退出',
    startImageServer: '启动图片服务器(默认)',
    tunnelStopped: '图片服务器已停止',
    copy_url_success: 'URL已复制到剪贴板',
    scan_to_upload: '扫描二维码上传图片',
  }
}; 