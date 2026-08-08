const fs = require('fs');
const path = require('path');

const srcDirs = ['css', 'js', 'assets'];
const srcFiles = ['index.html'];
const destDir = path.join(__dirname, 'www');

// Create www directory
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy files
for (const file of srcFiles) {
  const src = path.join(__dirname, file);
  const dest = path.join(destDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

// Copy directories recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

for (const dir of srcDirs) {
  const src = path.join(__dirname, dir);
  const dest = path.join(destDir, dir);
  if (fs.existsSync(src)) {
    copyDir(src, dest);
  }
}

console.log('✓ Cross-platform web build complete in www/');
