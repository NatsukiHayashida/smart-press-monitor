-- PostgreSQLシーケンスをリセットするスクリプト
-- press_machinesテーブルのid自動採番が同期していない場合に実行

-- シーケンスを現在の最大ID+1にリセット
SELECT setval('press_machines_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM press_machines), false);

-- 確認（次に生成されるIDが表示される）
SELECT last_value FROM press_machines_id_seq;

-- 現在のpress_machinesテーブルの最大IDを確認
SELECT MAX(id) as current_max_id FROM press_machines;
