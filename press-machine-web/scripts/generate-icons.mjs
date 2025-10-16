import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// SVGファイルを読み込み
const svgPath = join(projectRoot, 'src/app/icon.svg');
const svgBuffer = readFileSync(svgPath);

// 生成する画像サイズとパス
const icons = [
  { size: 16, output: join(projectRoot, 'public/favicon-16x16.png') },
  { size: 32, output: join(projectRoot, 'public/favicon-32x32.png') },
  { size: 180, output: join(projectRoot, 'public/apple-touch-icon.png') },
  { size: 192, output: join(projectRoot, 'public/icon-192.png') },
  { size: 512, output: join(projectRoot, 'public/icon-512.png') },
];

console.log('🎨 アイコン生成を開始します...\n');

// 各サイズのPNG画像を生成
for (const icon of icons) {
  try {
    await sharp(svgBuffer)
      .resize(icon.size, icon.size)
      .png()
      .toFile(icon.output);
    console.log(`✅ ${icon.size}x${icon.size} -> ${icon.output.split('/').pop()}`);
  } catch (error) {
    console.error(`❌ ${icon.size}x${icon.size} の生成に失敗:`, error.message);
  }
}

// favicon.icoを生成（複数サイズを含む）
try {
  const favicon16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const favicon32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();

  // Note: .icoファイルの生成にはpng-to-icoなどの追加パッケージが必要
  // ここではfavicon.icoとしてapp/ディレクトリに32x32のPNGを配置
  const faviconPath = join(projectRoot, 'src/app/favicon.ico');
  writeFileSync(faviconPath, favicon32);
  console.log(`✅ favicon.ico -> src/app/favicon.ico`);
} catch (error) {
  console.error('❌ favicon.icoの生成に失敗:', error.message);
}

console.log('\n🎉 すべてのアイコンが生成されました！');
