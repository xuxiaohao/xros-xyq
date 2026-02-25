#!/usr/bin/env node

/**
 * 图片压缩工具
 * 使用示例：
 *  压缩单张图片: node src/index.js compress-image <图片路径> [选项]
 *  批量压缩: node src/index.js compress-folder <文件夹路径> [选项]
 */

import { compressImage, compressImagesInFolder } from "./compression";

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  if (command === "compress-image") {
    // 压缩单张图片
    const imagePath = args[1];
    if (!imagePath) {
      console.error("请提供图片路径");
      process.exit(1);
    }

    const options = parseOptions(args.slice(2));
    const result = await compressImage(imagePath, options);

    if (result.success) {
      console.log("压缩成功!");
      console.log(`输出路径: ${result.outputPath}`);
      console.log(
        `大小: ${formatSize(result.originalSize)} → ${formatSize(
          result.compressedSize
        )}`
      );
      console.log(`压缩率: ${result.compressionRatio.toFixed(2)}%`);
    } else {
      console.error("压缩失败:", result.error);
      process.exit(1);
    }
  } else if (command === "compress-folder") {
    // 批量压缩文件夹
    const folderPath = args[1];
    if (!folderPath) {
      console.error("请提供文件夹路径");
      process.exit(1);
    }

    const options = parseOptions(args.slice(2));
    await compressImagesInFolder(folderPath, options);
  } else {
    console.log(`
图片压缩工具

用法:
  node src/index.js compress-image <图片路径> [选项]
  node src/index.js compress-folder <文件夹路径> [选项]

选项:
  --quality <数字>         压缩质量 (1-100)，默认 80
  --max-width <数字>       最大宽度
  --max-height <数字>      最大高度
  --output-dir <路径>      输出目录
  --keep-original          保留原文件

示例:
  node src/index.js compress-image ./image.jpg --quality 85
  node src/index.js compress-folder ./images --quality 80 --output-dir ./compressed
    `);
  }
}

/**
 * 解析命令行选项
 */
function parseOptions(args: string[]) {
  const options: any = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--quality" && args[i + 1]) {
      options.quality = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === "--max-width" && args[i + 1]) {
      options.maxWidth = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === "--max-height" && args[i + 1]) {
      options.maxHeight = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === "--output-dir" && args[i + 1]) {
      options.outputDir = args[i + 1];
      i++;
    } else if (arg === "--keep-original") {
      options.keepOriginal = true;
    }
  }
  return options;
}

/**
 * 格式化文件大小
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

main().catch((error) => {
  console.error("执行失败:", error);
  process.exit(1);
});
