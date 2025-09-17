# Smart Press Monitor - ファイル整理

## 🚀 GitHub にプッシュするファイル

### 📱 Webアプリケーション
```
press-machine-web/          # Next.js Webアプリ（メイン成果物）
├── src/
├── public/
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

### 🐍 Pythonデスクトップアプリ（保持）
```
press_machine_app.py        # メインのデスクトップアプリ
setup_database.py          # データベース初期化
```

### 📋 ドキュメント
```
CURRENT_SPECIFICATION.md   # 現在の仕様書
TECHNICAL_DETAILS.md       # 技術詳細
COLLABORATION_CONTEXT.md   # 開発コンテキスト
SUPABASE_MCP_SETUP.md     # MCP設定手順
SUPABASE_SETUP.md         # Supabase設定手順
```

### 🗄️ データベース設定（参考用）
```
supabase_schema.sql        # 最終的なスキーマ
```

---

## 🗑️ 削除対象ファイル（テスト・一時ファイル）

### テストスクリプト
```
check_database.py          # デバッグ用
simple_check.py            # テスト用
test_data_after_fix.js     # テスト用
fix_database.js            # 一時修正スクリプト
fix_database.py            # 一時修正スクリプト
fix_via_api.py             # 一時修正スクリプト
```

### 中間SQLファイル
```
add_unique_constraint.sql
create_maintenance.sql
create_org.sql
create_orgs_only.sql
create_press_machines.sql
create_press_machines_safe.sql
create_profiles.sql
fix_database.sql
fix_org_id_mismatch.sql
test_basic.sql
supabase_setup_step1.sql
supabase_setup_step2.sql
supabase_setup_step3.sql
supabase_setup_step4.sql
```

### CSVファイル（中間データ）
```
press_machines.csv
press_machines_fixed.csv
press_machines_supabase.csv
maintenance_records.csv
maintenance_records_fixed.csv
maintenance_records_supabase.csv
```

### データインポートスクリプト（一時）
```
import_excel_data.py
import_new_data_part1.py
import_new_data_part2.py
prepare_supabase_data.py
export_to_csv.py
fix_csv_orgid.py
```

### 設定・一時ファイル
```
press_machine.db          # SQLiteファイル（開発時のみ）
mcp_config.json           # 認証情報含む（危険）
supabase_connection_info.txt  # 認証情報含む（危険）
nul                       # 空ファイル
```

---

## ⚠️ 重要注意事項

### 🔒 絶対にプッシュしてはいけないファイル
- **mcp_config.json** - データベースパスワード含む
- **supabase_connection_info.txt** - 認証キー含む
- **press-machine-web/.env.local** - API キー含む

### 📝 .gitignore に追加すべき項目
```
# 認証情報
mcp_config.json
supabase_connection_info.txt
*.env.local

# データベース
*.db

# テンポラリ
nul
test_*
fix_*
```