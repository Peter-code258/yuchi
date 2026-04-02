const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace text-[8px] with text-[10px]
content = content.replace(/text-\[8px\]/g, 'text-[10px]');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replacements complete.');
