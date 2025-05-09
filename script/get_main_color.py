import os
import sys
from PIL import Image
import numpy as np
import time
try:
    import cupy as cp
    from cupy.cuda import runtime
    USE_GPU = True
    print(f"GPU模式已启用 - CUDA版本: {runtime.runtimeGetVersion()}")
except ImportError:
    from sklearn.cluster import KMeans
    USE_GPU = False
    print("警告: GPU加速库未安装，将使用CPU模式运行,如需GPU加速，请安装对应CUDA版本的cupy-cuda, pip install cupy-cuda12x")


def resize_image_if_needed(image, max_size=1024):
    """
    如果图片太大，将其缩放到合适大小
    """
    if max(image.size) > max_size:
        ratio = max_size / max(image.size)
        new_size = tuple(int(x * ratio) for x in image.size)
        return image.resize(new_size, Image.LANCZOS)
    return image

def get_dominant_colors_kmeans(image_path, num_colors=5):
    # 打开图片
    img = Image.open(image_path)
    img = img.convert('RGB')
    
    # 缩放大图
    img = resize_image_if_needed(img)
    
    # 转换为numpy数组
    img_array = np.array(img)
    pixels = img_array.reshape(-1, 3)
    
    if USE_GPU:
        # GPU模式 - 使用CuPy实现KMeans
        pixels_gpu = cp.asarray(pixels, dtype=cp.float32)
        
        # 随机初始化聚类中心
        centroids = kmeans_plusplus_init(pixels_gpu, num_colors)
        
        # KMeans迭代
        for _ in range(20):  # 最大迭代次数
            # 计算每个像素到聚类中心的距离
            distances = cp.sum((pixels_gpu[:, cp.newaxis] - centroids) ** 2, axis=2)
            labels = cp.argmin(distances, axis=1)
            
            # 更新聚类中心
            new_centroids = cp.zeros_like(centroids)
            for k in range(num_colors):
                mask = labels == k
                if cp.any(mask):
                    new_centroids[k] = cp.mean(pixels_gpu[mask], axis=0)
            
            # 如果聚类中心基本不变，则停止迭代
            if cp.allclose(centroids, new_centroids):
                break
            centroids = new_centroids
            
        # 转回CPU
        colors = cp.asnumpy(centroids)
        labels = cp.asnumpy(labels)
    else:
        # CPU模式
        kmeans = KMeans(n_clusters=num_colors, init='k-means++')
        kmeans.fit(pixels)
        colors = kmeans.cluster_centers_
        labels = kmeans.labels_
    
    # 计算每个颜色的占比
    total_pixels = len(pixels)
    color_percentages = []
    
    for i in range(num_colors):
        count = np.sum(labels == i)
        percentage = (count / total_pixels) * 100
        color_percentages.append(percentage)
    
    # 将颜色值转换为整数
    colors = colors.round().astype(int)
    
    # 按照占比排序
    sorted_indices = np.argsort(color_percentages)[::-1]
    colors = colors[sorted_indices]
    color_percentages = [color_percentages[i] for i in sorted_indices]
    
    # 将颜色转换为十六进制格式并添加百分比
    result = []
    for color, percentage in zip(colors, color_percentages):
        hex_color = '#{:02x}{:02x}{:02x}'.format(color[0], color[1], color[2])
        result.append({
            'color': hex_color,
            'percentage': round(percentage, 2)
        })
    
    return result

def kmeans_plusplus_init(pixels, num_colors):
    centroids = cp.zeros((num_colors, 3), dtype=cp.float32)
    centroids[0] = pixels[cp.random.choice(len(pixels), size=1)]
    
    for i in range(1, num_colors):
        distances = cp.min(cp.sum((pixels[:, cp.newaxis] - centroids[:i]) ** 2, axis=2), axis=1)
        probabilities = distances / cp.sum(distances)
        centroids[i] = pixels[cp.random.choice(len(pixels), size=1, p=probabilities)]
        
    return centroids

def main():
    try:
        if len(sys.argv) < 2:
            print("error:请提供图片路径")
            sys.exit(1)
        
        image_path = sys.argv[1]

        # 确保图片路径存在
        if not os.path.exists(image_path):
            print(f"error:图片不存在: {image_path}")
            sys.exit(1)
        
        colors = get_dominant_colors_kmeans(image_path, 10)
        print(colors)
    except Exception as e:
        print(f"error:{str(e)}")
        sys.exit(1)

def test_get_main_color(image_path):
    colors = get_dominant_colors_kmeans(image_path, 10)
    print(colors)

def multi_get_main_color():
    dir_path = r"K:\dataset2\animesfw"
    files = [os.path.join(dir_path, file) for file in os.listdir(dir_path)[:50] if file.endswith(".jpg") or file.endswith(".png")]
    
    from multiprocessing import Pool
    with Pool(processes=10) as pool:
        pool.map(test_get_main_color, files)


if __name__ == "__main__":
    main()
    # 计算时间
    # start_time = time.time()
    # multi_get_main_color()
    # end_time = time.time()
    # print(f"运行时间: {end_time - start_time} 秒")

# colors = get_dominant_colors_kmeans("C:\\Users\\jzj\\Pictures\\姿势\\甘雨.png")
# print(colors)
