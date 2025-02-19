# 图迹 - 图片管理工具

[English Version](readme.md)

一个简洁优雅的本地图片管理工具，帮助你轻松管理和组织图片与视频资源。

图片管理
![](https://picgo-1300491698.cos.ap-nanjing.myqcloud.com/v.3.0-1.png)

![](https://picgo-1300491698.cos.ap-nanjing.myqcloud.com/v.0.3.0-2.png)

video 管理
![](https://picgo-1300491698.cos.ap-nanjing.myqcloud.com/v.0.3.0-3.png)

## 主要功能

### 媒体管理
- [x] 图片浏览 - 支持网格视图和列表视图
- [x] 图片收藏 - 一键收藏喜欢的图片
- [x] 图片分类 - 灵活的分类管理系统
- [x] 媒体导入 - 支持批量导入本地图片和视频
   - [x] 文件夹导入
   - [x] 拖放导入
- [x] 媒体搜索 - 支持按名称、标签搜索
- [x] 视频支持 
  - [x] 视频预览和播放
  - [x] 智能缩略图生成
  - [x] 鼠标悬停预览
  - [x] 视频时间轴预览
- [x] 批量操作 - 支持批量删除、分类等操作
- [x] AI 标签 - 支持使用 AI 自动为图片添加标签

### 分类功能
- [x] 智能分类 - 内置最近、图片、收藏夹、视频等智能分类
- [x] 自定义分类 - 支持创建、编辑、删除自定义分类
- [x] 分类管理 - 支持将媒体添加到多个分类
- [x] 标签系统 - 支持为媒体添加多个标签

### 界面功能
- [x] 双视图模式 - 支持网格视图和列表视图切换
- [x] 排序功能 - 支持按名称、日期、大小排序
- [x] 暗色主题 - 自适应系统暗色模式
- [x] 响应式设计 - 完美适配各种屏幕尺寸
- [x] 拖放支持 - 支持拖放导入媒体文件
- [x] 框选功能 - 支持框选多个媒体文件
- [x] 自定义背景图
- [x] 全局快捷键 - 支持常用操作的键盘快捷键
- [x] 多语言支持 - 支持切换不同语言

### AI 功能
- [x] AI 自动标签 - 使用深度学习模型自动识别图片内容并添加标签
- [x] ComfyUI 工作流 - 支持自定义 ComfyUI 工作流进行图片处理
- [x] 批量处理 - 支持批量进行 AI 标签识别
- [x] 标签管理 - 支持编辑和管理 AI 生成的标签
- [x] 主色提取 - 自动提取和按主色调分类图片

## 使用指南

安装查看 [install.md](install.md)

### 基础操作

1. **浏览媒体**
   - 切换视图模式: 点击工具栏的网格/列表图标
   - 排序: 点击工具栏的排序按钮，选择排序方式
   - 查看大图: 双击任意媒体可放大查看
   - 视频预览: 鼠标悬停在视频上可预览，移动鼠标可快速预览不同时间点
   - 筛选: 使用工具栏的筛选按钮，可按照文件类型、大小、日期等条件进行筛选

2. **导入媒体**
   - 点击工具栏的"导入"按钮
   - 或直接拖放文件到应用窗口
   - 支持 jpg、jpeg、png、gif 等常见图片格式
   - 支持 mp4、mov、avi、webm 等视频格式

3. **管理收藏**
   - 点击媒体右上角的心形图标收藏/取消收藏
   - 在侧边栏点击"收藏夹"查看所有收藏内容

### 分类管理

1. **创建分类**
   - 点击侧边栏底部的"New Category"按钮
   - 输入分类名称并确认

2. **编辑分类**
   - 鼠标悬停在分类上显示编辑按钮
   - 点击编辑按钮修改分类名称
   - 点击删除按钮删除分类

3. **添加媒体到分类**
   - 选择一个或多个媒体文件
   - 点击"Add to Category"按钮
   - 选择目标分类确认添加

### 批量操作

1. **选择媒体**
   - 点击选中单个媒体
   - 按住 Shift 点击可选择一个范围
   - 在空白处按住鼠标拖动可框选多个媒体

2. **批量操作**
   - 选中媒体后显示批量操作工具栏
   - 支持批量删除
   - 支持批量添加到分类
   - 支持批量添加标签

### AI 功能使用

1. **AI 标签**
   - 选择一个或多个媒体文件
   - 点击工具栏的"AI Tag"按钮
   - 等待 AI 自动识别并添加标签
   - 可以手动编辑和管理标签

2. **ComfyUI 集成**
   - 确保已正确安装 ComfyUI
   - 在设置中配置 ComfyUI 路径
   - 选择要处理的媒体文件
   - 选择预设的工作流或导入自定义工作流
   - 执行处理

## 技术栈

- Electron - 跨平台桌面应用框架
- React - 用户界面构建
- TypeScript - 类型安全的 JavaScript
- Tailwind CSS - 原子化 CSS 框架
- Vite - 现代前端构建工具
- FFmpeg - 视频处理
- Python - AI 功能支持
- ComfyUI - AI 图像处理

## 开发指南

1. 安装依赖

```bash
# 安装 Node.js 依赖
npm install

# 安装 Python 依赖
pip install -r requirements.txt
```

2. 开发模式运行

```bash
npm run electron:dev
```

3. 打包

```bash
npm run electron:build --win
npm run electron:build --mac
npm run electron:build --linux
```

## 注意事项

- 首次运行会在用户数据目录创建配置文件
- 支持的图片格式: jpg、jpeg、png、gif
- 支持的视频格式: mp4、mov、avi、webm
- AI 功能需要安装相应的 Python 环境和依赖
- ComfyUI 功能需要正确配置 ComfyUI 环境
- 建议定期备份配置文件(images.json)

## 未来计划

- [x] 图片标签系统
- [x] 视频预览优化
- [x] 图片信息查看
- [x] 支持颜色分类
- [x] 多语言支持
- [x] 快捷键支持
- [x] 主色提取
- [ ] 可扩展的插件系统
   - [ ] 图片编辑功能
   - [ ] 更多 AI 模型集成
- [ ] ComfyUI 集成 - 支持通过 ComfyUI 进行图片处理
- [ ] 高级搜索过滤

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

## 许可证

MIT License