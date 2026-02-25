# 图片压缩工具

一个基于 Node.js 和 Sharp 的图片压缩工具，支持单张图片压缩和批量文件夹压缩。

## 功能特性

- ✅ 支持单张图片压缩
- ✅ 支持批量压缩文件夹中的所有图片
- ✅ 支持多种图片格式：JPG、JPEG、PNG、WebP、GIF
- ✅ 可配置压缩质量（1-100）
- ✅ 支持限制最大宽度和高度（自动保持宽高比）
- ✅ 支持输出到指定目录
- ✅ 支持保留原文件
- ✅ 显示详细的压缩统计信息（文件大小、压缩率等）
- ✅ TypeScript 支持，提供完整的类型定义

## 安装

```bash
# 在项目根目录执行
pnpm install

# 或者仅在 serve 包中安装
cd packages/serve
pnpm install
```

## 使用方法

### 1. 作为模块使用

在代码中导入并使用：

```typescript
import { compressImage, compressImagesInFolder } from './utils/imageCompress'

// 压缩单张图片
const result = await compressImage('./image.jpg', {
  quality: 85,
  maxWidth: 1920,
  outputDir: './compressed'
})

console.log('压缩结果:', result)

// 批量压缩文件夹
const results = await compressImagesInFolder('./images', {
  quality: 80,
  maxWidth: 1920,
  maxHeight: 1080,
  outputDir: './compressed',
  keepOriginal: true
})
```

### 2. 命令行使用

#### 压缩单张图片

```bash
# 使用 pnpm script
pnpm compress-image ./path/to/image.jpg --quality 85

# 或直接使用 node
node dist/index.js compress-image ./path/to/image.jpg --quality 85

# 或使用 tsx（开发环境）
pnpm exec tsx src/index.ts compress-image ./path/to/image.jpg --quality 85
```

#### 批量压缩文件夹

```bash
# 使用 pnpm script
pnpm compress-folder ./images --quality 80 --output-dir ./compressed

# 或直接使用 node
node dist/index.js compress-folder ./images --quality 80 --output-dir ./compressed

# 或使用 tsx（开发环境）
pnpm exec tsx src/index.ts compress-folder ./images --quality 80 --output-dir ./compressed
```

## 选项说明

### 压缩选项 (ImageCompressOptions)

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `quality` | `number` | `80` | 压缩质量 (1-100)，数值越大质量越好，文件越大 |
| `maxWidth` | `number` | - | 最大宽度（像素），不设置则保持原尺寸 |
| `maxHeight` | `number` | - | 最大高度（像素），不设置则保持原尺寸 |
| `outputDir` | `string` | - | 输出目录，不设置则覆盖原文件 |
| `keepOriginal` | `boolean` | `false` | 是否保留原文件，默认覆盖原文件 |
| `supportedFormats` | `string[]` | `['jpg', 'jpeg', 'png', 'webp', 'gif']` | 支持的图片格式列表 |

### 命令行选项

| 选项 | 说明 | 示例 |
|------|------|------|
| `--quality <数字>` | 压缩质量 (1-100)，默认 80 | `--quality 85` |
| `--max-width <数字>` | 最大宽度（像素） | `--max-width 1920` |
| `--max-height <数字>` | 最大高度（像素） | `--max-height 1080` |
| `--output-dir <路径>` | 输出目录 | `--output-dir ./compressed` |
| `--keep-original` | 保留原文件 | `--keep-original` |

## 使用示例

### 示例 1: 压缩单张图片，设置质量

```bash
pnpm compress-image ./photo.jpg --quality 90
```

### 示例 2: 压缩单张图片，限制尺寸并输出到指定目录

```bash
pnpm compress-image ./photo.jpg --quality 85 --max-width 1920 --output-dir ./compressed
```

### 示例 3: 批量压缩文件夹，保留原文件

```bash
pnpm compress-folder ./images --quality 80 --keep-original --output-dir ./compressed
```

### 示例 4: 批量压缩文件夹，限制尺寸和质量

```bash
pnpm compress-folder ./images --quality 75 --max-width 1920 --max-height 1080 --output-dir ./compressed
```

### 示例 5: 在代码中使用

```typescript
import { compressImage, compressImagesInFolder } from './utils/imageCompress'

// 压缩单张图片
async function compressSingleImage() {
  const result = await compressImage('./image.jpg', {
    quality: 85,
    maxWidth: 1920,
    outputDir: './compressed'
  })

  if (result.success) {
    console.log(`压缩成功: ${result.compressionRatio.toFixed(2)}%`)
    console.log(`原始大小: ${result.originalSize} bytes`)
    console.log(`压缩后大小: ${result.compressedSize} bytes`)
  } else {
    console.error('压缩失败:', result.error)
  }
}

// 批量压缩文件夹
async function compressFolder() {
  const results = await compressImagesInFolder('./images', {
    quality: 80,
    maxWidth: 1920,
    maxHeight: 1080,
    outputDir: './compressed',
    keepOriginal: true
  })

  const successCount = results.filter(r => r.success).length
  console.log(`成功压缩 ${successCount}/${results.length} 张图片`)
}
```

## API 参考

### compressImage(inputPath, options?)

压缩单张图片。

**参数：**
- `inputPath: string` - 输入图片路径
- `options?: ImageCompressOptions` - 压缩选项

**返回：** `Promise<CompressResult>`

### compressImagesInFolder(inputDir, options?)

批量压缩文件夹中的图片。

**参数：**
- `inputDir: string` - 输入文件夹路径
- `options?: ImageCompressOptions` - 压缩选项

**返回：** `Promise<CompressResult[]>`

### CompressResult

压缩结果对象：

```typescript
interface CompressResult {
  originalPath: string      // 原文件路径
  outputPath: string        // 输出文件路径
  originalSize: number      // 原始文件大小（字节）
  compressedSize: number    // 压缩后文件大小（字节）
  compressionRatio: number  // 压缩率（百分比）
  success: boolean          // 是否成功
  error?: string            // 错误信息（如果失败）
}
```

## 开发

### 构建项目

```bash
pnpm build
```

### 运行开发模式

```bash
pnpm dev
```

### 清理构建文件

```bash
pnpm clean
```

## 注意事项

1. **文件覆盖**: 默认情况下，如果不指定 `outputDir` 且不设置 `keepOriginal`，会直接覆盖原文件，请谨慎使用。

2. **格式支持**: 支持的图片格式包括 JPG、JPEG、PNG、WebP、GIF。其他格式可能无法正常处理。

3. **尺寸限制**: 设置 `maxWidth` 或 `maxHeight` 时，会自动保持宽高比，不会导致图片变形。

4. **性能**: 对于大量图片的批量压缩，可能需要一些时间，请耐心等待。

5. **内存使用**: 处理大尺寸图片时可能会占用较多内存，建议在处理前确保有足够的系统资源。

## 依赖

- [sharp](https://sharp.pixelplumbing.com/) - 高性能图片处理库
- TypeScript - 类型支持

## 许可证

MIT

