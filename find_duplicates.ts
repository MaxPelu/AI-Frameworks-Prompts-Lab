import fs from 'fs';
import path from 'path';

const configDir = path.join(process.cwd(), 'src', 'config');
const files = fs.readdirSync(configDir).filter(f => f.endsWith('.ts'));

const idMap = new Map<string, string[]>();

for (const file of files) {
  const content = fs.readFileSync(path.join(configDir, file), 'utf-8');
  const regex = /id:\s*'([^']+)'/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const id = match[1];
    if (!idMap.has(id)) {
      idMap.set(id, []);
    }
    idMap.get(id)!.push(file);
  }
}

let foundDuplicates = false;
for (const [id, occurrences] of idMap.entries()) {
  if (occurrences.length > 1) {
    console.log(`Duplicate ID: ${id} found in: ${occurrences.join(', ')}`);
    foundDuplicates = true;
  }
}

if (!foundDuplicates) {
  console.log('No duplicate IDs found.');
}
