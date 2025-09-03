import sqlite3
import os
from datetime import datetime

def create_database():
    # データベース接続
    conn = sqlite3.connect('press_machine.db')
    cursor = conn.cursor()
    
    try:
        # プレス機マスタテーブル作成
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS press_machines (
            db_id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_number TEXT NOT NULL,
            equipment_number TEXT,
            manufacturer TEXT,
            model_type TEXT,
            serial_number TEXT,
            machine_type TEXT CHECK (machine_type IN ('圧造', '汎用')),
            production_group INTEGER CHECK (production_group IN (1, 2, 3)),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # メンテナンス記録テーブル作成
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS maintenance_records (
            maintenance_id INTEGER PRIMARY KEY AUTOINCREMENT,
            db_id INTEGER NOT NULL,
            maintenance_datetime DATETIME NOT NULL,
            overall_judgment TEXT,
            clutch_valve_replacement TEXT,
            brake_valve_replacement TEXT,
            remarks TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (db_id) REFERENCES press_machines(db_id)
        )
        ''')
        
        print("テーブル作成完了")
        
        # サンプルデータ投入
        # プレス機マスタのサンプルデータ
        press_data = [
            ('P001', 'EQ-001', 'アイダエンジニアリング', 'NC1-110', 'S20240001', '圧造', 1),
            ('P002', 'EQ-002', 'コマツ産機', 'H2F-110', 'S20240002', '汎用', 1),
            ('P003', 'EQ-003', 'アミノ', 'AP-200', 'S20240003', '圧造', 2),
            ('P004', 'EQ-004', 'ヤマダドビー', 'TPE-100', 'S20240004', '汎用', 2),
            ('P005', 'EQ-005', 'アイダエンジニアリング', 'NC1-200', 'S20240005', '圧造', 3)
        ]
        
        cursor.executemany('''
        INSERT INTO press_machines 
        (machine_number, equipment_number, manufacturer, model_type, serial_number, machine_type, production_group) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', press_data)
        
        print("プレス機マスタデータ投入完了")
        
        # メンテナンス記録のサンプルデータ
        maintenance_data = [
            (1, '2024-01-15 09:00:00', '良好', '未実施', '未実施', '定期点検実施。異常なし。'),
            (1, '2024-04-15 10:30:00', '良好', '実施', '未実施', 'クラッチ電磁弁を予防交換。'),
            (2, '2024-01-20 14:00:00', '要注意', '未実施', '実施', 'ブレーキ応答が遅い。電磁弁交換済み。'),
            (2, '2024-07-20 11:15:00', '良好', '未実施', '未実施', 'ブレーキ電磁弁交換後の確認。正常動作。'),
            (3, '2024-02-10 08:45:00', '良好', '未実施', '未実施', '月次定期点検。潤滑油補充。'),
            (4, '2024-03-05 16:20:00', '要修理', '実施', '実施', 'クラッチ・ブレーキ両方の電磁弁に不具合。交換実施。'),
            (5, '2024-01-25 13:30:00', '良好', '未実施', '未実施', '新規導入機の初回点検。問題なし。')
        ]
        
        cursor.executemany('''
        INSERT INTO maintenance_records 
        (db_id, maintenance_datetime, overall_judgment, clutch_valve_replacement, brake_valve_replacement, remarks) 
        VALUES (?, ?, ?, ?, ?, ?)
        ''', maintenance_data)
        
        print("メンテナンス記録データ投入完了")
        
        # 変更をコミット
        conn.commit()
        
        # データ確認
        cursor.execute("SELECT COUNT(*) FROM press_machines")
        press_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM maintenance_records")
        maintenance_count = cursor.fetchone()[0]
        
        print(f"\n=== データベース作成完了 ===")
        print(f"データベースファイル: {os.path.abspath('press_machine.db')}")
        print(f"プレス機マスタ: {press_count}件")
        print(f"メンテナンス記録: {maintenance_count}件")
        
        # テーブル構造表示
        print(f"\n=== プレス機マスタテーブル構造 ===")
        cursor.execute("PRAGMA table_info(press_machines)")
        for column in cursor.fetchall():
            print(f"  {column[1]}: {column[2]}")
            
        print(f"\n=== メンテナンス記録テーブル構造 ===")
        cursor.execute("PRAGMA table_info(maintenance_records)")
        for column in cursor.fetchall():
            print(f"  {column[1]}: {column[2]}")
            
    except sqlite3.Error as e:
        print(f"エラー: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    create_database()