/**
 * Джерело: public/assets/img/icons/icon-1024.png (єдиний файл у git).
 *
 * Локально:     npm run icons  (або GENERATE_ICONS=true npm run build)
 * Vercel CI:    GENERATE_ICONS=true у build (див. vercel.json)
 * Xcode:        GENERATE_IOS_APPICON=true npm run icons
 */
import sharp from 'sharp';
import { mkdir, copyFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const iconsDir = join(root, 'public', 'assets', 'img', 'icons');
const masterPath = join(iconsDir, 'icon-1024.png');
const imgDir = join(root, 'public', 'assets', 'img');

const shouldRun =
  process.argv.includes('--local') || process.env.GENERATE_ICONS === 'true';

if (!shouldRun) {
  console.log(
    '[icons] Пропуск. Локально: npm run icons  |  Vercel: GENERATE_ICONS=true (build)'
  );
  process.exit(0);
}

if (!existsSync(masterPath)) {
  console.error('[icons] Потрібен файл:', masterPath);
  process.exit(1);
}

const pwaSizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
];
const appleSizes = [
  { size: 57, name: 'apple-icon-57.png' },
  { size: 60, name: 'apple-icon-60.png' },
  { size: 72, name: 'apple-icon-72.png' },
  { size: 76, name: 'apple-icon-76.png' },
  { size: 114, name: 'apple-icon-114.png' },
  { size: 120, name: 'apple-icon-120.png' },
  { size: 144, name: 'apple-icon-144.png' },
  { size: 152, name: 'apple-icon-152.png' },
  { size: 167, name: 'apple-icon-167.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 1024, name: 'apple-icon-1024.png' },
];
const faviconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
];

async function main() {
  await mkdir(iconsDir, { recursive: true });
  const input = sharp(masterPath);

  for (const { size, name } of [...pwaSizes, ...appleSizes, ...faviconSizes]) {
    await input
      .clone()
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .png({ compressionLevel: 9 })
      .toFile(join(iconsDir, name));
    console.log('wrote', name);
  }

  await copyFile(join(iconsDir, 'apple-touch-icon.png'), join(imgDir, 'apple-icon.png'));
  await copyFile(join(iconsDir, 'favicon-32x32.png'), join(imgDir, 'favicon.png'));
  console.log('updated apple-icon.png + favicon.png');

  if (process.env.GENERATE_IOS_APPICON !== 'true') {
    console.log('[icons] ios/ пропущено (GENERATE_IOS_APPICON=true для Xcode)');
    return;
  }

  const appIconSet = join(root, 'ios', 'AppIcon.appiconset');
  await mkdir(appIconSet, { recursive: true });
  const iosSlots = [
    { idiom: 'iphone', size: 20, scale: 2, px: 40, file: 'Icon-20@2x.png' },
    { idiom: 'iphone', size: 20, scale: 3, px: 60, file: 'Icon-20@3x.png' },
    { idiom: 'iphone', size: 29, scale: 2, px: 58, file: 'Icon-29@2x.png' },
    { idiom: 'iphone', size: 29, scale: 3, px: 87, file: 'Icon-29@3x.png' },
    { idiom: 'iphone', size: 40, scale: 2, px: 80, file: 'Icon-40@2x.png' },
    { idiom: 'iphone', size: 40, scale: 3, px: 120, file: 'Icon-40@3x.png' },
    { idiom: 'iphone', size: 60, scale: 2, px: 120, file: 'Icon-60@2x.png' },
    { idiom: 'iphone', size: 60, scale: 3, px: 180, file: 'Icon-60@3x.png' },
    { idiom: 'ipad', size: 20, scale: 1, px: 20, file: 'Icon-20.png' },
    { idiom: 'ipad', size: 20, scale: 2, px: 40, file: 'Icon-20-ipad@2x.png' },
    { idiom: 'ipad', size: 29, scale: 1, px: 29, file: 'Icon-29.png' },
    { idiom: 'ipad', size: 29, scale: 2, px: 58, file: 'Icon-29-ipad@2x.png' },
    { idiom: 'ipad', size: 40, scale: 1, px: 40, file: 'Icon-40.png' },
    { idiom: 'ipad', size: 40, scale: 2, px: 80, file: 'Icon-40-ipad@2x.png' },
    { idiom: 'ipad', size: 76, scale: 1, px: 76, file: 'Icon-76.png' },
    { idiom: 'ipad', size: 76, scale: 2, px: 152, file: 'Icon-76@2x.png' },
    { idiom: 'ipad', size: 83.5, scale: 2, px: 167, file: 'Icon-83.5@2x.png' },
    { idiom: 'ios-marketing', size: 1024, scale: 1, px: 1024, file: 'Icon-1024.png' },
  ];
  const images = [];
  for (const slot of iosSlots) {
    await input
      .clone()
      .resize(slot.px, slot.px, { fit: 'cover', position: 'centre' })
      .png({ compressionLevel: 9 })
      .toFile(join(appIconSet, slot.file));
    const sizeStr =
      slot.idiom === 'ios-marketing' ? '1024x1024' : `${slot.size}x${slot.size}`;
    images.push({
      filename: slot.file,
      idiom: slot.idiom,
      size: sizeStr,
      scale: `${slot.scale}x`,
    });
  }
  await writeFile(
    join(appIconSet, 'Contents.json'),
    JSON.stringify({ images, info: { version: 1, author: 'sport-service-vn' } }, null, 2)
  );
  console.log('wrote ios/AppIcon.appiconset');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
