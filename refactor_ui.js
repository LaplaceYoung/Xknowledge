const fs = require('fs');

function replaceClasses(content) {
  return content
    // Backgrounds
    .replace(/bg-gray-50/g, 'bg-x-bg')
    .replace(/bg-white/g, 'bg-x-bg')
    .replace(/hover:bg-gray-100/g, 'hover:bg-x-bgHover')
    .replace(/bg-gray-100/g, 'bg-x-bgHover')
    .replace(/hover:bg-gray-200/g, 'hover:bg-x-border')
    
    // Text
    .replace(/text-gray-900/g, 'text-x-text')
    .replace(/text-gray-800/g, 'text-x-text')
    .replace(/text-gray-700/g, 'text-x-text')
    .replace(/text-gray-600/g, 'text-x-textMuted')
    .replace(/text-gray-500/g, 'text-x-textMuted')
    .replace(/text-gray-400/g, 'text-x-textMuted')
    
    // Borders
    .replace(/border-gray-200/g, 'border-x-border')
    .replace(/border-gray-300/g, 'border-x-border')
    .replace(/border-gray-100/g, 'border-x-border')
    
    // Primary (Buttons, Links)
    .replace(/text-blue-600/g, 'text-x-primary')
    .replace(/text-blue-500/g, 'text-x-primary')
    .replace(/text-blue-700/g, 'text-x-primaryHover')
    .replace(/hover:text-blue-800/g, 'hover:text-x-primaryHover')
    .replace(/hover:text-blue-700/g, 'hover:text-x-primaryHover')
    .replace(/bg-blue-600/g, 'bg-x-primary')
    .replace(/hover:bg-blue-700/g, 'hover:bg-x-primaryHover')
    .replace(/bg-blue-50/g, 'bg-x-primary/10')
    .replace(/border-blue-500/g, 'border-x-primary')
    .replace(/ring-blue-200/g, 'ring-x-primary/30')
    
    // Purple (AI actions) -> Primary for consistency, or keep purple? X uses primary blue mostly, but purple is okay for AI. Let's make it X primary for consistency.
    .replace(/text-purple-600/g, 'text-x-primary')
    .replace(/text-purple-500/g, 'text-x-primary')
    .replace(/text-purple-400/g, 'text-x-primary/70')
    .replace(/hover:text-purple-800/g, 'hover:text-x-primaryHover')
    .replace(/bg-purple-50/g, 'bg-x-primary/10')
    .replace(/hover:bg-purple-100/g, 'hover:bg-x-primary/20')
    .replace(/bg-purple-100/g, 'bg-x-primary/20')
    
    // Red (Destructive) - keep red but adapt slightly for dark mode if needed (standard tailwind red is okay)
    
    // Border Radius
    .replace(/rounded-lg/g, 'rounded-x-card')
    .replace(/rounded/g, 'rounded-x-button');
}

const appPath = 'x-knowledge-extension/src/App.tsx';
let appContent = fs.readFileSync(appPath, 'utf8');
appContent = replaceClasses(appContent);
// Fix the rounded-x-button-full / rounded-x-button-x-button bugs
appContent = appContent.replace(/rounded-x-button-full/g, 'rounded-full')
appContent = appContent.replace(/rounded-x-card/g, 'rounded-2xl') // X cards use 16px (2xl)
appContent = appContent.replace(/rounded-x-button/g, 'rounded-full') // X buttons use full radius
fs.writeFileSync(appPath, appContent);

const onboardingPath = 'x-knowledge-extension/src/components/Onboarding.tsx';
let onboardingContent = fs.readFileSync(onboardingPath, 'utf8');
onboardingContent = replaceClasses(onboardingContent);
onboardingContent = onboardingContent.replace(/rounded-x-button-full/g, 'rounded-full')
onboardingContent = onboardingContent.replace(/rounded-x-card/g, 'rounded-2xl')
onboardingContent = onboardingContent.replace(/rounded-x-button/g, 'rounded-full')
fs.writeFileSync(onboardingPath, onboardingContent);

console.log('UI refactored for X Native Style');
