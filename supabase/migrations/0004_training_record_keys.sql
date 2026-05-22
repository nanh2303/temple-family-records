-- Add stable keys for fixed training/camp/ordination fields on the official
-- Mau Gia Pha PDF. Older free-form rows can keep record_key NULL.

ALTER TABLE public.devotee_training_records
ADD COLUMN IF NOT EXISTS record_key text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_training_devotee_record_key
ON public.devotee_training_records (devotee_id, record_key)
WHERE record_key IS NOT NULL;

