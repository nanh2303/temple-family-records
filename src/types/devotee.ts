export type DevoteeSearchRow = {
  id: string;
  family_registry_no: string | null;
  bhd_registry_no: string | null;
  full_name: string;
  dharma_name: string | null;
  birth_date: string | null;
  hometown: string | null;
  address: string | null;
  profile_picture_url: string | null;
  rank_score: number;
};

export type DevoteeRecord = {
  id: string;
  family_registry_no: string | null;
  bhd_registry_no: string | null;
  full_name: string;
  full_name_normalized: string;
  birth_date: string | null;
  birth_place: string | null;
  birth_place_normalized: string;
  dharma_name: string | null;
  dharma_name_normalized: string;
  address: string | null;
  address_normalized: string;
  hometown: string | null;
  hometown_normalized: string;
  joined_unit_date: string | null;
  vow_date: string | null;
  refuge_date: string | null;
  preceptor: string | null;
  father_name: string | null;
  mother_name: string | null;
  profile_picture_url: string | null;
  search_text: string;
  created_at: string;
  updated_at: string;
};

export type DevoteeTrainingRecord = {
  id: string;
  devotee_id: string;
  record_key: string | null;
  category: string;
  title: string;
  completed_date: string | null;
  decision_no: string | null;
  created_at: string;
};

export type DevoteeRole = {
  id: string;
  devotee_id: string;
  role_title: string;
  organization: string | null;
  start_date: string | null;
  end_date: string | null;
  note: string | null;
  created_at: string;
};

export type DevoteeNote = {
  id: string;
  devotee_id: string;
  note_type: "achievement" | "comment" | "other";
  content: string;
  created_at: string;
};

export type DevoteeAfterlifeInfo = {
  devotee_id: string;
  death_date: string | null;
  grave_location: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type DevoteeProfileBundle = {
  devotee: DevoteeRecord;
  training: DevoteeTrainingRecord[];
  roles: DevoteeRole[];
  notes: DevoteeNote[];
  afterlife: DevoteeAfterlifeInfo | null;
};
