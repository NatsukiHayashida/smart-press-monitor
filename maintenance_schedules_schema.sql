-- メンテナンス予定管理テーブル
CREATE TABLE maintenance_schedules (
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
  CONSTRAINT valid_priority CHECK (priority IN ('high', 'normal', 'low'))
);

-- インデックス
CREATE INDEX idx_maintenance_schedules_org_id ON maintenance_schedules(org_id);
CREATE INDEX idx_maintenance_schedules_press_id ON maintenance_schedules(press_id);
CREATE INDEX idx_maintenance_schedules_scheduled_date ON maintenance_schedules(scheduled_date);
CREATE INDEX idx_maintenance_schedules_status ON maintenance_schedules(status);

-- RLS (Row Level Security) ポリシー
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;

-- 組織内のユーザーのみアクセス可能
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