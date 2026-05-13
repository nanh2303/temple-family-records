-- Sample data for local development and staging testers.
-- Run after migrations (e.g. `supabase db reset` or SQL editor).

INSERT INTO public.devotees (
  family_registry_no,
  bhd_registry_no,
  full_name,
  birth_date,
  birth_place,
  dharma_name,
  address,
  hometown,
  joined_unit_date,
  vow_date,
  refuge_date,
  preceptor,
  father_name,
  mother_name
)
VALUES
  (
    'GP-1001',
    'BHD-5001',
    'Nguyễn Văn Dũng',
    '1990-03-15',
    'Quảng Ngãi',
    'Tâm Đức',
    '123 Lê Lợi, Quận 1, TP.HCM',
    'Quảng Ngãi',
    '2005-06-01',
    '2010-01-10',
    '2008-12-12',
    'HT. Thích Trí Tịnh',
    'Nguyễn Văn An',
    'Trần Thị Bích'
  ),
  (
    'GP-1002',
    'BHD-5002',
    'Trần Thị Mai',
    '1985-07-22',
    'Huế',
    'Diệu Hạnh',
    '45 Nguyễn Huệ, TP.HCM',
    'Quảng Ngãi',
    '2000-01-05',
    NULL,
    '1999-11-20',
    'SC. Thích Nữ Giới Hương',
    'Trần Văn Tài',
    'Lê Thị Lan'
  ),
  (
    'GP-1003',
    NULL,
    'Lê Hoàng Phát',
    '2001-11-02',
    'Đà Nẵng',
    NULL,
    '12 Hải Phòng, Đà Nẵng',
    'Đà Nẵng',
    NULL,
    NULL,
    NULL,
    NULL,
    'Lê Hoàng Nam',
    'Phạm Thuỳ Linh'
  );

WITH d AS (
  SELECT id, full_name FROM public.devotees WHERE full_name = 'Nguyễn Văn Dũng' LIMIT 1
)
INSERT INTO public.devotee_training_records (devotee_id, category, title, completed_date, decision_no)
SELECT
  d.id,
  v.category,
  v.title,
  v.completed_date::date,
  v.decision_no
FROM
  d
  CROSS JOIN (
    VALUES
      ('long_term', 'Đoàn sinh — Niên khóa 2005', '2006-05-01', 'QĐ-01/2006'),
      ('long_term', 'Huynh trưởng — Bậc Lực', '2012-08-20', 'QĐ-88/2012'),
      ('camp', 'Trại Đoàn sinh — Hạ trường', '2007-07-10', NULL),
      ('camp', 'Trại Huynh trưởng — Kỳ I', '2013-01-05', NULL),
      ('ordination_level', 'Cấp Sa Di', '2015-04-12', 'QĐ-120/2015')
  ) AS v(category, title, completed_date, decision_no);

WITH d AS (
  SELECT id FROM public.devotees WHERE full_name = 'Trần Thị Mai' LIMIT 1
)
INSERT INTO public.devotee_training_records (devotee_id, category, title, completed_date, decision_no)
SELECT
  d.id,
  v.category,
  v.title,
  v.completed_date::date,
  v.decision_no
FROM
  d
  CROSS JOIN (
    VALUES
      ('long_term', 'Đoàn sinh — Niên khóa 1998', '1999-06-01', NULL),
      ('camp', 'Trại Đoàn sinh — Đông', '2000-01-02', NULL)
  ) AS v(category, title, completed_date, decision_no);

WITH d AS (
  SELECT id FROM public.devotees WHERE full_name = 'Nguyễn Văn Dũng' LIMIT 1
)
INSERT INTO public.devotee_roles (devotee_id, role_title, organization, start_date, end_date, note)
SELECT
  d.id,
  v.role_title,
  v.organization,
  v.start_date::date,
  v.end_date::date,
  v.note
FROM
  d
  CROSS JOIN (
    VALUES
      ('Phó ban hướng dẫn', 'Đoàn GĐPT local', '2014-01-01', '2018-12-31', NULL),
      ('Trưởng ban', 'Ban văn hóa', '2019-01-01', NULL, 'Đương nhiệm')
  ) AS v(role_title, organization, start_date, end_date, note);

WITH d AS (
  SELECT id FROM public.devotees WHERE full_name = 'Nguyễn Văn Dũng' LIMIT 1
)
INSERT INTO public.devotee_notes (devotee_id, note_type, content)
SELECT
  d.id,
  v.note_type::text,
  v.content
FROM
  d
  CROSS JOIN (
    VALUES
      ('achievement', 'Tham gia tổ chức trại huấn luyện khu vực 2019.'),
      ('comment', 'Tích cực trong sinh hoạt đơn vị.'),
      ('other', 'Ưu tiên hỗ trợ in ấn gia phả.')
  ) AS v(note_type, content);
