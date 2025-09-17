-- サンプルデータ挿入
-- デフォルト組織ID
INSERT INTO profiles (user_id, org_id, email, full_name, created_at) VALUES 
('clerk_test_user', 'c897453e-14c7-4335-bdb4-91978778d95b', 'test@example.com', 'テストユーザー', NOW())
ON CONFLICT (user_id) DO NOTHING;

-- サンプルプレス機データ
INSERT INTO press_machines (
  org_id, machine_number, machine_type, installation_date, location, 
  manufacturer, model, capacity_tons, created_at
) VALUES 
('c897453e-14c7-4335-bdb4-91978778d95b', 'P001', '小型プレス', '2023-01-15', 'A工場', 'アマダ', 'TP-110', 110, NOW()),
('c897453e-14c7-4335-bdb4-91978778d95b', 'P002', '中型プレス', '2023-02-20', 'A工場', 'コマツ', 'H1F-250', 250, NOW()),
('c897453e-14c7-4335-bdb4-91978778d95b', 'P003', '大型プレス', '2023-03-10', 'B工場', 'アイダ', 'DSF-N2-300', 300, NOW())
ON CONFLICT (machine_number, org_id) DO NOTHING;

-- サンプルメンテナンス記録
INSERT INTO maintenance_records (
  press_id, org_id, maintenance_date, maintenance_type, overall_judgment,
  details, next_maintenance_date, created_at
) VALUES 
(1, 'c897453e-14c7-4335-bdb4-91978778d95b', '2024-01-15', '定期点検', 'A:良好', '正常動作確認済み', '2024-04-15', NOW()),
(2, 'c897453e-14c7-4335-bdb4-91978778d95b', '2024-01-20', '修理', 'B:一部修理', '油圧シリンダー交換', '2024-03-20', NOW()),
(3, 'c897453e-14c7-4335-bdb4-91978778d95b', '2024-01-25', '定期点検', 'A:良好', '全システム正常', '2024-04-25', NOW());

-- 確認用クエリ
SELECT 'プレス機台数' as type, COUNT(*) as count FROM press_machines WHERE org_id = 'c897453e-14c7-4335-bdb4-91978778d95b'
UNION ALL
SELECT 'メンテナンス記録数' as type, COUNT(*) as count FROM maintenance_records WHERE org_id = 'c897453e-14c7-4335-bdb4-91978778d95b';