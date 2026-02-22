const fs = require('fs');

const content = fs.readFileSync('F:/xknowledge/xknowledge/task.md', 'utf-8');
const lines = content.split('\n');

const tasks = [];
let currentPhase = '';
let currentPriority = 'medium';

const phaseRegex = /^##\s+(.+?)(?:\s*\((P\d).*?\))?$/;
const subPhaseRegex = /^###\s+(.+)$/;
// Matches lines like:
// * [ ] **Task 6: 媒体资源本地化与 ZIP 导出方案 (1.5h)**
// * [ ] Task 15: 拦截并缓存原图 (Blob) 至 IndexedDB。
const taskRegex = /^\*\s+\[ \]\s+(?:\*\*Task|Task)\s+(\d+):\s+(.*?)(?:\*\*|)$/;

for (const line of lines) {
  const lineTrimmed = line.trim();
  const phaseMatch = lineTrimmed.match(phaseRegex);
  if (phaseMatch) {
    currentPhase = phaseMatch[1].trim();
    if (phaseMatch[2] === 'P0' || phaseMatch[2] === 'P1') currentPriority = 'high';
    else if (phaseMatch[2] === 'P2') currentPriority = 'medium';
    else if (phaseMatch[2] === 'P3' || currentPhase.includes('P3')) currentPriority = 'low';
    continue;
  }
  
  const subPhaseMatch = lineTrimmed.match(subPhaseRegex);
  if (subPhaseMatch) {
    currentPhase = subPhaseMatch[1].trim();
    currentPriority = 'medium';
    continue;
  }
  
  const taskMatch = lineTrimmed.match(taskRegex);
  if (taskMatch) {
    const id = taskMatch[1];
    let title = taskMatch[2];
    
    // Clean up title (remove trailing ** and time estimates)
    title = title.replace(/\*\*/g, '').replace(/\s*\([\d.]+h\)$/, '').trim();
    
    tasks.push({
      id: id,
      title: title,
      phase: currentPhase,
      priority: currentPriority,
      status: 'pending'
    });
  }
}

const dir = 'F:/xknowledge/xknowledge/.loki/queue';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(`${dir}/pending.json`, JSON.stringify(tasks, null, 2));
console.log(`Successfully extracted ${tasks.length} tasks.`);
