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
          created_at: string
        }
        Insert: {
          user_id: string
          org_id?: string | null
          email?: string | null
          full_name?: string | null
          created_at?: string
        }
        Update: {
          user_id?: string
          org_id?: string | null
          email?: string | null
          full_name?: string | null
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
        }
      }
      maintenance_records: {
        Row: {
          id: number
          org_id: string
          press_id: number
          maintenance_datetime: string
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
          maintenance_datetime: string
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
          maintenance_datetime?: string
          overall_judgment?: string
          clutch_valve_replacement?: string
          brake_valve_replacement?: string
          remarks?: string | null
          created_at?: string
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
export type Profile = Database['public']['Tables']['profiles']['Row']

// フォーム用の型
export type PressMachineInsert = Database['public']['Tables']['press_machines']['Insert']
export type MaintenanceRecordInsert = Database['public']['Tables']['maintenance_records']['Insert']

// メンテナンス記録とプレス機の結合型
export type MaintenanceRecordWithMachine = MaintenanceRecord & {
  press_machines: Pick<PressMachine, 'machine_number' | 'manufacturer' | 'model_type'>
}