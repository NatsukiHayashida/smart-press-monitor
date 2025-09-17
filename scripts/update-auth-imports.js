const fs = require('fs');
const path = require('path');

const files = [
  'press-machine-web/src/app/machines/[id]/edit/page.tsx',
  'press-machine-web/src/components/machines/MachineFormExpanded.tsx',
  'press-machine-web/src/components/maintenance/MaintenanceForm.tsx',
  'press-machine-web/src/components/machines/MachineForm.tsx',
  'press-machine-web/src/app/machines/[id]/page.tsx',
  'press-machine-web/src/app/maintenance/page.tsx',
  'press-machine-web/src/app/machines/page.tsx',
  'press-machine-web/src/app/page.tsx',
  'press-machine-web/src/app/analytics/page.tsx',
  'press-machine-web/src/app/machines/[id]/page-debug.tsx',
  'press-machine-web/src/components/layout/Header.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const updated = content.replace(
      "import { useAuth } from '@/components/auth/AuthProvider-minimal'",
      "import { useAuth } from '@/components/auth/AuthProvider'"
    );
    
    if (content !== updated) {
      fs.writeFileSync(filePath, updated);
      console.log(`Updated: ${file}`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log('Import updates complete!');