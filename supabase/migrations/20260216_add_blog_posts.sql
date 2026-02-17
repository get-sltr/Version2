-- =============================================================================
-- Blog Posts & Webhook Log
--
-- Stores SEO blog content published via webhook from BabyLoveGrowth.ai.
-- Public SELECT on published posts; all writes via service role (webhook).
-- =============================================================================

-- Table: blog_posts
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Content
    title TEXT NOT NULL,
    slug VARCHAR(300) UNIQUE NOT NULL,
    content TEXT NOT NULL,          -- HTML content from BabyLoveGrowth.ai
    excerpt TEXT,                   -- Short summary for cards/meta
    meta_description TEXT,          -- SEO meta description

    -- Media
    featured_image_url TEXT,

    -- Taxonomy
    tags TEXT[] DEFAULT '{}',
    categories TEXT[] DEFAULT '{}',

    -- Attribution
    author VARCHAR(200) DEFAULT 'Primal',

    -- Status: draft, published, archived
    status VARCHAR(20) NOT NULL DEFAULT 'draft',

    -- Open Graph fields
    og_title TEXT,
    og_description TEXT,
    og_image_url TEXT,

    -- Timestamps
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts (status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts (published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN (tags);

-- Table: blog_webhook_log (idempotency & debugging)
CREATE TABLE IF NOT EXISTS blog_webhook_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Idempotency key — caller-provided or generated from slug
    event_id VARCHAR(300) UNIQUE NOT NULL,

    -- What happened
    event_type VARCHAR(50) NOT NULL,   -- 'create', 'update', 'archive'

    -- References
    slug VARCHAR(300),
    post_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL,

    -- Safe summary of the payload (no full HTML)
    payload_summary JSONB DEFAULT '{}',

    -- Processing result
    processed_successfully BOOLEAN DEFAULT FALSE,
    error_message TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_webhook_log_slug ON blog_webhook_log (slug);

-- RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_webhook_log ENABLE ROW LEVEL SECURITY;

-- Public read access to published blog posts (no auth required)
CREATE POLICY "Public can read published blog posts"
    ON blog_posts FOR SELECT
    USING (status = 'published');

-- blog_webhook_log is server-side only (service role).
-- No user-facing RLS policies needed.
