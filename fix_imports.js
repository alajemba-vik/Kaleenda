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

// Fixes for features/calendar/components
processDirectory('./src/features/calendar/components', [
  [/from '\.\.\/lib\//g, "from '../../../lib/"],
  [/from '\.\.\/hooks\//g, "from '../../hooks/"],
  [/from '\.\/PlushieCharacter'/g, "from '../../../marketing/components/PlushieCharacter'"],
]);

// Fixes for features/calendar/hooks
processDirectory('./src/features/calendar/hooks', [
  [/from '\.\.\/lib\//g, "from '../../../lib/"],
]);

// Fixes for features/marketing/components
processDirectory('./src/features/marketing/components', [
  [/from '\.\.\/lib\//g, "from '../../../lib/"],
]);

// Fixes for lib
processDirectory('./src/lib', [
  [/from '\.\/types'/g, "from '../types/index'"], 
]);

// Fixes for pages
processDirectory('./src/pages', [
  [/from '\.\.\/components\/illustrations\/JoinFrog'/g, "from '../features/marketing/components/illustrations/JoinFrog'"],
  [/from '\.\.\/components\/illustrations\/CreateMascot'/g, "from '../features/marketing/components/illustrations/CreateMascot'"],
  [/from '\.\.\/components\/(MiniCalendarPreview|ComparisonSection|PlushieCharacter|MarketingChrome|HowItWorks|FinalCTA)'/g, "from '../features/marketing'"],
  [/from '\.\.\/components\/(MonthCalendar|AddEventPanel|CalendarHeader|CalendarSidebar|EventDetailModal|ManageCodesModal|WelcomeCodes|CodeEntry)'/g, "from '../features/calendar'"],
  [/from '\.\.\/hooks\/(useCalendarSession|useCalendarSync)'/g, "from '../features/calendar'"],
  [/from '\.\.\/lib\/calendarGrid'/g, "from '../features/calendar'"],
]);

// Also need to fix implicit any errors in typescript for variables that were using types from lib/types
