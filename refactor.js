const fs = require('fs');
const path = require('path');

const directories = ['app', 'components'];
const fileExtensions = ['.jsx', '.js', '.tsx', '.ts'];

const replacements = [
    // Backgrounds
    { regex: /\bbg-white\b/g, replacement: 'bg-card' },
    { regex: /\bbg-slate-50\/?[0-9]*\b/g, replacement: 'bg-background' },
    { regex: /\bbg-slate-100\b/g, replacement: 'bg-muted' },
    { regex: /\bbg-slate-200\b/g, replacement: 'bg-muted' },
    { regex: /\bbg-slate-800\b/g, replacement: 'bg-primary' },
    { regex: /\bbg-slate-900\b/g, replacement: 'bg-primary' },
    { regex: /\bbg-slate-850\b/g, replacement: 'bg-primary' },
    
    // Text
    { regex: /\btext-slate-800\b/g, replacement: 'text-foreground' },
    { regex: /\btext-slate-805\b/g, replacement: 'text-foreground' },
    { regex: /\btext-slate-900\b/g, replacement: 'text-foreground' },
    { regex: /\btext-slate-700\b/g, replacement: 'text-foreground' },
    { regex: /\btext-slate-650\b/g, replacement: 'text-foreground' },
    { regex: /\btext-slate-600\b/g, replacement: 'text-muted-foreground' },
    { regex: /\btext-slate-500\b/g, replacement: 'text-muted-foreground' },
    { regex: /\btext-slate-455\b/g, replacement: 'text-muted-foreground' },
    { regex: /\btext-slate-450\b/g, replacement: 'text-muted-foreground' },
    { regex: /\btext-slate-400\b/g, replacement: 'text-muted-foreground' },
    { regex: /\btext-white\b/g, replacement: 'text-primary-foreground' },
    
    // Borders
    { regex: /\bborder-slate-100\b/g, replacement: 'border-border' },
    { regex: /\bborder-slate-150\b/g, replacement: 'border-border' },
    { regex: /\bborder-slate-200\b/g, replacement: 'border-border' },
    { regex: /\bborder-slate-250\b/g, replacement: 'border-border' },
    { regex: /\bborder-slate-300\b/g, replacement: 'border-border' },
    { regex: /\bborder-slate-350\b/g, replacement: 'border-border' },
    
    // Primary Color Replacements (Indigo/Green)
    { regex: /\btext-indigo-[456]00\b/g, replacement: 'text-primary' },
    { regex: /\btext-green-[456]00\b/g, replacement: 'text-primary' },
    { regex: /\bbg-indigo-[456]00\b/g, replacement: 'bg-primary' },
    { regex: /\bbg-green-[456]00\b/g, replacement: 'bg-primary' },
    { regex: /\bborder-indigo-[456]00\b/g, replacement: 'border-primary' },
    { regex: /\bborder-green-[456]00\b/g, replacement: 'border-primary' },
    
    // Destructive Color Replacements (Red/Rose)
    { regex: /\btext-red-[456]00\b/g, replacement: 'text-destructive' },
    { regex: /\btext-rose-[456]00\b/g, replacement: 'text-destructive' },
    { regex: /\bbg-red-[456]00\b/g, replacement: 'bg-destructive' },
    { regex: /\bbg-rose-[456]00\b/g, replacement: 'bg-destructive' },
    { regex: /\bborder-red-[456]00\b/g, replacement: 'border-destructive' },
    { regex: /\bborder-rose-[456]00\b/g, replacement: 'border-destructive' }
];

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fileExtensions.includes(path.extname(fullPath))) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            replacements.forEach(({ regex, replacement }) => {
                if (regex.test(content)) {
                    content = content.replace(regex, replacement);
                    modified = true;
                }
            });

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Modified: ${fullPath}`);
            }
        }
    });
}

directories.forEach(dir => {
    const fullDirPath = path.join(__dirname, dir);
    if (fs.existsSync(fullDirPath)) {
        processDirectory(fullDirPath);
    }
});

console.log('Refactoring complete.');
