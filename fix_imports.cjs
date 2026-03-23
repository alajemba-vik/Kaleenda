const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

function processDirectory(dir, replacements) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath, replacements);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath, replacements);
    }
  }
}

processDirectory('./src', [
  [/from '(\.\.\/\.\.\/\.\.)\/lib\/types'/g, "from '$1/types'"],
  [/from '(\.\.\/\.\.)\/lib\/types'/g, "from '$1/types'"],
  [/from '(\.\.)\/lib\/types'/g, "from '$1/types'"],
  [/from '\.\.\/\.\.\/lib\/calendarGrid'/g, "from '../../calendar'"], // MiniCalendarPreview importing calendarGrid
  [/from '\.\.\/\.\.\/\.\.\/lib\/calendarGrid'/g, "from '../../calendar'"],
  [/from '\.\.\/lib\/types'/g, "from '../types'"],
]);
