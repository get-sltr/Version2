/**
 * Generate PNG icons from SVG for PWA manifest
 *
 * Run with: node scripts/generate-icons.js
 *
 * Requires: npm install sharp
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Sharp not installed. Installing...');
  require('child_process').execSync('npm install sharp', { stdio: 'inherit' });
  sharp = require('sharp');
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// SVG content for the Primal logo icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0A1628"/>
      <stop offset="100%" style="stop-color:#132038"/>
    </linearGradient>
    <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#ff9f5a"/>
      <stop offset="100%" style="stop-color:#ff7b3d"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bgGrad)"/>
  <g transform="translate(256, 256) skewX(-15)">
    <rect x="-90" y="-100" width="40" height="200" rx="6" fill="url(#orangeGrad)"/>
    <rect x="-30" y="-100" width="40" height="200" rx="6" fill="#ffffff"/>
    <rect x="30" y="-100" width="40" height="200" rx="6" fill="#ffffff"/>
  </g>
</svg>`;

// Apple touch icon (180x180)
const appleSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0A1628"/>
      <stop offset="100%" style="stop-color:#132038"/>
    </linearGradient>
    <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#ff9f5a"/>
      <stop offset="100%" style="stop-color:#ff7b3d"/>
    </linearGradient>
  </defs>
  <rect width="180" height="180" rx="36" fill="url(#bgGrad)"/>
  <g transform="translate(90, 90) skewX(-15)">
    <rect x="-32" y="-35" width="14" height="70" rx="2" fill="url(#orangeGrad)"/>
    <rect x="-11" y="-35" width="14" height="70" rx="2" fill="#ffffff"/>
    <rect x="10" y="-35" width="14" height="70" rx="2" fill="#ffffff"/>
  </g>
</svg>`;

async function generateIcons() {
  console.log('Generating Primal PWA icons...\n');

  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Generate each size
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);

    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated icon-${size}x${size}.png`);
  }

  // Generate apple-touch-icon
  const appleIconPath = path.join(iconsDir, 'apple-touch-icon.png');
  await sharp(Buffer.from(appleSvgContent))
    .resize(180, 180)
    .png()
    .toFile(appleIconPath);

  console.log('✓ Generated apple-touch-icon.png');

  // Generate favicon.ico (32x32)
  const faviconPath = path.join(__dirname, '../public/favicon.ico');
  await sharp(Buffer.from(svgContent))
    .resize(32, 32)
    .png()
    .toFile(faviconPath.replace('.ico', '.png'));

  console.log('✓ Generated favicon.png');

  console.log('\n✅ All icons generated successfully!');
  console.log('\nNote: The SVG icons in src/app/ will be automatically used by Next.js for favicon.');
}

generateIcons().catch(console.error);
