-- Create index on messages.read_at for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at);

-- Create indexes for conversation queries  
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
