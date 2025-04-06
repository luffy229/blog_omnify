// This file runs when Vercel builds the project
const { execSync } = require('child_process');

// Build the client
console.log('Building React client...');
execSync('cd client && npm install && npm run build', { stdio: 'inherit' });

console.log('Build completed successfully!'); 