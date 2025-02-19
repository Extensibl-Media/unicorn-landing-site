// src/lib/blog.ts
import { createClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@/lib/supabase/browser';
import type { AstroCookies } from 'astro';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  featured_image: string | null;
  status: 'draft' | 'published' | 'archived' | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  views_count: number | null;
  tags?: Array<{
    id: string;
    name: string;
  }>;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface AdminPostsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'draft' | 'published' | 'archived' | 'all';
  sortBy?: 'created_at' | 'updated_at' | 'published_at' | 'title';
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
  tagId?: string;
}

// Function to get posts for public site
export async function getPosts(request: Request, cookies: AstroCookies, options?: {
  page?: number;
  limit?: number;
  tag?: string;
}) {
  const supabase = createClient(request, cookies);
  const {
    page = 1,
    limit = 10,
    tag
  } = options ?? {};

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('posts')
    .select(`
      *,
      tags!posts_tags (
        id,
        name
      )
    `, { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, to);

  if (tag) {
    query = query.contains('tags', [{ slug: tag }]);
  }

  const { data: posts, error, count } = await query;

  if (error) throw error;

  return {
    posts: posts || [],
    count: count || 0,
    totalPages: Math.ceil((count || 0) / limit)
  };
}

// Function to get a single post by slug
export async function getPostBySlug(request: Request, cookies: AstroCookies, slug: string) {
  const supabase = createClient(request, cookies);

  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      tags!posts_tags (
        id,
        name
      )
    `)
    .eq('slug', slug)
    .single();

  if (error) throw error;

  // Increment view count
  if (post) {
    await supabase.rpc('increment_post_views', { post_id: post.id });
  }

  return post;
}

// Function to get posts for admin dashboard
export async function getAdminPosts(request: Request, cookies: AstroCookies, options?: AdminPostsOptions) {
  const supabase = createClient(request, cookies);
  const {
    page = 1,
    limit = 50,
    search = '',
    status = 'all',
    sortBy = 'updated_at',
    sortOrder = 'desc',
    dateFrom,
    dateTo,
    tagId,
  } = options ?? {};

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('posts')
    .select(`
      *,
      tags!posts_tags (
        id,
        name
      )
    `, { count: 'exact' });

  if (search) {
    query = query.or(`title.ilike.%${search}%, content.ilike.%${search}%`);
  }

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  if (dateFrom) {
    query = query.gte(sortBy, dateFrom);
  }

  if (dateTo) {
    query = query.lte(sortBy, dateTo);
  }

  if (tagId) {
    query = query.contains('tags', [{ id: tagId }]);
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  query = query.range(from, to);

  const { data: posts, error, count } = await query;

  if (error) throw error;

  const processedPosts = posts?.map((post: Post) => ({
    ...post,
    excerpt: post.excerpt || post.content?.substring(0, 150) + '...',
    wordCount: post.content ? post.content.split(/\s+/).length : 0,
    hasImages: post.content?.includes('<img') || false,
    lastModified: post.updated_at,
    publishedDate: post.published_at,
    tagCount: post.tags?.length || 0,
    status: post.status,
    statusColor:
      post.status === 'published' ? 'green' :
        post.status === 'draft' ? 'yellow' :
          'gray',
    canPublish: post.status === 'draft' && post?.content && post.content?.length > 0,
    needsReview: post.status === 'draft' && (!post.excerpt || !post.seo_description)
  }));

  return {
    posts: processedPosts || [],
    count: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
    pagination: {
      current: page,
      pages: Math.ceil((count || 0) / limit),
      hasMore: (page * limit) < (count || 0),
      total: count || 0,
    },
    stats: {
      published: posts?.filter(p => p.status === 'published').length || 0,
      drafts: posts?.filter(p => p.status === 'draft').length || 0,
      archived: posts?.filter(p => p.status === 'archived').length || 0,
    }
  };
}

export async function createPost(request: Request, cookies: AstroCookies, post: {
  title: string;
  content?: string;
  excerpt?: string;
  featured_image?: string;
  status?: 'draft' | 'published';
  seo_title?: string;
  seo_description?: string;
  tags?: string[]; // Array of tag IDs
}) {
  const supabase = createClient(request, cookies);

  // Generate a temporary slug (will be replaced by trigger)
  const tempSlug = post.title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const { data: newPost, error: postError } = await supabase
    .from('posts')
    .insert({
      title: post.title,
      slug: tempSlug,
      content: post.content,
      excerpt: post.excerpt,
      featured_image: post.featured_image,
      status: post.status || 'draft',
      published_at: post.status === 'published' ? new Date().toISOString() : null,
      seo_title: post.seo_title,
      seo_description: post.seo_description,
    })
    .select()
    .single();

  if (postError) throw postError;

  // If there are tags, create the relationships
  if (post.tags?.length && newPost) {
    const tagRelations = post.tags.map(tagId => ({
      post_id: newPost.id,
      tag_id: tagId // Now just passing the ID string
    }));

    const { error: tagError } = await supabase
      .from('posts_tags')
      .insert(tagRelations);

    if (tagError) throw tagError;
  }

  return newPost;
}
export async function createPostClient(post: {
  title: string;
  content?: string;
  excerpt?: string;
  featured_image?: string;
  status?: 'draft' | 'published';
  seo_title?: string;
  seo_description?: string;
  tags?: string[]; // Array of tag IDs
}) {
  const supabase = createBrowserClient();

  // Generate a temporary slug (will be replaced by trigger)
  const tempSlug = post.title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const { data: newPost, error: postError } = await supabase
    .from('posts')
    .insert({
      title: post.title,
      slug: tempSlug,
      content: post.content,
      excerpt: post.excerpt,
      featured_image: post.featured_image,
      status: post.status || 'draft',
      published_at: post.status === 'published' ? new Date().toISOString() : null,
      seo_title: post.seo_title,
      seo_description: post.seo_description,
    })
    .select()
    .single();

  if (postError) throw postError;

  // If there are tags, create the relationships
  if (post.tags?.length && newPost) {
    const tagRelations = post.tags.map(tagId => ({
      post_id: newPost.id,
      tag_id: tagId // Now just passing the ID string
    }));

    const { error: tagError } = await supabase
      .from('posts_tags')
      .insert(tagRelations);

    if (tagError) throw tagError;
  }

  return newPost;
}

export async function updatePostClient(postId: string, updates: Partial<Post> & {
  tags?: string[]; // Array of tag IDs
}) {
  const supabase = createBrowserClient();

  const { data: updatedPost, error: postError } = await supabase
    .from('posts')
    .update({
      ...updates,
      published_at: updates.status === 'published' ? new Date().toISOString() : null,
    })
    .eq('id', postId)
    .select()
    .single();

  if (postError) throw postError;

  // If tags are included in the update, replace all existing tags
  if (updates.tags !== undefined && updatedPost) {
    const { error: deleteError } = await supabase
      .from('posts_tags')
      .delete()
      .eq('post_id', postId);

    if (deleteError) throw deleteError;

    if (updates.tags.length > 0) {
      const tagRelations = updates.tags.map(tag => ({
        post_id: postId,
        tag_id: tag.id // Now just passing the ID string
      }));

      const { error: tagError } = await supabase
        .from('posts_tags')
        .insert(tagRelations);

      if (tagError) throw tagError;
    }
  }

  return updatedPost;
}
export async function updatePost(request: Request, cookies: AstroCookies, postId: string, updates: Partial<Post> & {
  tags?: string[]; // Array of tag IDs
}) {
  const supabase = createClient(request, cookies);

  const { data: updatedPost, error: postError } = await supabase
    .from('posts')
    .update({
      ...updates,
      published_at: updates.status === 'published' ? new Date().toISOString() : null,
    })
    .eq('id', postId)
    .select()
    .single();

  if (postError) throw postError;

  // If tags are included in the update, replace all existing tags
  if (updates.tags !== undefined && updatedPost) {
    const { error: deleteError } = await supabase
      .from('posts_tags')
      .delete()
      .eq('post_id', postId);

    if (deleteError) throw deleteError;

    if (updates.tags.length > 0) {
      const tagRelations = updates.tags.map(tag => ({
        post_id: postId,
        tag_id: tag.id // Now just passing the ID string
      }));

      const { error: tagError } = await supabase
        .from('posts_tags')
        .insert(tagRelations);

      if (tagError) throw tagError;
    }
  }

  return updatedPost;
}

// Function to delete a post
export async function deletePost(request: Request, cookies: AstroCookies, postId: string) {
  const supabase = createClient(request, cookies);

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) throw error;

  return true;
}

// Function to get all tags
export async function getTags(request: Request, cookies: AstroCookies) {
  const supabase = createClient(request, cookies);

  const { data: tags, error } = await supabase
    .from('tags')
    .select('*')
    .order('name');

  if (error) throw error;

  return tags || [];
}

// Function to create a new tag
export async function createTag(request: Request, cookies: AstroCookies, tag: {
  name: string;
  description?: string;
}) {
  const supabase = createClient(request, cookies);

  // Generate a temporary slug (will be replaced by trigger)
  const tempSlug = tag.name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const { data: newTag, error } = await supabase
    .from('tags')
    .insert({
      name: tag.name,
      slug: tempSlug,
      description: tag.description
    })
    .select()
    .single();

  if (error) throw error;

  return newTag;
}