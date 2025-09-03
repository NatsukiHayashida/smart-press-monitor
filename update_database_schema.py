#!/usr/bin/env python3
"""
データベーススキーマ更新スクリプト
プレス機テーブルに詳細仕様カラムを追加
"""
import os
import psycopg2
from urllib.parse import urlparse

# Supabase接続情報（実際の値は環境変数から取得）
SUPABASE_URL = "https://qlsntrswoaxdwrtobunw.supabase.co"

# PostgreSQL接続URL構築 (実際のパスワードが必要)
# データベース直接接続のためのパスワードはSupabaseダッシュボードで確認が必要
print("WARNING: この方法ではSupabaseに直接接続できません。")
print("代替方法:")
print("1. Supabaseダッシュボードの SQL Editor で手動実行")
print("2. または supabase CLI を使用")
print()
print("以下のSQLを Supabase > SQL Editor にコピーして実行してください:")
print("="*60)

# SQLファイルの内容を読み取って表示
sql_file = "add_detailed_specifications.sql"
if os.path.exists(sql_file):
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    print(sql_content)
else:
    print(f"SQLファイル '{sql_file}' が見つかりません")
    
print("="*60)
print()
print("手順:")
print("1. https://supabase.com/dashboard/project/qlsntrswoaxdwrtobunw にアクセス")
print("2. 左側メニューから 'SQL Editor' を選択")
print("3. 上記のSQLをコピーして実行")
print("4. スキーマ更新完了後、サンプルデータを挿入")