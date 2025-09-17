-- すべてのテーブルを作成するスクリプト
-- 順序: 依存関係を考慮してテーブル作成

-- 1. プロファイルテーブル
CREATE TABLE IF NOT EXISTS profiles (
  user_id VARCHAR(255) PRIMARY KEY,
  org_id UUID NOT NULL,
  email VARCHAR(255),
  full_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. プレス機テーブル
CREATE TABLE IF NOT EXISTS press_machines (
  id SERIAL PRIMARY KEY,
  org_id UUID NOT NULL,
  machine_number VARCHAR(50) NOT NULL,
  machine_type VARCHAR(100),
  installation_date DATE,
  location VARCHAR(100),
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  capacity_tons INTEGER,
  production_group VARCHAR(10),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 制約
  CONSTRAINT unique_machine_number_org UNIQUE (machine_number, org_id),
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'maintenance'))
);

-- 3. メンテナンス記録テーブル  
CREATE TABLE IF NOT EXISTS maintenance_records (
  id SERIAL PRIMARY KEY,
  press_id INTEGER NOT NULL REFERENCES press_machines(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  
  -- メンテナンス基本情報
  maintenance_date DATE NOT NULL,
  maintenance_type VARCHAR(50),
  overall_judgment VARCHAR(50),
  
  -- 詳細記録
  details TEXT,
  technician VARCHAR(100),
  duration_minutes INTEGER,
  
  -- 次回予定
  next_maintenance_date DATE,
  
  -- メタデータ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255)
);

-- 4. メンテナンス予定テーブル
CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id SERIAL PRIMARY KEY,
  press_id INTEGER NOT NULL REFERENCES press_machines(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  
  -- 予定情報
  scheduled_date DATE NOT NULL,
  maintenance_type VARCHAR(100) DEFAULT 'routine',
  priority VARCHAR(20) DEFAULT 'normal',
  
  -- 予定内容
  planned_work TEXT,
  estimated_duration INTEGER,
  assigned_technician VARCHAR(100),
  
  -- ステータス管理
  status VARCHAR(20) DEFAULT 'scheduled',
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_maintenance_record_id INTEGER REFERENCES maintenance_records(id),
  
  -- メタデータ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255),
  
  -- 制約
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  CONSTRAINT valid_priority CHECK (priority IN ('high', 'normal', 'low'))
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_press_machines_org_id ON press_machines(org_id);
CREATE INDEX IF NOT EXISTS idx_press_machines_machine_number ON press_machines(machine_number);

CREATE INDEX IF NOT EXISTS idx_maintenance_records_org_id ON maintenance_records(org_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_press_id ON maintenance_records(press_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_date ON maintenance_records(maintenance_date);

CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_org_id ON maintenance_schedules(org_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_press_id ON maintenance_schedules(press_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_scheduled_date ON maintenance_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_status ON maintenance_schedules(status);

-- トリガー関数（updated_at自動更新用）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの作成
DROP TRIGGER IF EXISTS update_press_machines_updated_at ON press_machines;
CREATE TRIGGER update_press_machines_updated_at 
    BEFORE UPDATE ON press_machines 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_maintenance_records_updated_at ON maintenance_records;
CREATE TRIGGER update_maintenance_records_updated_at 
    BEFORE UPDATE ON maintenance_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_maintenance_schedules_updated_at ON maintenance_schedules;
CREATE TRIGGER update_maintenance_schedules_updated_at 
    BEFORE UPDATE ON maintenance_schedules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 作成確認
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
    ) THEN '✓ 作成済み'
    ELSE '✗ 未作成'
  END as status
FROM (VALUES 
  ('profiles'),
  ('press_machines'),
  ('maintenance_records'),
  ('maintenance_schedules')
) AS t(table_name);