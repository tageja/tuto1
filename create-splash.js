const sharp = require('sharp');

const logoPath = './assets/splash-logo.png';
const outputDir = './ios/Tuto/Images.xcassets/SplashScreenLegacy.imageset';

const configs = [
  { width: 2778, height: 1284, logoSize: 900, name: 'image@3x.png' },  // Fits in 1284 height
  { width: 1792, height: 828, logoSize: 700, name: 'image@2x.png' },   // Fits in 828 height
  { width: 1334, height: 750, logoSize: 650, name: 'image.png' },      // Fits in 750 height
];

async function createSplash() {
  for (const config of configs) {
    const { width, height, logoSize, name } = config;
    
    // Read and resize the logo, ensuring RGBA for proper compositing
    const resizedLogo = await sharp(logoPath)
      .resize(logoSize, logoSize, { 
        fit: 'inside',
        withoutEnlargement: false
      })
      .ensureAlpha()  // Ensure it has alpha channel
      .toBuffer();
    
    // Get the actual dimensions of the resized logo
    const logoMeta = await sharp(resizedLogo).metadata();
    
    // Create black background with alpha channel and composite
    await sharp({
      create: {
        width,
        height,
        channels: 4,  // Use 4 channels to match logo
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      }
    })
    .composite([{
      input: resizedLogo,
      gravity: 'center'
    }])
    .flatten({ background: { r: 0, g: 0, b: 0 } })  // Flatten to RGB after compositing
    .png()
    .toFile(`${outputDir}/${name}`);
    
    console.log(`✅ Created ${name}: ${width}x${height} with ${logoMeta.width}x${logoMeta.height} logo`);
  }
  
  console.log('🎉 All splash screens created successfully!');
}

createSplash().catch(console.error);
