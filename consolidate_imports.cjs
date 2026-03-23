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

// Convert deep imports to index imports for calendar
const calendarImports = [
  'useCalendarSession', 'useCalendarSync',
  'AddEventPanel', 'CalendarHeader', 'CalendarSidebar',
  'CodeEntry', 'EventDetailModal', 'ManageCodesModal',
  'filterEventsForMonth', 'MonthCalendar', 'WelcomeCodes', 'addMonths'
];

// Convert deep imports to index imports for marketing
const marketingImports = [
  'MiniCalendarPreview', 'ComparisonSection', 'PlushieCharacter',
  'MarketingChrome', 'HowItWorks', 'FinalCTA', 'JoinFrog', 'CreateMascot'
];

processDirectory('./src/pages', [
  [/import \{([^}]+)\} from '\.\.\/features\/calendar\/(?:components|hooks|utils)\/[^']+'/g, (match, p1) => {
    return `import { ${p1.trim()} } from '../features/calendar'`;
  }],
  [/import \{([^}]+)\} from '\.\.\/features\/marketing\/(?:components|hooks|utils)[^']*'/g, (match, p1) => {
    return `import { ${p1.trim()} } from '../features/marketing'`;
  }],
]);
