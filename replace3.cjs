const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace text-[10px] with text-xs
content = content.replace(/text-\[10px\]/g, 'text-xs');

// Replace rounded-[2rem] with rounded-3xl
content = content.replace(/rounded-\[2rem\]/g, 'rounded-3xl');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replacements complete.');
