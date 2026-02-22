import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/icon.svg');
const sizes = [16, 48, 128];

async function generateIcons() {
    try {
        const svgBuffer = fs.readFileSync(svgPath);

        for (const size of sizes) {
            const outputPath = path.resolve(`public/icon-${size}.png`);
            await sharp(svgBuffer)
                .resize(size, size)
                .png()
                .toFile(outputPath);
            console.log(`Generated ${size}x${size} icon at ${outputPath}`);
        }
    } catch (error) {
        console.error('Error generating icons:', error);
    }
}

generateIcons();
