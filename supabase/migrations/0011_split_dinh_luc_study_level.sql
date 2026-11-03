ALTER TABLE public.devotees
  DROP CONSTRAINT IF EXISTS devotees_current_study_level_check;

ALTER TABLE public.devotees
  ADD CONSTRAINT devotees_current_study_level_check
    CHECK (current_study_level IN (
      'SENNON', 'MỞ MẮT', 'CÁNH MỀM', 'CHÂN CỨNG', 'TUNG BAY',
      'HƯỚNG THIỆN', 'SƠ THIỆN', 'TRUNG THIỆN', 'CHÁNH THIỆN',
      'HÒA 1', 'HÒA 2', 'TRỰC', 'KIÊN', 'TRÌ', 'ĐỊNH', 'LỰC',
      'HOÀN TẤT', 'Không có'
    ));
