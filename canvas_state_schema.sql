-- Canvas State Storage Schema for BuyPrintz
-- This stores user canvas states for persistence across sessions

-- Canvas States Table
CREATE TABLE IF NOT EXISTS canvas_states (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT, -- Optional: for temporary/guest sessions
    canvas_data JSONB NOT NULL, -- Complete canvas state
    banner_settings JSONB, -- Banner type, size, orientation settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'), -- Auto-cleanup
    is_checkout_session BOOLEAN DEFAULT false, -- Mark checkout-specific saves
    
    -- Ensure one active canvas state per user (unless multiple sessions)
    UNIQUE(user_id, session_id)
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_canvas_states_user_id ON canvas_states(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_states_session ON canvas_states(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_canvas_states_expires ON canvas_states(expires_at);
CREATE INDEX IF NOT EXISTS idx_canvas_states_checkout ON canvas_states(user_id, is_checkout_session);

-- Enable RLS
ALTER TABLE canvas_states ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can manage their own canvas states" ON canvas_states;
CREATE POLICY "Users can manage their own canvas states" ON canvas_states
    FOR ALL USING (auth.uid() = user_id);

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update timestamp trigger
DROP TRIGGER IF EXISTS update_canvas_states_updated_at ON canvas_states;
CREATE TRIGGER update_canvas_states_updated_at
    BEFORE UPDATE ON canvas_states
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Cleanup function for expired canvas states
CREATE OR REPLACE FUNCTION cleanup_expired_canvas_states()
RETURNS void AS $$
BEGIN
    DELETE FROM canvas_states WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Note: Automatic cleanup scheduling options:
-- 1. Manual: Call SELECT cleanup_expired_canvas_states(); periodically
-- 2. Edge Functions: Set up a Supabase Edge Function with a timer
-- 3. External cron: Use external service to call the cleanup function
-- 4. Application-level: Clean up expired states during normal operations

-- Optional: Enable pg_cron extension if you want automatic cleanup
-- (Only available on some Supabase plans - you can enable it in Database > Extensions)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule(
--     'cleanup-expired-canvas-states',
--     '0 2 * * *', -- Daily at 2 AM
--     'SELECT cleanup_expired_canvas_states();'
-- );

-- Comments for documentation
COMMENT ON TABLE canvas_states IS 'Stores user canvas states for persistence across sessions';
COMMENT ON COLUMN canvas_states.canvas_data IS 'Complete canvas state including elements, canvasSize, backgroundColor';
COMMENT ON COLUMN canvas_states.banner_settings IS 'Banner configuration: type, size, orientation, custom dimensions';
COMMENT ON COLUMN canvas_states.session_id IS 'Optional session identifier for temporary states';
COMMENT ON COLUMN canvas_states.is_checkout_session IS 'Marks states saved specifically for checkout flow';
COMMENT ON COLUMN canvas_states.expires_at IS 'Automatic cleanup after 7 days of inactivity';
