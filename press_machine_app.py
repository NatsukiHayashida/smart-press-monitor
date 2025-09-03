import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
import sqlite3
from datetime import datetime
import os
from tkinter import font as tkFont

class PressManagementApp:
    def __init__(self, root):
        self.root = root
        self.root.title("プレス機管理システム")
        self.root.geometry("1400x900")
        self.root.configure(bg='#f8fafc')  # 全体的に少し灰色がかった背景
        self.root.state('zoomed')  # Windows で最大化
        
        self.db_file = 'press_machine.db'
        
        # データベース接続確認
        if not os.path.exists(self.db_file):
            messagebox.showerror("エラー", "データベースファイルが見つかりません。\nsetup_database.py を実行してください。")
            return
        
        self.create_widgets()
        self.refresh_data()
    
    def create_widgets(self):
        # メインフレーム - 画面サイズに応じた適応的な余白を設定
        main_frame = tk.Frame(self.root, bg='#ffffff')
        main_frame.pack(fill=tk.BOTH, expand=True, padx=80, pady=50)
        
        # タイトルエリア - shadcn/UI: シンプルなヘッダー
        title_frame = tk.Frame(main_frame, bg='#ffffff')
        title_frame.pack(fill=tk.X, pady=(0, 24))
        
        # タイトル - shadcn/UI: 大きく太いタイポグラフィ
        title_label = tk.Label(title_frame, text="プレス機管理システム", 
                              font=('Yu Gothic UI', 32, 'bold'), bg='#ffffff', fg='#0f172a')
        title_label.pack(anchor='w')
        
        # サブタイトル - shadcn/UI: ミュートされたテキスト
        subtitle_label = tk.Label(title_frame, text="プレス機とメンテナンス記録の総合管理", 
                                font=('Yu Gothic UI', 14), bg='#ffffff', fg='#64748b')
        subtitle_label.pack(anchor='w', pady=(4, 0))
        
        # ノートブック（タブ）スタイル設定 - shadcn/UI: クリーンなタブ（左寄せ）
        self.style = ttk.Style()
        self.style.theme_use('clam')
        self.style.configure('TNotebook', 
                            background='#ffffff', 
                            borderwidth=0, 
                            tabposition='n',
                            tabmargins=[0, 0, 0, 0])  # タブマージンを0に設定
        self.style.configure('TNotebook.Tab', 
                            background='#f1f5f9', 
                            foreground='#64748b', 
                            padding=[20, 12], 
                            font=('Segoe UI', 11, 'normal'),
                            borderwidth=1,
                            relief='solid',
                            focuscolor='none')
        self.style.map('TNotebook.Tab', 
                      background=[('selected', '#0f172a'), ('active', '#e2e8f0')], 
                      foreground=[('selected', '#ffffff'), ('active', '#0f172a')],
                      bordercolor=[('selected', '#0f172a'), ('active', '#cbd5e1')],
                      padding=[('selected', [20, 12]), ('active', [20, 12])],  # 固定パディング
                      font=[('selected', ('Segoe UI', 11, 'bold')), ('active', ('Segoe UI', 11, 'normal'))])
        
        self.notebook = ttk.Notebook(main_frame)
        self.notebook.pack(fill=tk.BOTH, expand=True, anchor='w')
        
        # タブを左寄せにするために、ノートブック作成後にスタイルを再調整
        self.style.configure('TNotebook', 
                            background='#ffffff', 
                            borderwidth=0, 
                            tabposition='nw')  # 左上に配置
        
        # プレス機管理タブ
        self.create_machine_tab()
        
        # メンテナンス管理タブ
        self.create_maintenance_tab()
        
        # データ分析タブ
        self.create_analysis_tab()
    
    def create_machine_tab(self):
        # プレス機管理フレーム - shadcn/UI: 白背景
        machine_frame = tk.Frame(self.notebook, bg='#ffffff')
        self.notebook.add(machine_frame, text="プレス機管理")
        
        # 上部アクション & 検索エリア - コンテンツ内余白調整
        top_frame = tk.Frame(machine_frame, bg='#ffffff')
        top_frame.pack(fill=tk.X, padx=40, pady=(30, 0))
        
        # アクションボタンと検索を横並びに配置
        action_frame = tk.Frame(top_frame, bg='#ffffff')
        action_frame.pack(fill=tk.X, pady=(0, 8))
        
        # 左側: ボタンエリア
        button_frame = tk.Frame(action_frame, bg='#ffffff')
        button_frame.pack(side=tk.LEFT)
        
        # shadcn/UI スタイルボタン設定
        button_config_primary = {
            'font': ('Segoe UI', 10),
            'relief': tk.FLAT,
            'bd': 0,
            'padx': 16,
            'pady': 8,
            'bg': '#0f172a',
            'fg': '#ffffff',
            'activebackground': '#1e293b',
            'activeforeground': '#ffffff'
        }
        
        button_config_secondary = {
            'font': ('Segoe UI', 10),
            'relief': tk.FLAT,
            'bd': 1,
            'padx': 16,
            'pady': 8,
            'bg': '#ffffff',
            'fg': '#374151',
            'highlightbackground': '#e5e7eb',
            'activebackground': '#f9fafb',
            'activeforeground': '#374151'
        }
        
        # ボタン
        tk.Button(button_frame, text="+ 新規追加", command=self.add_machine, 
                 **button_config_primary).pack(side=tk.LEFT, padx=(0, 8))
        tk.Button(button_frame, text="編集", command=self.edit_machine,
                 **button_config_secondary).pack(side=tk.LEFT, padx=(0, 8))
        tk.Button(button_frame, text="削除", command=self.delete_machine,
                 **button_config_secondary).pack(side=tk.LEFT, padx=(0, 8))
        tk.Button(button_frame, text="更新", command=self.refresh_data,
                 **button_config_secondary).pack(side=tk.LEFT, padx=(0, 8))
        tk.Button(button_frame, text="印刷", command=self.print_machine_list,
                 **button_config_secondary).pack(side=tk.LEFT, padx=(0, 8))
        
        # 右側: 検索エリア
        search_frame = tk.Frame(action_frame, bg='#ffffff')
        search_frame.pack(side=tk.RIGHT)
        
        # 検索入力 - コンパクトに配置
        search_input_frame = tk.Frame(search_frame, bg='#ffffff')
        search_input_frame.pack()
        
        tk.Label(search_input_frame, text="検索:", font=('Segoe UI', 10), 
                bg='#ffffff', fg='#64748b').pack(side=tk.LEFT, padx=(0, 8))
        
        self.search_var = tk.StringVar()
        self.search_var.trace('w', self.on_search_change)
        search_entry = tk.Entry(search_input_frame, textvariable=self.search_var, 
                               font=('Segoe UI', 10), width=25,
                               bg='#ffffff', fg='#0f172a',
                               relief=tk.SOLID, bd=1,
                               highlightthickness=2,
                               highlightcolor='#0f172a',
                               highlightbackground='#e5e7eb')
        search_entry.pack(side=tk.LEFT)
        
        # テーブルコンテナ - コンテンツ内余白調整
        table_container = tk.Frame(machine_frame, bg='#ffffff')
        table_container.pack(fill=tk.BOTH, expand=True, padx=40, pady=(0, 30))
        
        # テーブルヘッダー - スペース節約のため削除
        
        # テーブル - カードスタイルで背景と境界線を改善
        list_frame = tk.Frame(table_container, bg='#f8fafc', relief=tk.SOLID, bd=1)
        list_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 8))
        
        columns = ('ID', '製造番号', '設備番号', 'メーカー', '型式', 'シリアル番号', '種別', 'グループ', 'トン数', '登録日')
        self.machine_tree = ttk.Treeview(list_frame, columns=columns, show='headings', height=22)
        
        # shadcn/UI: Treeviewスタイル - 交互行背景色とクリーンなデザイン
        self.style.configure('Treeview', 
                            background='#ffffff', 
                            foreground='#0f172a', 
                            font=('Segoe UI', 11), 
                            rowheight=42,
                            borderwidth=0,
                            relief='flat')
        self.style.configure('Treeview.Heading', 
                            background='#f8fafc', 
                            foreground='#374151', 
                            font=('Segoe UI', 11, 'bold'), 
                            borderwidth=1,
                            relief='solid')
        self.style.map('Treeview', 
                      background=[('selected', '#f1f5f9')],
                      foreground=[('selected', '#0f172a')])
        
        # 交互行の背景色設定
        self.machine_tree.tag_configure('oddrow', background='#ffffff')
        self.machine_tree.tag_configure('evenrow', background='#f8fafc')
        
        # カラム設定 - レスポンシブ対応で最小・最大幅を設定
        column_config = {
            'ID': {'width': 30, 'minwidth': 25, 'maxwidth': 45},
            '製造番号': {'width': 65, 'minwidth': 55, 'maxwidth': 90},
            '設備番号': {'width': 65, 'minwidth': 55, 'maxwidth': 90},
            'メーカー': {'width': 120, 'minwidth': 100, 'maxwidth': 180},
            '型式': {'width': 100, 'minwidth': 80, 'maxwidth': 150},
            'シリアル番号': {'width': 120, 'minwidth': 100, 'maxwidth': 180},
            '種別': {'width': 40, 'minwidth': 35, 'maxwidth': 55},
            'グループ': {'width': 50, 'minwidth': 40, 'maxwidth': 65},
            'トン数': {'width': 45, 'minwidth': 40, 'maxwidth': 60},
            '登録日': {'width': 90, 'minwidth': 80, 'maxwidth': 120}
        }
        
        for col in columns:
            self.machine_tree.heading(col, text=col)
            config = column_config[col]
            self.machine_tree.column(col, 
                                   width=config['width'], 
                                   minwidth=config['minwidth'],
                                   anchor='w',
                                   stretch=True)
        
        # 縦スクロールバーのみ - スタイリング改善
        scrollbar_v = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.machine_tree.yview)
        self.machine_tree.configure(yscrollcommand=scrollbar_v.set)
        
        # スクロールバーのスタイリング - shadcn/UI風
        self.style.configure('Vertical.TScrollbar',
                            background='#f8fafc',
                            troughcolor='#f1f5f9',
                            borderwidth=0,
                            arrowcolor='#64748b',
                            darkcolor='#e2e8f0',
                            lightcolor='#ffffff',
                            gripcount=0)
        self.style.map('Vertical.TScrollbar',
                      background=[('active', '#e2e8f0')])
        
        self.machine_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=8, pady=8)
        scrollbar_v.pack(side=tk.RIGHT, fill=tk.Y, padx=(4, 8), pady=8)
    
    def create_maintenance_tab(self):
        # メンテナンス管理フレーム - shadcn/UI: 白背景
        maintenance_frame = tk.Frame(self.notebook, bg='#ffffff')
        self.notebook.add(maintenance_frame, text="メンテナンス")
        
        # 上部アクション & 検索エリア - コンテンツ内余白調整
        top_frame = tk.Frame(maintenance_frame, bg='#ffffff')
        top_frame.pack(fill=tk.X, padx=40, pady=(30, 0))
        
        # アクションボタンエリア
        action_frame = tk.Frame(top_frame, bg='#ffffff')
        action_frame.pack(fill=tk.X, pady=(0, 8))
        
        # shadcn/UI スタイルボタン設定
        button_config_primary = {
            'font': ('Segoe UI', 10),
            'relief': tk.FLAT,
            'bd': 0,
            'padx': 16,
            'pady': 8,
            'bg': '#0f172a',
            'fg': '#ffffff',
            'activebackground': '#1e293b',
            'activeforeground': '#ffffff'
        }
        
        button_config_secondary = {
            'font': ('Segoe UI', 10),
            'relief': tk.FLAT,
            'bd': 1,
            'padx': 16,
            'pady': 8,
            'bg': '#ffffff',
            'fg': '#374151',
            'highlightbackground': '#e5e7eb',
            'activebackground': '#f9fafb',
            'activeforeground': '#374151'
        }
        
        # ボタン
        tk.Button(action_frame, text="+ 新規追加", command=self.add_maintenance,
                 **button_config_primary).pack(side=tk.LEFT, padx=(0, 8))
        tk.Button(action_frame, text="編集", command=self.edit_maintenance,
                 **button_config_secondary).pack(side=tk.LEFT, padx=(0, 8))
        tk.Button(action_frame, text="削除", command=self.delete_maintenance,
                 **button_config_secondary).pack(side=tk.LEFT, padx=(0, 8))
        tk.Button(action_frame, text="印刷", command=self.print_maintenance_list,
                 **button_config_secondary).pack(side=tk.LEFT, padx=(0, 8))
        
        # テーブルコンテナ - コンテンツ内余白調整
        table_container = tk.Frame(maintenance_frame, bg='#ffffff')
        table_container.pack(fill=tk.BOTH, expand=True, padx=40, pady=(0, 30))
        
        # テーブルヘッダー - スペース節約のため削除
        
        # メンテナンス記録リスト - カードスタイルで背景と境界線を改善
        maintenance_list_frame = tk.Frame(table_container, bg='#f8fafc', relief=tk.SOLID, bd=1)
        maintenance_list_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 8))
        
        m_columns = ('記録ID', '機械番号', 'メンテナンス日時', '総合判定', 'クラッチ弁', 'ブレーキ弁', '備考')
        self.maintenance_tree = ttk.Treeview(maintenance_list_frame, columns=m_columns, show='headings', height=18)
        
        # カラム設定 - レスポンシブ対応で最小・最大幅を設定
        m_column_config = {
            '記録ID': {'width': 50, 'minwidth': 40, 'maxwidth': 70},
            '機械番号': {'width': 80, 'minwidth': 70, 'maxwidth': 120},
            'メンテナンス日時': {'width': 130, 'minwidth': 120, 'maxwidth': 160},
            '総合判定': {'width': 70, 'minwidth': 60, 'maxwidth': 90},
            'クラッチ弁': {'width': 80, 'minwidth': 70, 'maxwidth': 110},
            'ブレーキ弁': {'width': 80, 'minwidth': 70, 'maxwidth': 110},
            '備考': {'width': 180, 'minwidth': 120, 'maxwidth': 300}
        }
        
        for col in m_columns:
            self.maintenance_tree.heading(col, text=col)
            config = m_column_config[col]
            self.maintenance_tree.column(col, 
                                       width=config['width'], 
                                       minwidth=config['minwidth'],
                                       anchor='w',
                                       stretch=True)
        
        # 交互行の背景色設定
        self.maintenance_tree.tag_configure('oddrow', background='#ffffff')
        self.maintenance_tree.tag_configure('evenrow', background='#f8fafc')
        
        # 縦スクロールバーのみ
        m_scrollbar_v = ttk.Scrollbar(maintenance_list_frame, orient=tk.VERTICAL, command=self.maintenance_tree.yview)
        self.maintenance_tree.configure(yscrollcommand=m_scrollbar_v.set)
        
        self.maintenance_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=8, pady=8)
        m_scrollbar_v.pack(side=tk.RIGHT, fill=tk.Y, padx=(4, 8), pady=8)
    
    def create_analysis_tab(self):
        # データ分析フレーム - shadcn/UI: 白背景
        analysis_frame = tk.Frame(self.notebook, bg='#ffffff')
        self.notebook.add(analysis_frame, text="データ分析")
        
        # 上部アクションエリア - コンテンツ内余白調整
        top_frame = tk.Frame(analysis_frame, bg='#ffffff')
        top_frame.pack(fill=tk.X, padx=40, pady=(30, 0))
        
        # アクションボタンエリア
        action_frame = tk.Frame(top_frame, bg='#ffffff')
        action_frame.pack(fill=tk.X, pady=(0, 8))
        
        # 更新ボタン - shadcn/UIスタイル
        tk.Button(action_frame, text="🔄 分析データ更新", command=self.update_analysis,
                 font=('Segoe UI', 10), relief=tk.FLAT, bd=0, padx=16, pady=8,
                 bg='#0f172a', fg='#ffffff', activebackground='#1e293b',
                 activeforeground='#ffffff').pack(side=tk.LEFT)
        
        # 統計情報コンテナ - コンテンツ内余白調整
        stats_container = tk.Frame(analysis_frame, bg='#ffffff')
        stats_container.pack(fill=tk.BOTH, expand=True, padx=40, pady=(0, 30))
        
        # 統計情報ヘッダー - スペース節約のため削除
        
        # 統計情報表示エリア - カードスタイルで背景と境界線を改善
        stats_frame = tk.Frame(stats_container, bg='#f8fafc', relief=tk.SOLID, bd=1)
        stats_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 8))
        
        self.stats_text = tk.Text(stats_frame, font=('Segoe UI', 11), 
                                 bg='#ffffff', fg='#0f172a', height=25,
                                 relief=tk.FLAT, bd=0, padx=16, pady=16)
        
        # 縦スクロールバーのみ
        stats_scrollbar = ttk.Scrollbar(stats_frame, orient=tk.VERTICAL, command=self.stats_text.yview)
        self.stats_text.configure(yscrollcommand=stats_scrollbar.set)
        
        self.stats_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=8, pady=8)
        stats_scrollbar.pack(side=tk.RIGHT, fill=tk.Y, padx=(4, 8), pady=8)
    
    def refresh_data(self):
        """データを更新"""
        self.load_machines()
        self.load_maintenance()
        self.update_analysis()
    
    def load_machines(self):
        """プレス機データを読み込み"""
        for item in self.machine_tree.get_children():
            self.machine_tree.delete(item)
        
        conn = sqlite3.connect(self.db_file)
        cursor = conn.cursor()
        
        cursor.execute("""
        SELECT db_id, machine_number, equipment_number, manufacturer, model_type, 
               serial_number, machine_type, production_group, tonnage, created_at 
        FROM press_machines ORDER BY db_id
        """)
        
        for i, row in enumerate(cursor.fetchall()):
            # 日付フォーマット調整
            created_at = row[9][:16] if row[9] else ""
            tonnage_str = f"{row[8]}t" if row[8] else ""
            formatted_row = row[:8] + (tonnage_str,) + (created_at,)
            
            # 交互行の背景色タグを設定
            tag = 'evenrow' if i % 2 == 0 else 'oddrow'
            self.machine_tree.insert('', tk.END, values=formatted_row, tags=(tag,))
        
        conn.close()
    
    def load_maintenance(self):
        """メンテナンス記録を読み込み"""
        for item in self.maintenance_tree.get_children():
            self.maintenance_tree.delete(item)
        
        conn = sqlite3.connect(self.db_file)
        cursor = conn.cursor()
        
        cursor.execute("""
        SELECT m.maintenance_id, p.machine_number, m.maintenance_datetime,
               m.overall_judgment, m.clutch_valve_replacement, m.brake_valve_replacement, m.remarks
        FROM maintenance_records m
        JOIN press_machines p ON m.db_id = p.db_id
        ORDER BY m.maintenance_datetime DESC
        """)
        
        for i, row in enumerate(cursor.fetchall()):
            # 日時フォーマット調整
            datetime_str = row[2][:16] if row[2] else ""
            formatted_row = (row[0], row[1], datetime_str, row[3], row[4], row[5], row[6] or "")
            
            # 交互行の背景色タグを設定
            tag = 'evenrow' if i % 2 == 0 else 'oddrow'
            self.maintenance_tree.insert('', tk.END, values=formatted_row, tags=(tag,))
        
        conn.close()
    
    def update_analysis(self):
        """統計情報を更新"""
        self.stats_text.delete(1.0, tk.END)
        
        conn = sqlite3.connect(self.db_file)
        cursor = conn.cursor()
        
        stats_text = "=" * 60 + "\n"
        stats_text += "プレス機管理システム - 統計情報\n"
        stats_text += "=" * 60 + "\n\n"
        
        # 総台数
        cursor.execute("SELECT COUNT(*) FROM press_machines")
        total_machines = cursor.fetchone()[0]
        stats_text += f"📊 総プレス機台数: {total_machines}台\n\n"
        
        # 種別別集計
        stats_text += "🏭 種別別集計\n"
        stats_text += "-" * 30 + "\n"
        cursor.execute("SELECT machine_type, COUNT(*) FROM press_machines GROUP BY machine_type")
        for row in cursor.fetchall():
            stats_text += f"  {row[0]}: {row[1]}台\n"
        
        # グループ別集計
        stats_text += "\n👥 生産グループ別集計\n"
        stats_text += "-" * 30 + "\n"
        cursor.execute("SELECT production_group, COUNT(*) FROM press_machines GROUP BY production_group ORDER BY production_group")
        for row in cursor.fetchall():
            stats_text += f"  グループ{row[0]}: {row[1]}台\n"
        
        # メンテナンス記録統計
        cursor.execute("SELECT COUNT(*) FROM maintenance_records")
        total_maintenance = cursor.fetchone()[0]
        stats_text += f"\n🔧 総メンテナンス記録数: {total_maintenance}件\n\n"
        
        # 最新メンテナンス状況
        stats_text += "🔍 最新メンテナンス実施状況\n"
        stats_text += "-" * 50 + "\n"
        cursor.execute("""
        SELECT p.machine_number, MAX(m.maintenance_datetime) as latest
        FROM press_machines p
        LEFT JOIN maintenance_records m ON p.db_id = m.db_id
        GROUP BY p.db_id, p.machine_number
        ORDER BY p.machine_number
        """)
        
        for row in cursor.fetchall():
            latest = row[1][:16] if row[1] else "未実施"
            stats_text += f"  {row[0]:>8s}: {latest}\n"
        
        # 電磁弁交換統計
        stats_text += "\n⚙️ 電磁弁交換統計\n"
        stats_text += "-" * 30 + "\n"
        cursor.execute("SELECT COUNT(*) FROM maintenance_records WHERE clutch_valve_replacement = '実施'")
        clutch_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM maintenance_records WHERE brake_valve_replacement = '実施'")
        brake_count = cursor.fetchone()[0]
        
        stats_text += f"  クラッチ弁交換: {clutch_count}件\n"
        stats_text += f"  ブレーキ弁交換: {brake_count}件\n"
        
        self.stats_text.insert(1.0, stats_text)
        conn.close()
    
    # CRUD操作メソッドは次のメッセージで続きます...
    def add_machine(self):
        """プレス機を新規追加"""
        dialog = MachineDialog(self.root, "新規プレス機登録")
        if dialog.result:
            conn = sqlite3.connect(self.db_file)
            cursor = conn.cursor()
            
            cursor.execute("""
            INSERT INTO press_machines 
            (machine_number, equipment_number, manufacturer, model_type, serial_number, machine_type, production_group)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, dialog.result)
            
            conn.commit()
            conn.close()
            messagebox.showinfo("成功", "プレス機を登録しました")
            self.refresh_data()
    
    def edit_machine(self):
        """プレス機情報を編集"""
        selection = self.machine_tree.selection()
        if not selection:
            messagebox.showwarning("警告", "編集する機械を選択してください")
            return
        
        item = self.machine_tree.item(selection[0])
        values = item['values']
        
        dialog = MachineDialog(self.root, "プレス機情報編集", values[1:8])
        if dialog.result:
            conn = sqlite3.connect(self.db_file)
            cursor = conn.cursor()
            
            cursor.execute("""
            UPDATE press_machines SET
            machine_number=?, equipment_number=?, manufacturer=?, model_type=?, 
            serial_number=?, machine_type=?, production_group=?, updated_at=?
            WHERE db_id=?
            """, dialog.result + (datetime.now().strftime('%Y-%m-%d %H:%M:%S'), values[0]))
            
            conn.commit()
            conn.close()
            messagebox.showinfo("成功", "プレス機情報を更新しました")
            self.refresh_data()
    
    def delete_machine(self):
        """プレス機を削除"""
        selection = self.machine_tree.selection()
        if not selection:
            messagebox.showwarning("警告", "削除する機械を選択してください")
            return
        
        item = self.machine_tree.item(selection[0])
        machine_id = item['values'][0]
        machine_number = item['values'][1]
        
        if messagebox.askyesno("確認", f"機械番号 {machine_number} を削除しますか？\n関連するメンテナンス記録も削除されます。"):
            conn = sqlite3.connect(self.db_file)
            cursor = conn.cursor()
            
            cursor.execute("DELETE FROM maintenance_records WHERE db_id=?", (machine_id,))
            cursor.execute("DELETE FROM press_machines WHERE db_id=?", (machine_id,))
            
            conn.commit()
            conn.close()
            messagebox.showinfo("成功", "プレス機を削除しました")
            self.refresh_data()
    
    def add_maintenance(self):
        """メンテナンス記録を追加"""
        dialog = MaintenanceDialog(self.root, self.db_file, "メンテナンス記録追加")
        if dialog.result:
            conn = sqlite3.connect(self.db_file)
            cursor = conn.cursor()
            
            cursor.execute("""
            INSERT INTO maintenance_records 
            (db_id, maintenance_datetime, overall_judgment, clutch_valve_replacement, brake_valve_replacement, remarks)
            VALUES (?, ?, ?, ?, ?, ?)
            """, dialog.result)
            
            conn.commit()
            conn.close()
            messagebox.showinfo("成功", "メンテナンス記録を追加しました")
            self.refresh_data()
    
    def edit_maintenance(self):
        """メンテナンス記録を編集"""
        selection = self.maintenance_tree.selection()
        if not selection:
            messagebox.showwarning("警告", "編集する記録を選択してください")
            return
        
        item = self.maintenance_tree.item(selection[0])
        values = item['values']
        maintenance_id = values[0]
        
        dialog = MaintenanceDialog(self.root, self.db_file, "メンテナンス記録編集", values[1:])
        if dialog.result:
            conn = sqlite3.connect(self.db_file)
            cursor = conn.cursor()
            
            cursor.execute("""
            UPDATE maintenance_records SET
            db_id=?, maintenance_datetime=?, overall_judgment=?, 
            clutch_valve_replacement=?, brake_valve_replacement=?, remarks=?
            WHERE maintenance_id=?
            """, dialog.result + (maintenance_id,))
            
            conn.commit()
            conn.close()
            messagebox.showinfo("成功", "メンテナンス記録を更新しました")
            self.refresh_data()
    
    def delete_maintenance(self):
        """メンテナンス記録を削除"""
        selection = self.maintenance_tree.selection()
        if not selection:
            messagebox.showwarning("警告", "削除する記録を選択してください")
            return
        
        item = self.maintenance_tree.item(selection[0])
        maintenance_id = item['values'][0]
        machine_number = item['values'][1]
        maintenance_date = item['values'][2]
        
        if messagebox.askyesno("確認", f"機械番号 {machine_number} の\n{maintenance_date} のメンテナンス記録を削除しますか？"):
            conn = sqlite3.connect(self.db_file)
            cursor = conn.cursor()
            
            cursor.execute("DELETE FROM maintenance_records WHERE maintenance_id=?", (maintenance_id,))
            
            conn.commit()
            conn.close()
            messagebox.showinfo("成功", "メンテナンス記録を削除しました")
            self.refresh_data()
    
    def print_machine_list(self):
        """プレス機一覧を印刷"""
        try:
            # 印刷用ウィンドウを作成
            print_window = tk.Toplevel(self.root)
            print_window.title("プレス機一覧印刷プレビュー")
            print_window.geometry("800x600")
            print_window.grab_set()
            
            # スクロールバー付きテキストエリア
            text_frame = tk.Frame(print_window)
            text_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
            
            text_widget = tk.Text(text_frame, font=('Courier', 9), wrap=tk.NONE)
            v_scrollbar = ttk.Scrollbar(text_frame, orient=tk.VERTICAL, command=text_widget.yview)
            h_scrollbar = ttk.Scrollbar(text_frame, orient=tk.HORIZONTAL, command=text_widget.xview)
            text_widget.configure(yscrollcommand=v_scrollbar.set, xscrollcommand=h_scrollbar.set)
            
            text_widget.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
            v_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
            h_scrollbar.pack(side=tk.BOTTOM, fill=tk.X)
            
            # データベースからデータ取得
            conn = sqlite3.connect(self.db_file)
            cursor = conn.cursor()
            
            cursor.execute("""
            SELECT db_id, machine_number, equipment_number, manufacturer, model_type, 
                   serial_number, machine_type, production_group, tonnage, created_at 
            FROM press_machines 
            ORDER BY 
            CASE 
                WHEN machine_number LIKE 'R-%' THEN 9999
                WHEN machine_number = '-' THEN 10000
                WHEN machine_number = '514' THEN 514
                ELSE CAST(machine_number AS INTEGER)
            END
            """)
            
            machines = cursor.fetchall()
            conn.close()
            
            # 印刷内容を生成
            print_content = self.generate_machine_print_content(machines)
            text_widget.insert(1.0, print_content)
            text_widget.configure(state='disabled')  # 読み取り専用
            
            # 印刷ボタン
            button_frame = tk.Frame(print_window)
            button_frame.pack(pady=10)
            
            tk.Button(button_frame, text="印刷実行", command=lambda: self.execute_print(text_widget),
                     bg='#3498db', fg='white', font=('Arial', 10, 'bold')).pack(side=tk.LEFT, padx=5)
            tk.Button(button_frame, text="閉じる", command=print_window.destroy,
                     bg='#95a5a6', fg='white', font=('Arial', 10, 'bold')).pack(side=tk.LEFT, padx=5)
            
        except Exception as e:
            messagebox.showerror("エラー", f"印刷プレビューの生成に失敗しました: {e}")
    
    def generate_machine_print_content(self, machines):
        """プレス機一覧の印刷内容を生成"""
        content = "=" * 100 + "\n"
        content += "プレス機管理システム - プレス機一覧\n"
        content += f"出力日時: {datetime.now().strftime('%Y年%m月%d日 %H:%M')}\n"
        content += "=" * 100 + "\n\n"
        
        # ヘッダー
        content += "ID | 製造番号 | 設備番号 | メーカー           | 型式              | シリアル番号      | 種別 | G  | トン数 | 登録日\n"
        content += "-" * 100 + "\n"
        
        # データ行
        for machine in machines:
            db_id, machine_number, equipment_number, manufacturer, model_type, serial_number, machine_type, production_group, tonnage, created_at = machine
            
            equipment_str = equipment_number[:8] if equipment_number else "未設定"
            manufacturer_str = manufacturer[:18] if manufacturer else "未設定"
            model_str = model_type[:16] if model_type else "未設定"
            serial_str = serial_number[:16] if serial_number else "未設定"
            tonnage_str = f"{tonnage}t" if tonnage else "未設定"
            created_str = created_at[:10] if created_at else "未設定"
            
            content += f"{db_id:2d} | {machine_number:8s} | {equipment_str:8s} | {manufacturer_str:18s} | {model_str:16s} | {serial_str:16s} | {machine_type:4s} | {production_group:2d} | {tonnage_str:6s} | {created_str}\n"
        
        # 統計情報
        content += "\n" + "=" * 100 + "\n"
        content += "統計情報\n"
        content += "=" * 100 + "\n"
        
        # グループ別・種別別集計
        conn = sqlite3.connect(self.db_file)
        cursor = conn.cursor()
        
        cursor.execute("""
        SELECT production_group, machine_type, COUNT(*) as count
        FROM press_machines 
        GROUP BY production_group, machine_type
        ORDER BY production_group, machine_type
        """)
        
        group_stats = cursor.fetchall()
        
        content += "\n【グループ別・種別別集計】\n"
        for stat in group_stats:
            content += f"  グループ{stat[0]} {stat[1]}: {stat[2]}台\n"
        
        # 総台数
        cursor.execute("SELECT COUNT(*) FROM press_machines")
        total_count = cursor.fetchone()[0]
        content += f"\n総台数: {total_count}台\n"
        
        conn.close()
        
        content += "\n" + "=" * 100 + "\n"
        
        return content
    
    def print_maintenance_list(self):
        """メンテナンス記録を印刷"""
        try:
            # 印刷用ウィンドウを作成
            print_window = tk.Toplevel(self.root)
            print_window.title("メンテナンス記録印刷プレビュー")
            print_window.geometry("800x600")
            print_window.grab_set()
            
            # スクロールバー付きテキストエリア
            text_frame = tk.Frame(print_window)
            text_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
            
            text_widget = tk.Text(text_frame, font=('Courier', 9), wrap=tk.NONE)
            v_scrollbar = ttk.Scrollbar(text_frame, orient=tk.VERTICAL, command=text_widget.yview)
            h_scrollbar = ttk.Scrollbar(text_frame, orient=tk.HORIZONTAL, command=text_widget.xview)
            text_widget.configure(yscrollcommand=v_scrollbar.set, xscrollcommand=h_scrollbar.set)
            
            text_widget.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
            v_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
            h_scrollbar.pack(side=tk.BOTTOM, fill=tk.X)
            
            # データベースからデータ取得
            conn = sqlite3.connect(self.db_file)
            cursor = conn.cursor()
            
            cursor.execute("""
            SELECT m.maintenance_id, p.machine_number, m.maintenance_datetime,
                   m.overall_judgment, m.clutch_valve_replacement, m.brake_valve_replacement, m.remarks
            FROM maintenance_records m
            JOIN press_machines p ON m.db_id = p.db_id
            ORDER BY m.maintenance_datetime DESC
            """)
            
            records = cursor.fetchall()
            conn.close()
            
            # 印刷内容を生成
            print_content = self.generate_maintenance_print_content(records)
            text_widget.insert(1.0, print_content)
            text_widget.configure(state='disabled')  # 読み取り専用
            
            # 印刷ボタン
            button_frame = tk.Frame(print_window)
            button_frame.pack(pady=10)
            
            tk.Button(button_frame, text="印刷実行", command=lambda: self.execute_print(text_widget),
                     bg='#3498db', fg='white', font=('Arial', 10, 'bold')).pack(side=tk.LEFT, padx=5)
            tk.Button(button_frame, text="閉じる", command=print_window.destroy,
                     bg='#95a5a6', fg='white', font=('Arial', 10, 'bold')).pack(side=tk.LEFT, padx=5)
            
        except Exception as e:
            messagebox.showerror("エラー", f"印刷プレビューの生成に失敗しました: {e}")
    
    def generate_maintenance_print_content(self, records):
        """メンテナンス記録の印刷内容を生成"""
        content = "=" * 100 + "\n"
        content += "プレス機管理システム - メンテナンス記録一覧\n"
        content += f"出力日時: {datetime.now().strftime('%Y年%m月%d日 %H:%M')}\n"
        content += "=" * 100 + "\n\n"
        
        # ヘッダー
        content += "記録ID | 製造番号 | メンテナンス日時    | 総合判定 | クラッチ弁 | ブレーキ弁 | 備考\n"
        content += "-" * 100 + "\n"
        
        # データ行
        for record in records:
            maintenance_id, machine_number, maintenance_datetime, overall_judgment, clutch_valve, brake_valve, remarks = record
            
            datetime_str = maintenance_datetime[:16] if maintenance_datetime else "未設定"
            judgment_str = overall_judgment[:8] if overall_judgment else "未設定"
            clutch_str = clutch_valve[:10] if clutch_valve else "未設定"
            brake_str = brake_valve[:10] if brake_valve else "未設定"
            remarks_str = remarks[:20] if remarks else ""
            
            content += f"{maintenance_id:6d} | {machine_number:8s} | {datetime_str:19s} | {judgment_str:8s} | {clutch_str:10s} | {brake_str:10s} | {remarks_str}\n"
        
        content += f"\n総メンテナンス記録数: {len(records)}件\n"
        content += "=" * 100 + "\n"
        
        return content
    
    def execute_print(self, text_widget):
        """印刷を実行"""
        try:
            # Windows の場合、notepad で印刷
            import tempfile
            import subprocess
            
            # 一時ファイルを作成
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
                content = text_widget.get(1.0, tk.END)
                f.write(content)
                temp_file = f.name
            
            # notepad で開いて印刷ダイアログを表示
            subprocess.run(['notepad', '/p', temp_file], check=True)
            
            # 印刷完了後に一時ファイルを削除
            os.unlink(temp_file)
            
            messagebox.showinfo("印刷", "印刷ジョブを送信しました")
            
        except subprocess.CalledProcessError:
            messagebox.showerror("エラー", "印刷に失敗しました")
        except Exception as e:
            messagebox.showerror("エラー", f"印刷実行エラー: {e}")
    
    def on_search_change(self, *args):
        """検索テキストが変更された時の処理"""
        search_text = self.search_var.get().lower()
        
        # 既存のアイテムをクリア
        for item in self.machine_tree.get_children():
            self.machine_tree.delete(item)
        
        # データベースから検索して表示
        conn = sqlite3.connect(self.db_file)
        cursor = conn.cursor()
        
        if search_text:
            cursor.execute("""
            SELECT db_id, machine_number, equipment_number, manufacturer, model_type, 
                   serial_number, machine_type, production_group, tonnage, created_at 
            FROM press_machines 
            WHERE LOWER(machine_number) LIKE ? OR 
                  LOWER(manufacturer) LIKE ? OR 
                  LOWER(model_type) LIKE ?
            ORDER BY 
            CASE 
                WHEN machine_number LIKE 'R-%' THEN 9999
                WHEN machine_number = '-' THEN 10000
                WHEN machine_number = '514' THEN 514
                ELSE CAST(machine_number AS INTEGER)
            END
            """, (f'%{search_text}%', f'%{search_text}%', f'%{search_text}%'))
        else:
            cursor.execute("""
            SELECT db_id, machine_number, equipment_number, manufacturer, model_type, 
                   serial_number, machine_type, production_group, tonnage, created_at 
            FROM press_machines 
            ORDER BY 
            CASE 
                WHEN machine_number LIKE 'R-%' THEN 9999
                WHEN machine_number = '-' THEN 10000
                WHEN machine_number = '514' THEN 514
                ELSE CAST(machine_number AS INTEGER)
            END
            """)
        
        for i, row in enumerate(cursor.fetchall()):
            # 日付フォーマット調整
            created_at = row[9][:16] if row[9] else ""
            tonnage_str = f"{row[8]}t" if row[8] else ""
            formatted_row = row[:8] + (tonnage_str,) + (created_at,)
            
            # 交互行の背景色タグを設定
            tag = 'evenrow' if i % 2 == 0 else 'oddrow'
            self.machine_tree.insert('', tk.END, values=formatted_row, tags=(tag,))
        
        conn.close()


class MachineDialog:
    def __init__(self, parent, title, initial_values=None):
        self.result = None
        
        self.dialog = tk.Toplevel(parent)
        self.dialog.title(title)
        self.dialog.geometry("500x450")
        self.dialog.resizable(False, False)
        self.dialog.grab_set()
        self.dialog.configure(bg='#ecf0f1')
        
        # 中央配置
        self.dialog.transient(parent)
        self.dialog.geometry("+%d+%d" % (parent.winfo_rootx() + 50, parent.winfo_rooty() + 50))
        
        self.create_widgets(initial_values)
        self.dialog.wait_window()
    
    def create_widgets(self, initial_values):
        # タイトルフレーム
        title_frame = tk.Frame(self.dialog, bg='#3498db', relief=tk.RAISED, bd=2)
        title_frame.pack(fill=tk.X)
        
        tk.Label(title_frame, text="🏭 プレス機情報", 
                font=('Yu Gothic UI', 16, 'bold'), bg='#3498db', fg='white').pack(pady=15)
        
        # フレーム作成
        main_frame = tk.Frame(self.dialog, bg='#ecf0f1', padx=25, pady=25)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 入力フィールド
        fields = [
            ("機械番号", "machine_number"),
            ("設備番号", "equipment_number"),
            ("メーカー", "manufacturer"),
            ("型式", "model_type"),
            ("シリアル番号", "serial_number"),
        ]
        
        self.entries = {}
        
        for i, (label_text, field_name) in enumerate(fields):
            tk.Label(main_frame, text=label_text + ":", font=('Yu Gothic UI', 11, 'bold'), 
                    bg='#ecf0f1', fg='#2c3e50').grid(row=i, column=0, sticky='w', pady=8)
            entry = tk.Entry(main_frame, font=('Yu Gothic UI', 11), width=28, 
                           relief=tk.SUNKEN, bd=2)
            entry.grid(row=i, column=1, padx=(15, 0), pady=8)
            self.entries[field_name] = entry
            
            if initial_values and i < len(initial_values):
                entry.insert(0, str(initial_values[i] or ""))
        
        # 種別選択
        tk.Label(main_frame, text="種別:", font=('Arial', 10)).grid(row=5, column=0, sticky='w', pady=5)
        self.machine_type_var = tk.StringVar()
        machine_type_combo = ttk.Combobox(main_frame, textvariable=self.machine_type_var, 
                                         values=['圧造', '汎用'], state='readonly', width=22)
        machine_type_combo.grid(row=5, column=1, padx=(10, 0), pady=5)
        if initial_values and len(initial_values) > 5:
            self.machine_type_var.set(initial_values[5] or '圧造')
        else:
            self.machine_type_var.set('圧造')
        
        # 生産グループ選択
        tk.Label(main_frame, text="生産グループ:", font=('Arial', 10)).grid(row=6, column=0, sticky='w', pady=5)
        self.production_group_var = tk.StringVar()
        group_combo = ttk.Combobox(main_frame, textvariable=self.production_group_var,
                                  values=['1', '2', '3'], state='readonly', width=22)
        group_combo.grid(row=6, column=1, padx=(10, 0), pady=5)
        if initial_values and len(initial_values) > 6:
            self.production_group_var.set(str(initial_values[6] or '1'))
        else:
            self.production_group_var.set('1')
        
        # ボタンフレーム
        button_frame = tk.Frame(main_frame, bg='#ecf0f1')
        button_frame.grid(row=7, column=0, columnspan=2, pady=25)
        
        tk.Button(button_frame, text="✅ 保存", command=self.ok_clicked, 
                 bg='#27ae60', fg='white', font=('Yu Gothic UI', 12, 'bold'), 
                 width=12, relief=tk.RAISED, bd=2, pady=8).pack(side=tk.LEFT, padx=10)
        tk.Button(button_frame, text="❌ キャンセル", command=self.cancel_clicked,
                 bg='#e74c3c', fg='white', font=('Yu Gothic UI', 12, 'bold'), 
                 width=12, relief=tk.RAISED, bd=2, pady=8).pack(side=tk.LEFT, padx=10)
    
    def ok_clicked(self):
        # 必須チェック
        if not self.entries['machine_number'].get().strip():
            messagebox.showerror("エラー", "機械番号は必須です")
            return
        
        self.result = (
            self.entries['machine_number'].get().strip(),
            self.entries['equipment_number'].get().strip() or None,
            self.entries['manufacturer'].get().strip() or None,
            self.entries['model_type'].get().strip() or None,
            self.entries['serial_number'].get().strip() or None,
            self.machine_type_var.get(),
            int(self.production_group_var.get())
        )
        self.dialog.destroy()
    
    def cancel_clicked(self):
        self.dialog.destroy()


class MaintenanceDialog:
    def __init__(self, parent, db_file, title, initial_values=None):
        self.result = None
        self.db_file = db_file
        
        self.dialog = tk.Toplevel(parent)
        self.dialog.title(title)
        self.dialog.geometry("500x400")
        self.dialog.resizable(False, False)
        self.dialog.grab_set()
        
        # 中央配置
        self.dialog.transient(parent)
        self.dialog.geometry("+%d+%d" % (parent.winfo_rootx() + 50, parent.winfo_rooty() + 50))
        
        self.create_widgets(initial_values)
        self.dialog.wait_window()
    
    def create_widgets(self, initial_values):
        main_frame = tk.Frame(self.dialog, padx=20, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # プレス機選択
        tk.Label(main_frame, text="プレス機:", font=('Arial', 10)).grid(row=0, column=0, sticky='w', pady=5)
        self.machine_var = tk.StringVar()
        
        # データベースからプレス機リストを取得
        conn = sqlite3.connect(self.db_file)
        cursor = conn.cursor()
        cursor.execute("SELECT db_id, machine_number FROM press_machines ORDER BY machine_number")
        machines = cursor.fetchall()
        conn.close()
        
        machine_values = [f"{machine[1]} (ID: {machine[0]})" for machine in machines]
        machine_combo = ttk.Combobox(main_frame, textvariable=self.machine_var,
                                   values=machine_values, state='readonly', width=30)
        machine_combo.grid(row=0, column=1, padx=(10, 0), pady=5)
        
        if initial_values and initial_values[0]:
            # 編集時は機械番号から選択
            for i, (machine_id, machine_number) in enumerate(machines):
                if machine_number == initial_values[0]:
                    machine_combo.current(i)
                    break
        
        # メンテナンス日時
        tk.Label(main_frame, text="メンテナンス日時:", font=('Arial', 10)).grid(row=1, column=0, sticky='w', pady=5)
        self.datetime_entry = tk.Entry(main_frame, font=('Arial', 10), width=32)
        self.datetime_entry.grid(row=1, column=1, padx=(10, 0), pady=5)
        
        if initial_values and len(initial_values) > 1:
            self.datetime_entry.insert(0, initial_values[1] or "")
        else:
            self.datetime_entry.insert(0, datetime.now().strftime('%Y-%m-%d %H:%M'))
        
        # 総合判定
        tk.Label(main_frame, text="総合判定:", font=('Arial', 10)).grid(row=2, column=0, sticky='w', pady=5)
        self.judgment_var = tk.StringVar()
        judgment_combo = ttk.Combobox(main_frame, textvariable=self.judgment_var,
                                    values=['良好', '要注意', '要修理', '異常'], state='readonly', width=29)
        judgment_combo.grid(row=2, column=1, padx=(10, 0), pady=5)
        
        if initial_values and len(initial_values) > 2:
            self.judgment_var.set(initial_values[2] or '良好')
        else:
            self.judgment_var.set('良好')
        
        # クラッチ弁交換
        tk.Label(main_frame, text="クラッチ弁交換:", font=('Arial', 10)).grid(row=3, column=0, sticky='w', pady=5)
        self.clutch_var = tk.StringVar()
        clutch_combo = ttk.Combobox(main_frame, textvariable=self.clutch_var,
                                   values=['未実施', '実施', '不要'], state='readonly', width=29)
        clutch_combo.grid(row=3, column=1, padx=(10, 0), pady=5)
        
        if initial_values and len(initial_values) > 3:
            self.clutch_var.set(initial_values[3] or '未実施')
        else:
            self.clutch_var.set('未実施')
        
        # ブレーキ弁交換
        tk.Label(main_frame, text="ブレーキ弁交換:", font=('Arial', 10)).grid(row=4, column=0, sticky='w', pady=5)
        self.brake_var = tk.StringVar()
        brake_combo = ttk.Combobox(main_frame, textvariable=self.brake_var,
                                  values=['未実施', '実施', '不要'], state='readonly', width=29)
        brake_combo.grid(row=4, column=1, padx=(10, 0), pady=5)
        
        if initial_values and len(initial_values) > 4:
            self.brake_var.set(initial_values[4] or '未実施')
        else:
            self.brake_var.set('未実施')
        
        # 備考
        tk.Label(main_frame, text="備考:", font=('Arial', 10)).grid(row=5, column=0, sticky='nw', pady=5)
        self.remarks_text = tk.Text(main_frame, font=('Arial', 10), width=30, height=6)
        self.remarks_text.grid(row=5, column=1, padx=(10, 0), pady=5)
        
        if initial_values and len(initial_values) > 5:
            self.remarks_text.insert(1.0, initial_values[5] or "")
        
        # ボタンフレーム
        button_frame = tk.Frame(main_frame)
        button_frame.grid(row=6, column=0, columnspan=2, pady=20)
        
        tk.Button(button_frame, text="OK", command=self.ok_clicked,
                 bg='#3498db', fg='white', font=('Arial', 10, 'bold'), width=10).pack(side=tk.LEFT, padx=5)
        tk.Button(button_frame, text="キャンセル", command=self.cancel_clicked,
                 bg='#95a5a6', fg='white', font=('Arial', 10, 'bold'), width=10).pack(side=tk.LEFT, padx=5)
    
    def ok_clicked(self):
        if not self.machine_var.get():
            messagebox.showerror("エラー", "プレス機を選択してください")
            return
        
        if not self.datetime_entry.get().strip():
            messagebox.showerror("エラー", "メンテナンス日時を入力してください")
            return
        
        # 機械IDを抽出
        machine_text = self.machine_var.get()
        machine_id = int(machine_text.split("ID: ")[1].split(")")[0])
        
        self.result = (
            machine_id,
            self.datetime_entry.get().strip(),
            self.judgment_var.get(),
            self.clutch_var.get(),
            self.brake_var.get(),
            self.remarks_text.get(1.0, tk.END).strip()
        )
        self.dialog.destroy()
    
    def cancel_clicked(self):
        self.dialog.destroy()


if __name__ == "__main__":
    root = tk.Tk()
    app = PressManagementApp(root)
    root.mainloop()