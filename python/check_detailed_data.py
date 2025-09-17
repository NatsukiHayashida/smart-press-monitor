#!/usr/bin/env python3
"""
Supabaseのpress_machinesテーブルの詳細データを確認するスクリプト
"""

import os
import json
from supabase import create_client, Client

def check_detailed_data():
    # 環境変数からSupabaseの設定を取得
    url = os.environ.get('SUPABASE_URL')
    key = os.environ.get('SUPABASE_ANON_KEY')
    
    if not url or not key:
        print("エラー: SUPABASE_URLまたはSUPABASE_ANON_KEYが設定されていません")
        print("環境変数を確認してください")
        return
    
    # Supabaseクライアントを作成
    supabase: Client = create_client(url, key)
    
    try:
        # press_machinesテーブルから全データを取得
        response = supabase.table('press_machines').select('*').execute()
        
        if response.data:
            print(f"=== プレス機データ一覧 ({len(response.data)}件) ===")
            
            for machine in response.data:
                print(f"\n--- 機械ID: {machine.get('id')}, 機械番号: {machine.get('machine_number')} ---")
                
                # 基本情報
                print("【基本情報】")
                print(f"  メーカー: {machine.get('maker') or machine.get('manufacturer') or '未設定'}")
                print(f"  型式: {machine.get('model') or machine.get('model_type') or '未設定'}")
                print(f"  製造番号: {machine.get('serial_no') or machine.get('serial_number') or '未設定'}")
                print(f"  製造年月: {machine.get('manufacture_year')}/{machine.get('manufacture_month') if machine.get('manufacture_month') else '未設定'}")
                
                # 圧力能力
                print("【圧力能力】")
                print(f"  圧力能力(kN): {machine.get('capacity_kn') or '未設定'}")
                print(f"  圧力能力(ton): {machine.get('capacity_ton') or '未設定'}")
                
                # ストローク
                print("【ストローク】")
                print(f"  最小spm: {machine.get('stroke_spm_min') or '未設定'}")
                print(f"  最大spm: {machine.get('stroke_spm_max') or '未設定'}")
                print(f"  ストローク長(mm): {machine.get('stroke_length_mm') or '未設定'}")
                
                # 寸法
                print("【寸法】")
                print(f"  ダイハイト(mm): {machine.get('die_height_mm') or '未設定'}")
                print(f"  スライド調整(mm): {machine.get('slide_adjust_mm') or '未設定'}")
                print(f"  スライド寸法 LR×FB: {machine.get('slide_size_lr_mm')}×{machine.get('slide_size_fb_mm')}")
                
                # 詳細項目のうち、データが入っているもの数をカウント
                detailed_fields = [
                    'capacity_kn', 'capacity_ton', 'stroke_spm_min', 'stroke_spm_max',
                    'stroke_length_mm', 'die_height_mm', 'slide_adjust_mm', 
                    'slide_size_lr_mm', 'slide_size_fb_mm', 'bolster_size_lr_mm',
                    'bolster_size_fb_mm', 'bolster_thickness_mm', 'max_down_speed_mm_s',
                    'stop_time_emergency_ms', 'inertia_drop_mm', 'motor_power_kw',
                    'air_pressure_mpa', 'ambient_temp_min_c', 'ambient_temp_max_c'
                ]
                
                filled_count = sum(1 for field in detailed_fields if machine.get(field) is not None)
                print(f"【詳細項目】{filled_count}/{len(detailed_fields)}項目に値が設定済み")
                
                if machine.get('notes'):
                    print(f"【メモ】{machine.get('notes')}")
                
        else:
            print("プレス機データが見つかりませんでした")
            
    except Exception as e:
        print(f"エラーが発生しました: {e}")

if __name__ == "__main__":
    check_detailed_data()