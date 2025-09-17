const fs = require('fs');
const path = require('path');

// ファイルパスのリスト
const files = [
  'press-machine-web/src/app/machines/[id]/page.tsx',
  'press-machine-web/src/app/maintenance/new/page.tsx',
  'press-machine-web/src/components/maintenance/MaintenanceForm.tsx',
  'press-machine-web/src/components/machines/MachineFormExpanded.tsx',
  'press-machine-web/src/components/machines/MachineForm.tsx',
  'press-machine-web/src/app/maintenance/[id]/edit/page.tsx',
  'press-machine-web/src/app/machines/[id]/edit/page.tsx',
  'press-machine-web/src/app/maintenance/[id]/page.tsx',
  'press-machine-web/src/app/analytics/page.tsx',
  'press-machine-web/src/app/maintenance/page.tsx',
  'press-machine-web/src/app/machines/page.tsx',
  'press-machine-web/src/lib/supabase/client.ts',
  'press-machine-web/src/app/page.tsx'
];

files.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);

  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf-8');

    // supabase-clerkを標準のクライアントに置換
    content = content.replace(
      /from ['"]@\/lib\/supabase-clerk['"]/g,
      "from '@/lib/supabase/client'"
    );

    // useSupabaseClientをcreateClientに変更
    content = content.replace(
      /import\s*{\s*useSupabaseClient\s*}\s*from/g,
      "import { createClient } from"
    );

    // 関数呼び出しの置換
    content = content.replace(
      /const\s+supabase\s*=\s*useSupabaseClient\(\)/g,
      "const supabase = createClient()"
    );

    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`⚠️ File not found: ${filePath}`);
  }
});

console.log('Done!');