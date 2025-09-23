-- パフォーマンス向上のためのインデックス作成
-- 頻繁にアクセスされるカラムにインデックスを追加

-- ===========================
-- プレス機テーブルのインデックス
-- ===========================

-- org_id単体インデックス（最も頻繁に使用）
CREATE INDEX IF NOT EXISTS idx_press_machines_org
ON press_machines (org_id);

-- org_idと機械種別の複合インデックス（種別別集計用）
CREATE INDEX IF NOT EXISTS idx_press_machines_org_type
ON press_machines (org_id, machine_type);

-- org_idと生産グループの複合インデックス（グループ別集計用）
CREATE INDEX IF NOT EXISTS idx_press_machines_org_group
ON press_machines (org_id, production_group);

-- 機械番号での検索用（一意性確保も兼ねる）
CREATE INDEX IF NOT EXISTS idx_press_machines_machine_number
ON press_machines (machine_number);

-- ===========================
-- メンテナンス記録テーブルのインデックス
-- ===========================

-- org_id単体インデックス（基本的なフィルタリング）
CREATE INDEX IF NOT EXISTS idx_maintenance_records_org
ON maintenance_records (org_id);

-- org_idとメンテナンス日の複合インデックス（最新順ソート用）
CREATE INDEX IF NOT EXISTS idx_maintenance_records_org_date
ON maintenance_records (org_id, maintenance_date DESC);

-- プレス機IDインデックス（JOIN高速化）
CREATE INDEX IF NOT EXISTS idx_maintenance_records_press_id
ON maintenance_records (press_id);

-- 総合判定での検索用
CREATE INDEX IF NOT EXISTS idx_maintenance_records_judgment
ON maintenance_records (overall_judgment);

-- ===========================
-- プロファイルテーブルのインデックス
-- ===========================

-- ユーザーIDインデックス（認証時の高速アクセス）
CREATE INDEX IF NOT EXISTS idx_profiles_user_id
ON profiles (user_id);

-- org_idインデックス（組織別ユーザー取得）
CREATE INDEX IF NOT EXISTS idx_profiles_org_id
ON profiles (org_id);

-- ===========================
-- 統計情報の更新（定期的に実行推奨）
-- ===========================
-- ANALYZE press_machines;
-- ANALYZE maintenance_records;
-- ANALYZE profiles;