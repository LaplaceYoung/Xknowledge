const fs = require('fs');

function fix(path) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/rounded-full-xl/g, 'rounded-2xl');
  content = content.replace(/rounded-full-x-card/g, 'rounded-2xl');
  content = content.replace(/rounded-full-lg/g, 'rounded-2xl');
  content = content.replace(/rounded-full-md/g, 'rounded-xl');
  fs.writeFileSync(path, content);
}

fix('x-knowledge-extension/src/App.tsx');
fix('x-knowledge-extension/src/components/Onboarding.tsx');
console.log('Fixed rounded classes');
