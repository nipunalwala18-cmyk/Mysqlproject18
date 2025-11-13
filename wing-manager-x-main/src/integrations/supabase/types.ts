export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      aircraft: {
        Row: {
          created_at: string | null
          id: string
          model: string
          seat_map: Json | null
          total_seats: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          model: string
          seat_map?: Json | null
          total_seats: number
        }
        Update: {
          created_at?: string | null
          id?: string
          model?: string
          seat_map?: Json | null
          total_seats?: number
        }
        Relationships: []
      }
      airports: {
        Row: {
          city: string
          country: string
          created_at: string | null
          iata_code: string
          name: string
          timezone: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string | null
          iata_code: string
          name: string
          timezone: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string | null
          iata_code?: string
          name?: string
          timezone?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_status: string | null
          created_at: string | null
          flight_id: string
          id: string
          passenger_email: string
          passenger_name: string
          passenger_phone: string | null
          payment_status: string | null
          pnr: string
          seat_number: string
          total_amount: number
          user_id: string
        }
        Insert: {
          booking_status?: string | null
          created_at?: string | null
          flight_id: string
          id?: string
          passenger_email: string
          passenger_name: string
          passenger_phone?: string | null
          payment_status?: string | null
          pnr: string
          seat_number: string
          total_amount: number
          user_id: string
        }
        Update: {
          booking_status?: string | null
          created_at?: string | null
          flight_id?: string
          id?: string
          passenger_email?: string
          passenger_name?: string
          passenger_phone?: string | null
          payment_status?: string | null
          pnr?: string
          seat_number?: string
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
        ]
      }
      flights: {
        Row: {
          aircraft_id: string
          arrival_time: string
          available_seats: number | null
          base_fare: number
          created_at: string | null
          departure_time: string
          flight_date: string
          flight_no: string
          id: string
          route_id: string
          status: string | null
        }
        Insert: {
          aircraft_id: string
          arrival_time: string
          available_seats?: number | null
          base_fare: number
          created_at?: string | null
          departure_time: string
          flight_date: string
          flight_no: string
          id?: string
          route_id: string
          status?: string | null
        }
        Update: {
          aircraft_id?: string
          arrival_time?: string
          available_seats?: number | null
          base_fare?: number
          created_at?: string | null
          departure_time?: string
          flight_date?: string
          flight_no?: string
          id?: string
          route_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flights_aircraft_id_fkey"
            columns: ["aircraft_id"]
            isOneToOne: false
            referencedRelation: "aircraft"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flights_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          loyalty_points: number | null
          nationality: string | null
          passport_no: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id: string
          loyalty_points?: number | null
          nationality?: string | null
          passport_no?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          loyalty_points?: number | null
          nationality?: string | null
          passport_no?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      routes: {
        Row: {
          created_at: string | null
          destination: string
          distance_km: number
          id: string
          origin: string
        }
        Insert: {
          created_at?: string | null
          destination: string
          distance_km: number
          id?: string
          origin: string
        }
        Update: {
          created_at?: string | null
          destination?: string
          distance_km?: number
          id?: string
          origin?: string
        }
        Relationships: [
          {
            foreignKeyName: "routes_destination_fkey"
            columns: ["destination"]
            isOneToOne: false
            referencedRelation: "airports"
            referencedColumns: ["iata_code"]
          },
          {
            foreignKeyName: "routes_origin_fkey"
            columns: ["origin"]
            isOneToOne: false
            referencedRelation: "airports"
            referencedColumns: ["iata_code"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_pnr: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "passenger"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "passenger"],
    },
  },
} as const
