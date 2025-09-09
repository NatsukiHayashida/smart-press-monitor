-- Supabase用 メンテナンス予定管理テーブル作成スクリプト
-- 注意: このスクリプトはSupabaseコンソールのSQLエディタで実行してください

-- メンテナンス予定管理テーブル
CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id SERIAL PRIMARY KEY,
  press_id INTEGER NOT NULL REFERENCES press_machines(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  
  -- 予定情報
  scheduled_date DATE NOT NULL,
  maintenance_type VARCHAR(100) DEFAULT 'routine', -- routine, repair, inspection, etc.
  priority VARCHAR(20) DEFAULT 'normal', -- high, normal, low
  
  -- 予定内容
  planned_work TEXT,
  estimated_duration INTEGER, -- 予定時間（分）
  assigned_technician VARCHAR(100),
  
  -- ステータス管理
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_maintenance_record_id INTEGER REFERENCES maintenance_records(id),
  
  -- メタデータ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- 制約
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  CONSTRAINT valid_priority CHECK (priority IN ('high', 'normal', 'low')),
  CONSTRAINT valid_maintenance_type CHECK (maintenance_type IN ('routine', 'inspection', 'repair', 'overhaul', 'emergency', 'preventive'))
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_org_id ON maintenance_schedules(org_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_press_id ON maintenance_schedules(press_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_scheduled_date ON maintenance_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_status ON maintenance_schedules(status);

-- RLS (Row Level Security) 有効化
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 組織内のユーザーのみアクセス可能
CREATE POLICY "Users can view org schedules" ON maintenance_schedules
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert org schedules" ON maintenance_schedules
    FOR INSERT WITH CHECK (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update org schedules" ON maintenance_schedules
    FOR UPDATE USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete org schedules" ON maintenance_schedules
    FOR DELETE USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- トリガー：updated_at の自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_maintenance_schedules_updated_at 
    BEFORE UPDATE ON maintenance_schedules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータ（オプション）
-- 注意: 実際のpress_machines.idとorg_idに合わせて調整してください
/*
INSERT INTO maintenance_schedules (
    press_id,
    org_id, 
    scheduled_date,
    maintenance_type,
    priority,
    planned_work,
    estimated_duration,
    assigned_technician,
    status
) VALUES 
(1, '5aa33531-921a-4425-a235-770ed1f524c5', '2025-01-15', 'routine', 'normal', '定期点検とクラッチバルブ交換', 120, '田中技師', 'scheduled'),
(2, '5aa33531-921a-4425-a235-770ed1f524c5', '2025-01-20', 'inspection', 'high', 'ブレーキシステム精密点検', 180, '佐藤技師', 'scheduled'),
(1, '5aa33531-921a-4425-a235-770ed1f524c5', '2025-01-10', 'repair', 'high', '異音の原因調査と修理', 240, '山田技師', 'in_progress');
*/