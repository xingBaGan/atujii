const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { logger } = require('./logService.cjs');
const fsPromises = require('fs').promises;

// 获取应用数据目录中的 JSON 文件路径
const saveImageToLocal = async (imageData, fileName, ext) => {
	try {
		// 确保 images 目录存在
		const imagesDir = path.join(app.getPath('userData'), 'images');
		if (!fs.existsSync(imagesDir)) {
			fs.mkdirSync(imagesDir, { recursive: true });
		}
		let uniqueFileName;
		if (!fileName.includes('.')) {
			uniqueFileName = `${fileName}.${ext}`;
		} else {
			uniqueFileName = fileName;
		}

		// 缓存图片
		const filePath = path.join(imagesDir, uniqueFileName);

		// 将 Uint8Array 转换为 Buffer 并写入文件
		const buffer = Buffer.from(imageData);
		await fs.promises.writeFile(filePath, buffer);

		// 返回本地路径
		return `local-image://${filePath}`;
	} catch (error) {
		console.error('保存图片失败:', error);
		throw error;
	}
};

const saveImagesAndCategories = async (images, categories) => {
	const userDataPath = app.getPath('userData');
	const jsonPath = path.join(userDataPath, 'images.json');
	const tempPath = path.join(userDataPath, 'images.json.temp');
	// 先写入临时文件
	const jsonData = JSON.stringify({ images, categories }, null, 2);
	await fsPromises.writeFile(tempPath, jsonData, 'utf-8');

	// 验证临时文件的完整性
	try {
		const tempContent = await fsPromises.readFile(tempPath, 'utf-8');
		JSON.parse(tempContent); // 验证 JSON 格式是否正确
	} catch (error) {
		throw new Error('临时文件写入验证失败');
	}

	// 如果验证成功，替换原文件
	await fsPromises.rename(tempPath, jsonPath);

	return true;
}

const getJsonFilePath = () => {
	return path.join(app.getPath('userData'), 'images.json');
};

function loadImagesData() {
	try {
		const imagesJsonPath = getJsonFilePath();

		if (!fs.existsSync(imagesJsonPath)) {
			const initialData = { images: [], categories: [] };
			fs.writeFileSync(imagesJsonPath, JSON.stringify(initialData, null, 2));
			return initialData;
		}

		const text = fs.readFileSync(imagesJsonPath, 'utf8');

		if (!text || text.trim() === '') {
			const initialData = { images: [], categories: [] };
			fs.writeFileSync(imagesJsonPath, JSON.stringify(initialData, null, 2));
			return initialData;
		}

		try {
			return JSON.parse(text);
		} catch (parseError) {
			logger.error('JSON 解析失败，恢复到初始状态', parseError);
			const initialData = { images: [], categories: [] };
			fs.writeFileSync(imagesJsonPath, JSON.stringify(initialData, null, 2));
			return initialData;
		}
	} catch (error) {
		logger.error('读取图片数据失败:', error);
		throw error;
	}
}

function getImageById(id) {
	const data = loadImagesData();
	return data.images.find(img => img.id === id);
}

function getImagesByIds(ids) {
	const data = loadImagesData();
	return data.images.filter(img => ids.includes(img.id));
}

async function deletePhysicalFile(filePath) {
	try {
		// 解码文件路径并移除 local-image:// 前缀
		const localPath = decodeURIComponent(filePath.replace('local-image://', ''));
		
		// 检查文件是否存在
		if (fs.existsSync(localPath)) {
			await fs.promises.unlink(localPath);
			logger.info(`物理文件删除成功: ${localPath}`);
			return true;
		} else {
			logger.warn(`文件不存在: ${localPath}`);
			return false;
		}
	} catch (error) {
		logger.error(`删除物理文件失败: ${filePath}`, error);
		throw error;
	}
}

module.exports = {
	saveImageToLocal,
	loadImagesData,
	getJsonFilePath,
	getImageById,
	getImagesByIds,
	deletePhysicalFile,
	saveImagesAndCategories,
}
