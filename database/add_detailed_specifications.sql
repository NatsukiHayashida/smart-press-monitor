-- プレス機テーブルに詳細仕様カラムを追加
-- 既存のpress_machinesテーブルを拡張

-- 詳細仕様カラムを追加
alter table public.press_machines 
add column if not exists maker text,                    -- メーカー（KOMATSUなど）
add column if not exists model text,                    -- 型式
add column if not exists serial_no text,                -- 製造番号
add column if not exists manufacture_year int,          -- 製造年
add column if not exists manufacture_month int,         -- 製造月

-- 圧力能力
add column if not exists capacity_kn numeric,           -- kN
add column if not exists capacity_ton numeric,          -- ton

-- ストローク
add column if not exists stroke_spm_min numeric,        -- spm(最小)
add column if not exists stroke_spm_max numeric,        -- spm(最大)
add column if not exists stroke_length_mm numeric,      -- mm

-- ダイハイト/スライド調整
add column if not exists die_height_mm numeric,         -- mm
add column if not exists slide_adjust_mm numeric,       -- mm

-- スライド寸法（左右×前後）
add column if not exists slide_size_lr_mm numeric,      -- mm
add column if not exists slide_size_fb_mm numeric,      -- mm

-- ボルスタ寸法（左右×前後×厚み）
add column if not exists bolster_size_lr_mm numeric,    -- mm
add column if not exists bolster_size_fb_mm numeric,    -- mm
add column if not exists bolster_thickness_mm numeric,  -- mm

-- 速度・停止関連
add column if not exists max_down_speed_mm_s numeric,   -- mm/s
add column if not exists stop_time_emergency_ms numeric, -- 急停止 ms
add column if not exists stop_time_twohand_ms numeric,  -- 両手操作 ms
add column if not exists stop_time_light_ms numeric,    -- 光線式 ms
add column if not exists inertia_drop_mm numeric,       -- 慣性下降 mm

-- 許容重量・環境
add column if not exists max_upper_die_weight_kg numeric, -- kg
add column if not exists ambient_temp_min_c numeric,     -- ℃
add column if not exists ambient_temp_max_c numeric,     -- ℃

-- 電気・空気
add column if not exists motor_power_kw numeric,        -- kW
add column if not exists power_spec_text text,          -- 例: "200V 3相 60Hz"
add column if not exists air_pressure_mpa numeric,      -- MPa
add column if not exists air_pressure_kgf_cm2 numeric,  -- kgf/cm²

-- オーバーラン監視 角度
add column if not exists overrun_angle_min_deg numeric,
add column if not exists overrun_angle_max_deg numeric,

-- メモ
add column if not exists notes text;

-- コメント追加
comment on column press_machines.maker is 'メーカー名（KOMATSU, AMADA, AIDA等）';
comment on column press_machines.model is '型式';
comment on column press_machines.serial_no is '製造番号';
comment on column press_machines.manufacture_year is '製造年（YYYY）';
comment on column press_machines.manufacture_month is '製造月（1-12）';
comment on column press_machines.capacity_kn is '圧力能力（kN）';
comment on column press_machines.capacity_ton is '圧力能力（ton）';
comment on column press_machines.stroke_spm_min is 'ストローク最小spm';
comment on column press_machines.stroke_spm_max is 'ストローク最大spm';
comment on column press_machines.stroke_length_mm is 'ストローク長（mm）';
comment on column press_machines.die_height_mm is 'ダイハイト（mm）';
comment on column press_machines.slide_adjust_mm is 'スライド調整量（mm）';
comment on column press_machines.slide_size_lr_mm is 'スライド寸法 左右（mm）';
comment on column press_machines.slide_size_fb_mm is 'スライド寸法 前後（mm）';
comment on column press_machines.bolster_size_lr_mm is 'ボルスタ寸法 左右（mm）';
comment on column press_machines.bolster_size_fb_mm is 'ボルスタ寸法 前後（mm）';
comment on column press_machines.bolster_thickness_mm is 'ボルスタ厚み（mm）';
comment on column press_machines.max_down_speed_mm_s is '最大下降速度（mm/s）';
comment on column press_machines.stop_time_emergency_ms is '急停止時間（ms）';
comment on column press_machines.stop_time_twohand_ms is '両手操作停止時間（ms）';
comment on column press_machines.stop_time_light_ms is '光線式停止時間（ms）';
comment on column press_machines.inertia_drop_mm is '慣性下降（mm）';
comment on column press_machines.max_upper_die_weight_kg is '上型最大重量（kg）';
comment on column press_machines.ambient_temp_min_c is '使用環境温度最小（℃）';
comment on column press_machines.ambient_temp_max_c is '使用環境温度最大（℃）';
comment on column press_machines.motor_power_kw is 'モーター出力（kW）';
comment on column press_machines.power_spec_text is '電源仕様';
comment on column press_machines.air_pressure_mpa is 'エア圧力（MPa）';
comment on column press_machines.air_pressure_kgf_cm2 is 'エア圧力（kgf/cm²）';
comment on column press_machines.overrun_angle_min_deg is 'オーバーラン監視角度最小（度）';
comment on column press_machines.overrun_angle_max_deg is 'オーバーラン監視角度最大（度）';
comment on column press_machines.notes is '備考・メモ';