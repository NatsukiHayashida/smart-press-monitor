export interface Database {
  public: {
    Tables: {
      orgs: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          user_id: string
          org_id: string | null
          email: string | null
          full_name: string | null
          role: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          org_id?: string | null
          email?: string | null
          full_name?: string | null
          role?: string | null
          created_at?: string
        }
        Update: {
          user_id?: string
          org_id?: string | null
          email?: string | null
          full_name?: string | null
          role?: string | null
          created_at?: string
        }
      }
      press_machines: {
        Row: {
          id: number
          org_id: string
          machine_number: string
          equipment_number: string | null
          manufacturer: string | null
          model_type: string | null
          serial_number: string | null
          machine_type: string
          production_group: number
          tonnage: number | null
          created_at: string
          updated_at: string
          
          // 詳細仕様フィールド
          maker: string | null                    // メーカー（KOMATSUなど）
          model: string | null                    // 型式
          serial_no: string | null                // 製造番号
          manufacture_year: number | null         // 製造年
          manufacture_month: number | null        // 製造月
          
          // 圧力能力
          capacity_kn: number | null              // kN
          capacity_ton: number | null             // ton
          
          // ストローク
          stroke_spm_min: number | null           // spm(最小)
          stroke_spm_max: number | null           // spm(最大)
          stroke_length_mm: number | null         // mm
          
          // ダイハイト/スライド調整
          die_height_mm: number | null            // mm
          slide_adjust_mm: number | null          // mm
          
          // スライド寸法（左右×前後）
          slide_size_lr_mm: number | null         // mm
          slide_size_fb_mm: number | null         // mm
          
          // ボルスタ寸法（左右×前後×厚み）
          bolster_size_lr_mm: number | null       // mm
          bolster_size_fb_mm: number | null       // mm
          bolster_thickness_mm: number | null     // mm
          
          // 速度・停止関連
          max_down_speed_mm_s: number | null      // mm/s
          stop_time_emergency_ms: number | null   // 急停止 ms
          stop_time_twohand_ms: number | null     // 両手操作 ms
          stop_time_light_ms: number | null       // 光線式 ms
          inertia_drop_mm: number | null          // 慣性下降 mm
          
          // 許容重量・環境
          max_upper_die_weight_kg: number | null  // kg
          ambient_temp_min_c: number | null       // ℃
          ambient_temp_max_c: number | null       // ℃
          
          // 電気・空気
          motor_power_kw: number | null           // kW
          power_spec_text: string | null          // 例: "200V 3相 60Hz"
          air_pressure_mpa: number | null         // MPa
          air_pressure_kgf_cm2: number | null     // kgf/cm²
          
          // オーバーラン監視 角度
          overrun_angle_min_deg: number | null
          overrun_angle_max_deg: number | null
          
          // メモ
          notes: string | null
        }
        Insert: {
          id?: number
          org_id: string
          machine_number: string
          equipment_number?: string | null
          manufacturer?: string | null
          model_type?: string | null
          serial_number?: string | null
          machine_type?: string
          production_group?: number
          tonnage?: number | null
          created_at?: string
          updated_at?: string
          
          // 詳細仕様フィールド
          maker?: string | null
          model?: string | null
          serial_no?: string | null
          manufacture_year?: number | null
          manufacture_month?: number | null
          capacity_kn?: number | null
          capacity_ton?: number | null
          stroke_spm_min?: number | null
          stroke_spm_max?: number | null
          stroke_length_mm?: number | null
          die_height_mm?: number | null
          slide_adjust_mm?: number | null
          slide_size_lr_mm?: number | null
          slide_size_fb_mm?: number | null
          bolster_size_lr_mm?: number | null
          bolster_size_fb_mm?: number | null
          bolster_thickness_mm?: number | null
          max_down_speed_mm_s?: number | null
          stop_time_emergency_ms?: number | null
          stop_time_twohand_ms?: number | null
          stop_time_light_ms?: number | null
          inertia_drop_mm?: number | null
          max_upper_die_weight_kg?: number | null
          ambient_temp_min_c?: number | null
          ambient_temp_max_c?: number | null
          motor_power_kw?: number | null
          power_spec_text?: string | null
          air_pressure_mpa?: number | null
          air_pressure_kgf_cm2?: number | null
          overrun_angle_min_deg?: number | null
          overrun_angle_max_deg?: number | null
          notes?: string | null
        }
        Update: {
          id?: number
          org_id?: string
          machine_number?: string
          equipment_number?: string | null
          manufacturer?: string | null
          model_type?: string | null
          serial_number?: string | null
          machine_type?: string
          production_group?: number
          tonnage?: number | null
          created_at?: string
          updated_at?: string
          
          // 詳細仕様フィールド
          maker?: string | null
          model?: string | null
          serial_no?: string | null
          manufacture_year?: number | null
          manufacture_month?: number | null
          capacity_kn?: number | null
          capacity_ton?: number | null
          stroke_spm_min?: number | null
          stroke_spm_max?: number | null
          stroke_length_mm?: number | null
          die_height_mm?: number | null
          slide_adjust_mm?: number | null
          slide_size_lr_mm?: number | null
          slide_size_fb_mm?: number | null
          bolster_size_lr_mm?: number | null
          bolster_size_fb_mm?: number | null
          bolster_thickness_mm?: number | null
          max_down_speed_mm_s?: number | null
          stop_time_emergency_ms?: number | null
          stop_time_twohand_ms?: number | null
          stop_time_light_ms?: number | null
          inertia_drop_mm?: number | null
          max_upper_die_weight_kg?: number | null
          ambient_temp_min_c?: number | null
          ambient_temp_max_c?: number | null
          motor_power_kw?: number | null
          power_spec_text?: string | null
          air_pressure_mpa?: number | null
          air_pressure_kgf_cm2?: number | null
          overrun_angle_min_deg?: number | null
          overrun_angle_max_deg?: number | null
          notes?: string | null
        }
      }
      maintenance_records: {
        Row: {
          id: number
          org_id: string
          press_id: number
          maintenance_date: string
          overall_judgment: string
          clutch_valve_replacement: string
          brake_valve_replacement: string
          remarks: string | null
          created_at: string
        }
        Insert: {
          id?: number
          org_id: string
          press_id: number
          maintenance_date: string
          overall_judgment?: string
          clutch_valve_replacement?: string
          brake_valve_replacement?: string
          remarks?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          org_id?: string
          press_id?: number
          maintenance_date?: string
          overall_judgment?: string
          clutch_valve_replacement?: string
          brake_valve_replacement?: string
          remarks?: string | null
          created_at?: string
        }
      }
      maintenance_schedules: {
        Row: {
          id: number
          org_id: string
          press_id: number
          scheduled_date: string
          maintenance_type: string
          priority: string
          planned_work: string | null
          estimated_duration: number | null
          assigned_technician: string | null
          status: string
          completed_at: string | null
          completed_maintenance_record_id: number | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: number
          org_id: string
          press_id: number
          scheduled_date: string
          maintenance_type?: string
          priority?: string
          planned_work?: string | null
          estimated_duration?: number | null
          assigned_technician?: string | null
          status?: string
          completed_at?: string | null
          completed_maintenance_record_id?: number | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: number
          org_id?: string
          press_id?: number
          scheduled_date?: string
          maintenance_type?: string
          priority?: string
          planned_work?: string | null
          estimated_duration?: number | null
          assigned_technician?: string | null
          status?: string
          completed_at?: string | null
          completed_maintenance_record_id?: number | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
    }
    Views: {
      user_org_access: {
        Row: {
          user_id: string | null
          email: string | null
          full_name: string | null
          org_id: string | null
          org_name: string | null
        }
      }
    }
  }
}

export type PressMachine = Database['public']['Tables']['press_machines']['Row']
export type MaintenanceRecord = Database['public']['Tables']['maintenance_records']['Row']
export type MaintenanceSchedule = Database['public']['Tables']['maintenance_schedules']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']

// フォーム用の型
export type PressMachineInsert = Database['public']['Tables']['press_machines']['Insert']
export type MaintenanceRecordInsert = Database['public']['Tables']['maintenance_records']['Insert']
export type MaintenanceScheduleInsert = Database['public']['Tables']['maintenance_schedules']['Insert']

// メンテナンス記録とプレス機の結合型
export type MaintenanceRecordWithMachine = MaintenanceRecord & {
  press_machines: Pick<PressMachine, 'machine_number' | 'manufacturer' | 'model_type'>
}

// メンテナンス予定とプレス機の結合型
export type MaintenanceScheduleWithMachine = MaintenanceSchedule & {
  press_machines: Pick<PressMachine, 'machine_number' | 'manufacturer' | 'model_type'>
}