-- Add viewed_at column to taps table if it doesn't exist
ALTER TABLE public.taps ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ;

-- Add index for faster queries on unviewed taps
CREATE INDEX IF NOT EXISTS idx_taps_recipient_unviewed ON public.taps(recipient_id) WHERE viewed_at IS NULL;
