-- シンプルなテーブル確認とRLS無効化

-- 1. 存在するテーブル一覧を確認
SELECT table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;