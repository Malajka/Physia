export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  graphql_public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
  public: {
    Tables: {
      body_parts: {
        Row: {
          created_at: string;
          id: number;
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      disclaimers: {
        Row: {
          content: string;
          id: number;
          updated_at: string;
        };
        Insert: {
          content: string;
          id?: number;
          updated_at?: string;
        };
        Update: {
          content?: string;
          id?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      exercise_images: {
        Row: {
          created_at: string;
          exercise_id: number;
          file_path: string;
          id: number;
          metadata: Json | null;
        };
        Insert: {
          created_at?: string;
          exercise_id: number;
          file_path: string;
          id?: number;
          metadata?: Json | null;
        };
        Update: {
          created_at?: string;
          exercise_id?: number;
          file_path?: string;
          id?: number;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_images_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
        ];
      };
      exercises: {
        Row: {
          created_at: string;
          description: string;
          id: number;
          muscle_test_id: number;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: number;
          muscle_test_id: number;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: number;
          muscle_test_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "exercises_muscle_test_id_fkey";
            columns: ["muscle_test_id"];
            isOneToOne: false;
            referencedRelation: "muscle_tests";
            referencedColumns: ["id"];
          },
        ];
      };
      feedback_ratings: {
        Row: {
          rated_at: string | null;
          rating: number | null;
          session_id: number;
          user_id: string;
        };
        Insert: {
          rated_at?: string | null;
          rating?: number | null;
          session_id: number;
          user_id: string;
        };
        Update: {
          rated_at?: string | null;
          rating?: number | null;
          session_id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_ratings_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      generation_error_logs: {
        Row: {
          created_at: string;
          error_code: string;
          error_message: string;
          id: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          error_code: string;
          error_message: string;
          id?: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          error_code?: string;
          error_message?: string;
          id?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      muscle_tests: {
        Row: {
          body_part_id: number;
          created_at: string;
          description: string | null;
          id: number;
          name: string;
        };
        Insert: {
          body_part_id: number;
          created_at?: string;
          description?: string | null;
          id?: number;
          name: string;
        };
        Update: {
          body_part_id?: number;
          created_at?: string;
          description?: string | null;
          id?: number;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "muscle_tests_body_part_id_fkey";
            columns: ["body_part_id"];
            isOneToOne: false;
            referencedRelation: "body_parts";
            referencedColumns: ["id"];
          },
        ];
      };
      session_tests: {
        Row: {
          id: number;
          muscle_test_id: number;
          pain_intensity: number;
          session_id: number;
        };
        Insert: {
          id?: number;
          muscle_test_id: number;
          pain_intensity: number;
          session_id: number;
        };
        Update: {
          id?: number;
          muscle_test_id?: number;
          pain_intensity?: number;
          session_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "session_tests_muscle_test_id_fkey";
            columns: ["muscle_test_id"];
            isOneToOne: false;
            referencedRelation: "muscle_tests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_tests_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      sessions: {
        Row: {
          body_part_id: number;
          created_at: string;
          disclaimer_accepted_at: string;
          id: number;
          training_plan: Json;
          user_id: string;
        };
        Insert: {
          body_part_id: number;
          created_at?: string;
          disclaimer_accepted_at?: string;
          id?: number;
          training_plan: Json;
          user_id: string;
        };
        Update: {
          body_part_id?: number;
          created_at?: string;
          disclaimer_accepted_at?: string;
          id?: number;
          training_plan?: Json;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_body_part_id_fkey";
            columns: ["body_part_id"];
            isOneToOne: false;
            referencedRelation: "body_parts";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
