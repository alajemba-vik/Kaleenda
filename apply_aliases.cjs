const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  content = content.replace(/(from|import) ['"](\.\.\/[^'"]+)['"]/g, (match, type, relPath) => {
    const absoluteImportPath = path.resolve(path.dirname(filePath), relPath);
    const srcDir = path.resolve(__dirname, 'src');

    if (absoluteImportPath.startsWith(srcDir)) {
      const aliasPath = '@/' + path.relative(srcDir, absoluteImportPath).replace(/\\/g, '/');
      return `${type} '${aliasPath}'`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

processDirectory('./src');
