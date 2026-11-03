ALTER TABLE public.devotees
  ADD COLUMN current_unit_status text NOT NULL DEFAULT 'Không có'
    CHECK (current_unit_status IN (
      'TAMNGHI', 'GD', 'THANHNAM', 'THANHNU', 'THIEUNAM',
      'THIEUNU', 'OVNAM', 'OVNU', 'SENNON', 'Không có'
    )),
  ADD COLUMN current_study_level text NOT NULL DEFAULT 'Không có'
    CHECK (current_study_level IN (
      'SENNON', 'MỞ MẮT', 'CÁNH MỀM', 'CHÂN CỨNG', 'TUNG BAY',
      'HƯỚNG THIỆN', 'SƠ THIỆN', 'TRUNG THIỆN', 'CHÁNH THIỆN',
      'HÒA 1', 'HÒA 2', 'TRỰC', 'KIÊN', 'TRÌ', 'ĐỊNH', 'LỰC',
      'HOÀN TẤT', 'Không có'
    ));
