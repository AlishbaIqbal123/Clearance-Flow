import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'dist');
const destDir = path.join(__dirname, '../public');

try {
  // Clean/remove destination directory if it exists to ensure a clean build
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }

  // Create destination directory
  fs.mkdirSync(destDir, { recursive: true });

  // Copy contents of dist to ../public
  fs.cpSync(srcDir, destDir, { recursive: true, force: true });
  console.log('Postbuild: Successfully copied dist folder contents to ../public.');
} catch (err) {
  console.error('Postbuild failed:', err);
  process.exit(1);
}
