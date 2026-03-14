const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/hooks');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

for (const f of files) {
  const file = path.join(dir, f);
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('USE_MOCKS') || content.includes('import { useBackendStore }')) {
    // If it already contains import { useBackendStore } from the manual replacement, fix it
    content = content.replace(/const USE_MOCKS.*\n/, '');
    content = content.replace(/import \{ useBackendStore \}.*\n/, "import { useBackendStore } from '../store/backend';\nconst isOfflineOrMock = () => { const s = useBackendStore.getState(); return s.isMockMode || !s.isOnline; };\n");
    
    // Fallback if useBackendStore wasn't in there
    if (!content.includes('isOfflineOrMock')) {
        content = content.replace(/import api from '\.\.\/lib\/api';\n/, "import api from '../lib/api';\nimport { useBackendStore } from '../store/backend';\nconst isOfflineOrMock = () => { const s = useBackendStore.getState(); return s.isMockMode || !s.isOnline; };\n");
    }
    
    content = content.replace(/USE_MOCKS/g, 'isOfflineOrMock()');
    fs.writeFileSync(file, content);
  }
}
