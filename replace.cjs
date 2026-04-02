const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace rounded-[3rem] and rounded-[2.5rem] with rounded-3xl
content = content.replace(/rounded-\[3rem\]/g, 'rounded-3xl');
content = content.replace(/rounded-\[2\.5rem\]/g, 'rounded-3xl');

// Replace text-[10px] with text-xs
content = content.replace(/text-\[10px\]/g, 'text-xs');

// Replace font-black with font-bold
content = content.replace(/font-black/g, 'font-bold');

// Replace tracking-[0.3em] with tracking-widest
content = content.replace(/tracking-\[0\.3em\]/g, 'tracking-widest');

// Replace tracking-[0.2em] with tracking-wider
content = content.replace(/tracking-\[0\.2em\]/g, 'tracking-wider');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replacements complete.');
