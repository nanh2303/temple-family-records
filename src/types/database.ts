import type {
  DevoteeAfterlifeInfo,
  DevoteeNote,
  DevoteeRecord,
  DevoteeRole,
  DevoteeSearchRow,
  DevoteeTrainingRecord,
} from "./devotee";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      devotees: {
        Row: DevoteeRecord;
        Insert: Partial<DevoteeRecord> & { full_name: string };
        Update: Partial<DevoteeRecord>;
      };
      devotee_training_records: {
        Row: DevoteeTrainingRecord;
        Insert: Omit<DevoteeTrainingRecord, "id" | "created_at" | "record_key"> & {
          id?: string;
          record_key?: string | null;
        };
        Update: Partial<DevoteeTrainingRecord>;
      };
      devotee_roles: {
        Row: DevoteeRole;
        Insert: Omit<DevoteeRole, "id" | "created_at"> & { id?: string };
        Update: Partial<DevoteeRole>;
      };
      devotee_notes: {
        Row: DevoteeNote;
        Insert: Omit<DevoteeNote, "id" | "created_at"> & { id?: string };
        Update: Partial<DevoteeNote>;
      };
      devotee_afterlife_info: {
        Row: DevoteeAfterlifeInfo;
        Insert: Omit<DevoteeAfterlifeInfo, "created_at" | "updated_at">;
        Update: Partial<DevoteeAfterlifeInfo>;
      };
    };
    Functions: {
      search_devotees: {
        Args: { query_text: string };
        Returns: DevoteeSearchRow[];
      };
    };
  };
};
