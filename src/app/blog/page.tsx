import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import Link from 'next/link';

export const revalidate = 300; // ISR: revalidate every 5 minutes

export const metadata: Metadata = {
  title: 'Blog | Primal',
  description: 'Stories, guides, and insights for gay and bisexual men. Relationships, dating tips, community, and more.',
  openGraph: {
    title: 'Blog | Primal',
    description: 'Stories, guides, and insights for gay and bisexual men.',
    type: 'website',
    url: 'https://primalgay.com/blog',
    siteName: 'Primal',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Primal',
    description: 'Stories, guides, and insights for gay and bisexual men.',
  },
};

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  tags: string[];
  author: string;
  published_at: string;
}

async function getBlogPosts(): Promise<BlogPost[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, featured_image_url, tags, author, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[Blog] Failed to fetch posts:', error);
    return [];
  }

  return data || [];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: "var(--font-dm-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" }}>

      {/* Header */}
      <header style={{ padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', zIndex: 100 }}>
        <a href="/" style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: '28px', fontWeight: 700, letterSpacing: '0.1em', textDecoration: 'none', color: '#FF6B35' }}>PRIMAL</a>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '10px', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>Home</a>
          <a href="/login" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '10px', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>Log in</a>
          <a href="/signup" style={{ fontSize: '13px', color: '#fff', background: '#FF6B35', padding: '10px 20px', textDecoration: 'none', fontWeight: 600, borderRadius: '4px', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>Sign up</a>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,107,53,0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <p style={{ fontSize: '12px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#FF6B35', marginBottom: '16px', fontWeight: 500 }}>
          Primal Blog
        </p>
        <h1 style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 600, marginBottom: '16px', color: '#fff' }}>
          Stories & Insights
        </h1>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
          Guides, perspectives, and real talk for gay and bisexual men.
        </p>
      </section>

      {/* Posts Grid */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px' }}>
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'rgba(255,255,255,0.4)' }}>
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>No posts yet.</p>
            <p style={{ fontSize: '14px' }}>Check back soon for new content.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <article style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s, transform 0.2s',
                }}>
                  {post.featured_image_url && (
                    <div style={{ width: '100%', height: '200px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'auto' }}
                      />
                    </div>
                  )}
                  <div style={{ padding: '24px' }}>
                    {post.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        {post.tags.slice(0, 3).map((tag) => (
                          <span key={tag} style={{ fontSize: '11px', color: '#FF6B35', background: 'rgba(255,107,53,0.12)', padding: '4px 10px', borderRadius: '100px', fontWeight: 500 }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '8px', lineHeight: 1.3 }}>
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.excerpt}
                      </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                      <span>{post.author}</span>
                      <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ padding: '40px 30px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '20px' }}>
          <a href="/about" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>About</a>
          <a href="/privacy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>Privacy</a>
          <a href="/terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>Terms</a>
        </div>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>&copy; 2025&ndash;2026 Primal. All rights reserved.</p>
      </footer>
    </div>
  );
}
