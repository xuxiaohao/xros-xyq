import sharp from "sharp";
import { readdir, stat, mkdir } from "fs/promises";
import { join, extname, basename, dirname } from "path";
import { existsSync } from "fs";

/**
 * 图片压缩选项
 */
export interface ImageCompressOptions {
  /** 压缩质量 (1-100)，默认 80 */
  quality?: number;
  /** 最大宽度，不设置则保持原尺寸 */
  maxWidth?: number;
  /** 最大高度，不设置则保持原尺寸 */
  maxHeight?: number;
  /** 输出目录，不设置则覆盖原文件 */
  outputDir?: string;
  /** 是否保留原文件，默认 false（覆盖原文件） */
  keepOriginal?: boolean;
  /** 支持的图片格式，默认 ['jpg', 'jpeg', 'png', 'webp'] */
  supportedFormats?: string[];
}

/**
 * 压缩结果
 */
export interface CompressResult {
  /** 原文件路径 */
  originalPath: string;
  /** 输出文件路径 */
  outputPath: string;
  /** 原始文件大小（字节） */
  originalSize: number;
  /** 压缩后文件大小（字节） */
  compressedSize: number;
  /** 压缩率（百分比） */
  compressionRatio: number;
  /** 是否成功 */
  success: boolean;
  /** 错误信息（如果失败） */
  error?: string;
}

/**
 * 压缩单张图片
 * @param inputPath 输入图片路径
 * @param options 压缩选项
 * @returns 压缩结果
 */
export async function compressImage(
  inputPath: string,
  options: ImageCompressOptions = {}
): Promise<CompressResult> {
  const {
    quality = 80,
    maxWidth,
    maxHeight,
    outputDir,
    keepOriginal = false,
  } = options;

  try {
    // 获取文件信息
    const stats = await stat(inputPath);
    const originalSize = stats.size;
    const ext = extname(inputPath).toLowerCase().slice(1);
    const filename = basename(inputPath, `.${ext}`);

    // 确定输出路径
    let outputPath: string;
    if (outputDir) {
      // 确保输出目录存在
      if (!existsSync(outputDir)) {
        await mkdir(outputDir, { recursive: true });
      }
      outputPath = join(outputDir, `${filename}.${ext}`);
    } else if (keepOriginal) {
      // 保留原文件，在相同目录生成新文件
      const dir = dirname(inputPath);
      outputPath = join(dir, `${filename}_compressed.${ext}`);
    } else {
      // 覆盖原文件
      outputPath = inputPath;
    }

    // 读取图片并压缩
    let sharpInstance = sharp(inputPath);

    // 获取图片元数据
    const metadata = await sharpInstance.metadata();
    let targetWidth = metadata.width;
    let targetHeight = metadata.height;

    // 计算目标尺寸（保持宽高比）
    if (maxWidth || maxHeight) {
      if (maxWidth && metadata.width && metadata.width > maxWidth) {
        targetWidth = maxWidth;
        if (metadata.height && metadata.width) {
          targetHeight = Math.round(
            (metadata.height * maxWidth) / metadata.width
          );
        }
      }
      if (
        maxHeight &&
        targetHeight &&
        targetHeight > maxHeight &&
        metadata.height
      ) {
        targetHeight = maxHeight;
        if (targetWidth && metadata.width) {
          targetWidth = Math.round(
            (metadata.width * maxHeight) / metadata.height
          );
        }
      }
      sharpInstance = sharpInstance.resize(targetWidth, targetHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // 根据格式应用压缩
    switch (ext) {
      case "jpg":
      case "jpeg":
        await sharpInstance.jpeg({ quality, mozjpeg: true }).toFile(outputPath);
        break;
      case "png":
        await sharpInstance
          .png({ quality, compressionLevel: 9 })
          .toFile(outputPath);
        break;
      case "webp":
        await sharpInstance.webp({ quality }).toFile(outputPath);
        break;
      case "gif":
        // GIF 需要特殊处理，sharp 支持有限
        await sharpInstance.gif().toFile(outputPath);
        break;
      default:
        // 其他格式尝试通用压缩
        await sharpInstance.toFile(outputPath);
    }

    // 获取压缩后文件大小
    const outputStats = await stat(outputPath);
    const compressedSize = outputStats.size;
    const compressionRatio =
      ((originalSize - compressedSize) / originalSize) * 100;

    return {
      originalPath: inputPath,
      outputPath,
      originalSize,
      compressedSize,
      compressionRatio: Math.round(compressionRatio * 100) / 100,
      success: true,
    };
  } catch (error) {
    return {
      originalPath: inputPath,
      outputPath: outputDir || inputPath,
      originalSize: 0,
      compressedSize: 0,
      compressionRatio: 0,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 批量压缩文件夹中的图片
 * @param inputDir 输入文件夹路径
 * @param options 压缩选项
 * @returns 压缩结果数组
 */
export async function compressImagesInFolder(
  inputDir: string,
  options: ImageCompressOptions = {}
): Promise<CompressResult[]> {
  const { supportedFormats = ["jpg", "jpeg", "png", "webp", "gif"] } = options;

  try {
    // 检查输入目录是否存在
    if (!existsSync(inputDir)) {
      throw new Error(`输入目录不存在: ${inputDir}`);
    }

    const stats = await stat(inputDir);
    if (!stats.isDirectory()) {
      throw new Error(`输入路径不是目录: ${inputDir}`);
    }

    // 读取目录中的所有文件
    const files = await readdir(inputDir);
    const imageFiles = files.filter((file) => {
      const ext = extname(file).toLowerCase().slice(1);
      return supportedFormats.includes(ext);
    });

    if (imageFiles.length === 0) {
      console.warn(`目录中没有找到支持的图片文件: ${inputDir}`);
      return [];
    }

    console.log(`找到 ${imageFiles.length} 张图片，开始压缩...`);

    // 批量压缩
    const results: CompressResult[] = [];
    for (const file of imageFiles) {
      const filePath = join(inputDir, file);
      const result = await compressImage(filePath, options);
      results.push(result);

      if (result.success) {
        console.log(
          `✓ ${basename(filePath)}: ${formatSize(
            result.originalSize
          )} → ${formatSize(
            result.compressedSize
          )} (压缩率: ${result.compressionRatio.toFixed(2)}%)`
        );
      } else {
        console.error(`✗ ${basename(filePath)}: ${result.error}`);
      }
    }

    // 输出统计信息
    const successCount = results.filter((r) => r.success).length;
    const totalOriginalSize = results.reduce(
      (sum, r) => sum + r.originalSize,
      0
    );
    const totalCompressedSize = results.reduce(
      (sum, r) => sum + r.compressedSize,
      0
    );
    const totalCompressionRatio =
      ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100;

    console.log("\n=== 压缩完成 ===");
    console.log(`成功: ${successCount}/${results.length}`);
    console.log(
      `总大小: ${formatSize(totalOriginalSize)} → ${formatSize(
        totalCompressedSize
      )}`
    );
    console.log(`总压缩率: ${totalCompressionRatio.toFixed(2)}%`);

    return results;
  } catch (error) {
    console.error("批量压缩失败:", error);
    throw error;
  }
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的字符串
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}
