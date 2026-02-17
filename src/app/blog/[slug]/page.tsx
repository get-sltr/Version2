import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 300; // ISR: revalidate every 5 minutes

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  meta_description: string | null;
  featured_image_url: string | null;
  tags: string[];
  categories: string[];
  author: string;
  status: string;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getPost(slug: string): Promise<BlogPost | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) return null;
  return data;
}

// Generate static params for build-time generation
export async function generateStaticParams() {
  const supabase = getSupabase();

  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(100);

  return (data || []).map((post) => ({ slug: post.slug }));
}

// Dynamic metadata for SEO + Open Graph
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: 'Post Not Found | Primal' };
  }

  const title = post.og_title || post.title;
  const description = post.meta_description || post.excerpt || `${post.title} — Read on the Primal blog.`;
  const image = post.og_image_url || post.featured_image_url;

  return {
    title: `${post.title} | Primal Blog`,
    description,
    openGraph: {
      title,
      description: post.og_description || description,
      type: 'article',
      url: `https://primalgay.com/blog/${post.slug}`,
      siteName: 'Primal',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: [post.author],
      tags: post.tags,
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: post.title }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description: post.og_description || description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function estimateReadTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const readTime = estimateReadTime(post.content);

  // JSON-LD structured data for Google rich results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta_description || post.excerpt || '',
    image: post.featured_image_url || undefined,
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Primal',
      url: 'https://primalgay.com',
    },
    datePublished: post.published_at,
    dateModified: post.updated_at,
    mainEntityOfPage: `https://primalgay.com/blog/${post.slug}`,
    keywords: post.tags.join(', '),
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: "var(--font-dm-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" }}>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header style={{ padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', zIndex: 100 }}>
        <a href="/" style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: '28px', fontWeight: 700, letterSpacing: '0.1em', textDecoration: 'none', color: '#FF6B35' }}>PRIMAL</a>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="/blog" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '10px', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>Blog</a>
          <a href="/login" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '10px', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>Log in</a>
          <a href="/signup" style={{ fontSize: '13px', color: '#fff', background: '#FF6B35', padding: '10px 20px', textDecoration: 'none', fontWeight: 600, borderRadius: '4px', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>Sign up</a>
        </div>
      </header>

      {/* Article */}
      <article style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>

        {/* Back link */}
        <a href="/blog" style={{ fontSize: '13px', color: '#FF6B35', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '32px' }}>
          &larr; Back to Blog
        </a>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {post.tags.map((tag) => (
              <span key={tag} style={{ fontSize: '11px', color: '#FF6B35', background: 'rgba(255,107,53,0.12)', padding: '4px 10px', borderRadius: '100px', fontWeight: 500 }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif", fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 600, lineHeight: 1.2, color: '#fff', marginBottom: '16px' }}>
          {post.title}
        </h1>

        {/* Meta line */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '40px', flexWrap: 'wrap' }}>
          <span>{post.author}</span>
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
          <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
          <span>{readTime} min read</span>
        </div>

        {/* Featured image */}
        {post.featured_image_url && (
          <div style={{ marginBottom: '40px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.featured_image_url}
              alt={post.title}
              style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'auto' }}
            />
          </div>
        )}

        {/* Content */}
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Footer */}
      <footer style={{ padding: '40px 30px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '20px' }}>
          <a href="/blog" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>Blog</a>
          <a href="/about" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>About</a>
          <a href="/privacy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>Privacy</a>
          <a href="/terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>Terms</a>
        </div>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>&copy; 2025&ndash;2026 Primal. All rights reserved.</p>
      </footer>
    </div>
  );
}
